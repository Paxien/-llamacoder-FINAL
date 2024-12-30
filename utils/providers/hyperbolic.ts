import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class HyperbolicProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.HYPERBOLIC_API_KEY) {
      throw new Error('HYPERBOLIC_API_KEY is required for Hyperbolic provider');
    }

    this.client = new OpenAI({
      apiKey: process.env.HYPERBOLIC_API_KEY,
      baseURL: 'https://api.hyperbolic.ai/v1'
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
            console.error('Error in Hyperbolic stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Hyperbolic provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Hyperbolic model names
    const modelMap: Record<string, string> = {
      'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
      'mistral-7b': 'mistralai/mistral-7b-instruct',
      'llama-2-70b': 'meta-llama/llama-2-70b-chat',
      'llama-2-13b': 'meta-llama/llama-2-13b-chat',
      'codellama-34b': 'codellama/codellama-34b-instruct',
    };
    return modelMap[model] || model;
  }
}
