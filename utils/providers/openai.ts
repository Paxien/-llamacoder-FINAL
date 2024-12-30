import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream> {
    const response = await this.client.chat.completions.create({
      ...params,
      model: this.mapModel(params.model),
      stream: true,
    });

    // Convert OpenAI stream to ReadableStream
    return new ReadableStream({
      async start(controller) {
        for await (const part of response) {
          const content = part.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });
  }

  private mapModel(model: string): string {
    // Map from our internal model names to OpenAI model names
    const modelMap: Record<string, string> = {
      'gpt-4-turbo': 'gpt-4-1106-preview',
      'gpt-4': 'gpt-4',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
    };
    return modelMap[model] || model;
  }
}
