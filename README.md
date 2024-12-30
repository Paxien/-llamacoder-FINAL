# LLaMaCoder

A powerful code generation interface that supports multiple AI providers and models. Built with Next.js and TypeScript.

## Features

### Multiple AI Providers
LLaMaCoder supports a wide range of AI providers:

- **OpenAI** - GPT-4 and GPT-3.5 Turbo
- **Together AI** - Various open source models
- **Groq** - High-performance inference
- **Mistral AI** - Mistral models (Tiny, Small, Medium, Large)
- **AI21** - Jurassic-2 models (Ultra, Mid, Light)
- **Google Gemini** - Pro, Ultra, and Pro Vision models
- **Cohere** - Command models (Standard, Light, R variants)
- **OpenRouter** - Access to multiple providers (GPT-4, Claude 2, etc.)
- **Fireworks** - LLaMA, Mixtral, and other models
- **GLHF** - Access to Hugging Face models
- **SambaNova** - Proprietary models
- **Upstage** - Solar, Starling, and other specialized models
- **EdenAI** - Multi-provider access
- **Cerebrium** - Hosted open source models
- **Deepseek** - Specialized coding models
- **Hyperbolic** - Various open source models

### Key Features
- **Streaming Responses** - Real-time code generation
- **Provider Switching** - Easily switch between different AI providers
- **Code-Optimized** - Specialized prompts for code generation
- **Modern UI** - Clean and responsive interface
- **Secure** - API keys managed through environment variables

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- API keys for your chosen providers

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/llamacoder.git
cd llamacoder
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy the environment variables file:
```bash
cp .env.sample .env
```

4. Configure your API keys in the .env file. Available providers:

```env
# Core Providers
TOGETHER_API_KEY=           # Together AI
OPENAI_API_KEY=            # OpenAI
GROQ_API_KEY=              # Groq
MISTRAL_API_KEY=           # Mistral AI
AI21_API_KEY=              # AI21
GOOGLE_GENERATIVE_AI_API_KEY= # Google Gemini

# Additional Providers
COHERE_API_KEY=            # Cohere
OPEN_ROUTER_API_KEY=       # OpenRouter
FIREWORKS_API_KEY=         # Fireworks
GLHF_API_KEY=              # GLHF
SAMBA_NOVA_API_KEY=        # SambaNova
UPSTAGE_API_KEY=           # Upstage
EDENAI_API_KEY=            # EdenAI
DEEPSEEK_API_KEY=          # Deepseek
HYPERBOLIC_API_KEY=        # Hyperbolic

# Cerebrium Configuration
CEREBRIUM_API_KEY=         # Cerebrium API Key
CEREBRIUM_PROJECT_ID=      # Your Cerebrium Project ID
CEREBRIUM_ENDPOINT_NAME=   # Your Cerebrium Endpoint Name
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Select your preferred AI provider from the dropdown menu
2. Choose a specific model for that provider
3. Enter your code generation prompt
4. Watch as the code is generated in real-time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Thanks to all the AI providers for making their APIs available for integration.
