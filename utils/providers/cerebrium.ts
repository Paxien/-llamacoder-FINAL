import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class CerebriumProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.CEREBRIUM_API_KEY) {
      throw new Error('CEREBRIUM_API_KEY is required for Cerebrium provider');
    }
    if (!process.env.CEREBRIUM_PROJECT_ID) {
      throw new Error('CEREBRIUM_PROJECT_ID is required for Cerebrium provider');
    }
    if (!process.env.CEREBRIUM_ENDPOINT_NAME) {
      throw new Error('CEREBRIUM_ENDPOINT_NAME is required for Cerebrium provider');
    }

    const projectId = process.env.CEREBRIUM_PROJECT_ID;
    const endpointName = process.env.CEREBRIUM_ENDPOINT_NAME;

    this.client = new OpenAI({
      apiKey: process.env.CEREBRIUM_API_KEY,
      baseURL: `https://${projectId}.${endpointName}.inference.ai.cerebrium.ai/v1`
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
            console.error('Error in Cerebrium stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Cerebrium provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Cerebrium model names
    const modelMap: Record<string, string> = {
      'llama-2-70b': 'meta-llama/llama-2-70b-chat',
      'llama-2-13b': 'meta-llama/llama-2-13b-chat',
      'llama-2-7b': 'meta-llama/llama-2-7b-chat',
      'codellama-34b': 'codellama/codellama-34b-instruct',
      'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
    };
    return modelMap[model] || model;
  }
}
