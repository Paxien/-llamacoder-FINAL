import { AIProvider } from "./types";
import { TogetherProvider } from "./together";
import { OpenAIProvider } from "./openai";
import { GroqProvider } from "./groq";
import { MistralProvider } from "./mistral";
import { AI21Provider } from "./ai21";
import { GeminiProvider } from "./gemini";
import { CohereProvider } from "./cohere";
import { OpenRouterProvider } from "./openrouter";
import { FireworksProvider } from "./fireworks";
import { GLHFProvider } from "./glhf";
import { SambaNovaProvider } from "./sambanova";
import { UpstageProvider } from "./upstage";
import { EdenAIProvider } from "./eden-ai";
import { CerebriumProvider } from "./cerebrium";
import { DeepseekProvider } from "./deepseek";
import { HyperbolicProvider } from "./hyperbolic";

export type ProviderType = 
  | 'together' 
  | 'openai' 
  | 'groq' 
  | 'mistral' 
  | 'ai21' 
  | 'gemini'
  | 'cohere'
  | 'openrouter'
  | 'fireworks'
  | 'glhf'
  | 'sambanova'
  | 'upstage'
  | 'edenai'
  | 'cerebrium'
  | 'deepseek'
  | 'hyperbolic';

export function createProvider(model: string): AIProvider {
  const [provider] = model.split("/");

  switch (provider) {
    case 'together':
      return new TogetherProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'groq':
      return new GroqProvider();
    case 'mistral':
      return new MistralProvider();
    case 'ai21':
      return new AI21Provider();
    case 'gemini':
      return new GeminiProvider();
    case 'cohere':
      return new CohereProvider();
    case 'openrouter':
      return new OpenRouterProvider();
    case 'fireworks':
      return new FireworksProvider();
    case 'glhf':
      return new GLHFProvider();
    case 'sambanova':
      return new SambaNovaProvider();
    case 'upstage':
      return new UpstageProvider();
    case 'edenai':
      return new EdenAIProvider();
    case 'cerebrium':
      return new CerebriumProvider();
    case 'deepseek':
      return new DeepseekProvider();
    case 'hyperbolic':
      return new HyperbolicProvider();
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function parseModelString(modelString: string): { provider: ProviderType; model: string } {
  const [provider, ...modelParts] = modelString.split('/');
  const model = modelParts.join('/');

  if (!provider || !model) {
    throw new Error('Invalid model string format. Expected format: "provider/model"');
  }

  return { provider: provider as ProviderType, model };
}
