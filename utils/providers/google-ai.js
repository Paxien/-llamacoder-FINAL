import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function generateGoogleAIResponse(prompt, model = "gemini-pro") {
  try {
    const modelInstance = genAI.getGenerativeModel({ model });
    const result = await modelInstance.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating Google AI response:", error);
    throw error;
  }
}

export async function generateGoogleAIChatResponse(messages, model = "gemini-pro") {
  try {
    const modelInstance = genAI.getGenerativeModel({ model });
    const chat = modelInstance.startChat();
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating Google AI chat response:", error);
    throw error;
  }
}
