export class StreamHandler {
  private onContent: (content: string) => void;
  private onEnd: () => void;
  private decoder: TextDecoder;
  private buffer: string;

  constructor(
    onContent: (content: string) => void,
    onEnd: () => void
  ) {
    this.onContent = onContent;
    this.onEnd = onEnd;
    this.decoder = new TextDecoder();
    this.buffer = '';
  }

  async handleStream(response: Response) {
    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (this.buffer) {
            this.processChunk(this.buffer);
          }
          this.onEnd();
          break;
        }

        const chunk = this.decoder.decode(value, { stream: true });
        this.buffer += chunk;
        this.processBuffer();
      }
    } catch (error) {
      console.error('Error reading stream:', error);
      throw error;
    }
  }

  private processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      this.processChunk(line + '\n'); // Add newline back
    }
  }

  private processChunk(chunk: string) {
    if (!chunk.trim()) return;

    try {
      if (chunk.startsWith('data: ')) {
        chunk = chunk.slice(5);
      }

      if (chunk === '[DONE]') {
        return;
      }

      let content = '';
      try {
        const data = JSON.parse(chunk);
        content = data.choices?.[0]?.delta?.content || data.choices?.[0]?.text || '';
      } catch {
        // If JSON parsing fails, treat the chunk as raw content
        content = chunk;
      }
      
      if (content) {
        // Preserve line breaks in the content
        content = content.replace(/\\n/g, '\n');
        this.onContent(content);
      }
    } catch (error) {
      console.warn('Error processing chunk:', chunk, error);
    }
  }
}
