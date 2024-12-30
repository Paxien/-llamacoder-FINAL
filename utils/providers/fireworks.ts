import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class FireworksProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.FIREWORKS_API_KEY) {
      throw new Error('FIREWORKS_API_KEY is required for Fireworks provider');
    }

    this.client = new OpenAI({
      apiKey: process.env.FIREWORKS_API_KEY,
      baseURL: 'https://api.fireworks.ai/inference/v1',
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
        top_p: 1,
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
            console.error('Error in Fireworks stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Fireworks provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Fireworks model names
    const modelMap: Record<string, string> = {
      'llama-v2-7b': 'accounts/fireworks/models/llama-v2-7b-chat',
      'llama-v2-13b': 'accounts/fireworks/models/llama-v2-13b-chat',
      'llama-v2-70b': 'accounts/fireworks/models/llama-v2-70b-chat',
      'mistral-7b': 'accounts/fireworks/models/mistral-7b-instruct',
      'mixtral-8x7b': 'accounts/fireworks/models/mixtral-8x7b-instruct',
      'zephyr-7b': 'accounts/fireworks/models/zephyr-7b-beta',
      'qwen-72b': 'accounts/fireworks/models/qwen-72b-chat',
    };
    return modelMap[model] || model;
  }
}
