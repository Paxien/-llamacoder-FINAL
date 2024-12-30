import { CohereClientV2 } from 'cohere-ai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class CohereProvider implements AIProvider {
  private client: CohereClientV2;

  constructor() {
    if (!process.env.COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY is required for Cohere provider');
    }
    this.client = new CohereClientV2({
      token: process.env.COHERE_API_KEY
    });
  }

  async createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream> {
    try {
      // Add code-specific instructions to system message
      const messages = [
        {
          role: "system",
          content: "You are a code generation assistant. Generate properly formatted code with appropriate line breaks and indentation. Do not include markdown formatting, backticks, or language indicators."
        },
        ...params.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const response = await this.client.chat({
        model: this.mapModel(params.model),
        temperature: 0.2,
        stream: true,
        messages: messages.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        }))
      });

      return new ReadableStream({
        async start(controller) {
          try {
            if ('stream' in response) {
              for await (const chunk of response.stream) {
                const content = chunk.text;
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              }
            } else {
              const content = response.text;
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            controller.close();
          } catch (error) {
            console.error('Error in Cohere stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Cohere provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Cohere model names
    const modelMap: Record<string, string> = {
      'command': 'command',
      'command-light': 'command-light',
      'command-r': 'command-r',
      'command-r-light': 'command-r-light',
      'command-nightly': 'command-nightly',
      'command-light-nightly': 'command-light-nightly',
    };
    return modelMap[model] || model;
  }
}
