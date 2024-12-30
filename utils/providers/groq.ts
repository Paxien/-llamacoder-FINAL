import OpenAI from 'openai';
import { AIProvider, ChatCompletionParams } from './types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class GroqProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is required for Groq provider');
    }

    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  async createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream> {
    try {
      // Add code-specific instructions to system message
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: "You are a code generation assistant. Generate properly formatted code with appropriate line breaks and indentation. Do not include markdown formatting, backticks, or language indicators. Each line of code should be on its own line with proper newline characters."
        },
        ...params.messages.map((message) => ({
          role: message.role as "user" | "assistant" | "system",
          content: message.role === "user"
            ? message.content + "\nPlease generate properly formatted code with line breaks and indentation. NO backticks or language names."
            : message.content
        }))
      ];

      const response = await this.client.chat.completions.create({
        model: this.mapModel(params.model),
        messages,
        stream: true,
        temperature: 0.2,
        max_tokens: 4096,
        frequency_penalty: 0,
        presence_penalty: 0,
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
            console.error('Error in Groq stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Groq provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Groq model names
    const modelMap: Record<string, string> = {
      'llama2-70b': 'llama2-70b-4096',
      'mixtral-8x7b': 'mixtral-8x7b-32768',
      'gemma-7b': 'gemma-7b-it',
    };
    return modelMap[model] || model;
  }
}
