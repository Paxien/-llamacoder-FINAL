import { GoogleGenerativeAI } from "@google/generative-ai";

export const initializeGeminiChat = (config = {}) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: config.model || "gemini-1.5-flash",
    generationConfig: {
      temperature: config.temperature || 0.7,
      maxOutputTokens: config.maxOutputTokens || 1000,
      candidateCount: 1,
      ...config
    },
  });
};

export async function generateGeminiResponse(messages, config = {}) {
  try {
    const model = initializeGeminiChat(config);
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    });

    const result = await chat.sendMessageStream(messages[messages.length - 1].content);
    return result.stream;
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    throw error;
  }
}
