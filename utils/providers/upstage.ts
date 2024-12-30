import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class UpstageProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.UPSTAGE_API_KEY) {
      throw new Error('UPSTAGE_API_KEY is required for Upstage provider');
    }

    this.client = new OpenAI({
      apiKey: process.env.UPSTAGE_API_KEY,
      baseURL: 'https://api.upstage.ai/v1'
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
            console.error('Error in Upstage stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Upstage provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Upstage model names
    const modelMap: Record<string, string> = {
      'solar-0-70b': 'upstage/solar-0-70b-16bit',
      'starling-lm-7b': 'upstage/starling-lm-7b-alpha',
      'nous-hermes-llama2-70b': 'upstage/nous-hermes-llama2-70b',
      'platypus2-70b': 'upstage/platypus2-70b-instruct',
      'starling-lm-alpha': 'upstage/starling-lm-alpha',
    };
    return modelMap[model] || model;
  }
}
