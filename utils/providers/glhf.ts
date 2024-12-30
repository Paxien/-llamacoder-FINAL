import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class GLHFProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.GLHF_API_KEY) {
      throw new Error('GLHF_API_KEY is required for GLHF provider');
    }

    this.client = new OpenAI({
      apiKey: process.env.GLHF_API_KEY,
      baseURL: 'https://glhf.chat/api/openai/v1'
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

      // Ensure model name has 'hf:' prefix
      const formattedModel = this.mapModel(params.model);

      const response = await this.client.chat.completions.create({
        model: formattedModel,
        messages,
        temperature: 0.2,
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
            console.error('Error in GLHF stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in GLHF provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to GLHF model names
    const modelMap: Record<string, string> = {
      'mistral-7b': 'hf:mistralai/Mistral-7B-Instruct-v0.3',
      'llama-2-7b': 'hf:meta-llama/Llama-2-7b-chat-hf',
      'llama-2-13b': 'hf:meta-llama/Llama-2-13b-chat-hf',
      'llama-2-70b': 'hf:meta-llama/Llama-2-70b-chat-hf',
      'codellama-34b': 'hf:codellama/CodeLlama-34b-Instruct-hf',
      'mixtral-8x7b': 'hf:mistralai/Mixtral-8x7B-Instruct-v0.1',
    };

    const mappedModel = modelMap[model] || model;
    return mappedModel.startsWith('hf:') ? mappedModel : `hf:${mappedModel}`;
  }
}
