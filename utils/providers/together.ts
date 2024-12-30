import Together from "together-ai";
import { AIProvider, ChatCompletionParams } from "./types";

export class TogetherProvider implements AIProvider {
  private client: Together;

  constructor() {
    if (!process.env.TOGETHER_API_KEY) {
      throw new Error('TOGETHER_API_KEY is required for Together provider');
    }

    const options: ConstructorParameters<typeof Together>[0] = {
      apiKey: process.env.TOGETHER_API_KEY,
    };

    if (process.env.HELICONE_API_KEY) {
      options.baseURL = "https://together.helicone.ai/v1";
      options.defaultHeaders = {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      };
    }

    this.client = new Together(options);
  }

  async createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream> {
    try {
      const response = await this.client.chat.completions.create({
        ...params,
        messages: params.messages.map((message) => ({
          ...message,
          content:
            message.role === "user"
              ? message.content + "\nPlease ONLY return code, NO backticks or language names."
              : message.content,
        })),
      });

      // Convert stream to ReadableStream
      return new ReadableStream({
        async start(controller) {
          try {
            if (Symbol.asyncIterator in response) {
              for await (const part of response as any) {
                const content = part.choices?.[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              }
            }
            controller.close();
          } catch (error) {
            console.error('Error in Together stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Together provider:', error);
      throw error;
    }
  }
}
