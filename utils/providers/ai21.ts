import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class AI21Provider implements AIProvider {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    if (!process.env.AI21_API_KEY) {
      throw new Error('AI21_API_KEY is required for AI21 provider');
    }
    this.apiKey = process.env.AI21_API_KEY;
    this.baseURL = 'https://api.ai21.com/studio/v1';
  }

  async createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream> {
    try {
      // Convert chat messages to prompt
      const prompt = params.messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const response = await fetch(`${this.baseURL}/${this.mapModel(params.model)}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          maxTokens: 4096,
          temperature: 0.2,
          topP: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI21 API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      return new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                controller.close();
                break;
              }

              const text = new TextDecoder().decode(value);
              try {
                const data = JSON.parse(text);
                const content = data.completions?.[0]?.data?.text || '';
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch (e) {
                // If JSON parsing fails, treat as raw text
                controller.enqueue(value);
              }
            }
          } catch (error) {
            console.error('Error in AI21 stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          reader.cancel();
        }
      });
    } catch (error) {
      console.error('Error in AI21 provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to AI21 model names
    const modelMap: Record<string, string> = {
      'j2-ultra': 'j2-ultra',
      'j2-mid': 'j2-mid',
      'j2-light': 'j2-light',
    };
    return modelMap[model] || model;
  }
}
