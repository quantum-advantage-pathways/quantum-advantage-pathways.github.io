# Leaderboard Generator Chat Interface

A web-based interface for creating and managing leaderboards for the Quantum Advantage Pathways project.

## Features

- Interactive chat interface for creating leaderboard configurations
- Configuration editor for manual adjustments
- Live preview of leaderboards
- Multiple LLM provider support (OpenAI, local models, and proxy providers)
- Responsive design for desktop and mobile

## LLM Provider Support

The chat interface supports multiple LLM providers:

1. **OpenAI** - Connect to OpenAI's API for GPT models
2. **Local LLM** - Connect to locally running models via Ollama, LM Studio, etc.
3. **Proxy Provider** - Connect to any OpenAI-compatible API endpoint

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/quantum-advantage-pathways/leaderboard-generator.git
   cd leaderboard-generator/chat-interface
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   PORT=4000
   OPENAI_API_KEY=your_openai_api_key
   LOCAL_LLM_URL=http://localhost:8000/v1
   PROXY_LLM_URL=http://localhost:8080/v1
   PROXY_API_KEY=your_proxy_api_key
   ```

### Running the Application

#### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

#### Production Mode

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the production server:
   ```bash
   cd ../backend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:4000`

## Configuration

### LLM Providers

You can configure LLM providers through the web interface or by editing the `config/llm.json` file:

```json
{
  "defaultProvider": "openai",
  "providers": {
    "openai": {
      "type": "openai",
      "apiKey": "your_openai_api_key",
      "baseUrl": "https://api.openai.com/v1",
      "defaultModel": "gpt-4",
      "models": ["gpt-4", "gpt-3.5-turbo"]
    },
    "localllm": {
      "type": "local",
      "baseUrl": "http://localhost:8000/v1",
      "defaultModel": "llama3",
      "models": ["llama3", "mistral"]
    },
    "proxy": {
      "type": "proxy",
      "name": "LLM Proxy",
      "baseUrl": "http://localhost:8080/v1",
      "apiKey": "your_proxy_api_key",
      "requiresAuth": true,
      "authType": "bearer",
      "defaultModel": "default-model"
    }
  },
  "fallbackOrder": ["openai", "proxy", "localllm"]
}
```

### Setting Up a Proxy Provider

The proxy provider allows you to connect to any OpenAI-compatible API endpoint. This is useful for:

1. Using services like Azure OpenAI
2. Using self-hosted models with OpenAI-compatible APIs
3. Using API proxies like LiteLLM

To set up a proxy provider:

1. Navigate to the LLM Providers page in the web interface
2. Click "Add Provider"
3. Select "Proxy (OpenAI-compatible)" as the provider type
4. Enter the base URL for your API endpoint
5. Configure authentication settings as needed
6. Click "Save Provider"

## API Reference

The backend provides the following API endpoints:

- `/api/v1/chat/*` - Chat session management
- `/api/v1/config/*` - Configuration management
- `/api/v1/leaderboard/*` - Leaderboard generation
- `/api/v1/llm/*` - LLM provider management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Quantum Advantage Pathways team
- OpenAI for their API
- The open-source community for various libraries used in this project
