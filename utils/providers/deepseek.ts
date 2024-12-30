import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class DeepseekProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is required for Deepseek provider');
    }

    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1'
    });
  }

  async createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream> {
    try {
      // Add code-specific instructions to system message
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: "You are a code generation assistant. Generate properly formatted code with appropriate line breaks and indentation. Do not include markdown formatting, backticks, or language indicators."
        },
        ...params.messages.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        }))
      ];

      const response = await this.client.chat.completions.create({
        model: this.mapModel(params.model),
        messages,
        temperature: 0.2,
        max_tokens: 4096,
        stream: true,
      });

      return new ReadableStream({
        async start(controller) {
          try {
            for await (const part of response) {
              const content = part.choices[0]?.delta?.content || '';
              if (content) {
                // Ensure line breaks are preserved
                const formattedContent = content.replace(/\\n/g, '\n');
                controller.enqueue(new TextEncoder().encode(formattedContent));
              }
            }
            controller.close();
          } catch (error) {
            console.error('Error in Deepseek stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Deepseek provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Deepseek model names
    const modelMap: Record<string, string> = {
      'deepseek-coder-33b': 'deepseek-ai/deepseek-coder-33b-instruct',
      'deepseek-coder-6.7b': 'deepseek-ai/deepseek-coder-6.7b-instruct',
      'deepseek-chat-67b': 'deepseek-ai/deepseek-chat-67b',
      'deepseek-chat-7b': 'deepseek-ai/deepseek-chat-7b',
    };
    return modelMap[model] || model;
  }
}
