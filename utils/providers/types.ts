export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionParams {
  model: string;
  messages: Message[];
  stream: boolean;
  temperature: number;
}

export interface AIProvider {
  createChatCompletion(params: ChatCompletionParams): Promise<ReadableStream>;
}
