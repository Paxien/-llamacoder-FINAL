import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class OpenRouterProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPEN_ROUTER_API_KEY) {
      throw new Error('OPEN_ROUTER_API_KEY is required for OpenRouter provider');
    }

    const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'AI Chat App';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    this.client = new OpenAI({
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': SITE_URL,
        'X-Title': APP_NAME
      }
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
            console.error('Error in OpenRouter stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in OpenRouter provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to OpenRouter model names
    const modelMap: Record<string, string> = {
      'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
      'gpt-4': 'openai/gpt-4',
      'claude-2': 'anthropic/claude-2',
      'claude-instant': 'anthropic/claude-instant',
      'palm-2': 'google/palm-2',
      'command-light': 'cohere/command-light',
      'command': 'cohere/command',
      'llama-2-70b': 'meta-llama/llama-2-70b',
      'llama-2-13b': 'meta-llama/llama-2-13b',
      'llama-2-7b': 'meta-llama/llama-2-7b',
    };
    return modelMap[model] || model;
  }
}
