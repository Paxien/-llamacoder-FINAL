import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AIProvider, ChatCompletionParams } from './types';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required for Gemini provider');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  }

  async createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: this.mapModel(params.model),
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
          candidateCount: 1,
        },
      });

      const chat = model.startChat({
        history: params.messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      });

      const result = await chat.sendMessageStream(params.messages[params.messages.length - 1].content);
      
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const content = chunk.text();
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            controller.close();
          } catch (error) {
            console.error('Error in Gemini stream:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle cancellation if needed
        }
      });
    } catch (error) {
      console.error('Error in Gemini provider:', error);
      throw error;
    }
  }

  private mapModel(model: string): string {
    // Map from our internal model names to Gemini model names
    const modelMap: Record<string, string> = {
      'gemini-pro': 'gemini-1.5-pro',
      'gemini-pro-vision': 'gemini-1.5-pro-vision',
      'gemini-ultra': 'gemini-1.5-ultra',
    };
    return modelMap[model] || model;
  }
}
