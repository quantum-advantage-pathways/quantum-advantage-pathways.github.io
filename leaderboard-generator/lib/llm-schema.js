/**
 * JSON Schema for validating LLM provider configurations
 */

export const llmProviderSchema = {
  type: "object",
  required: ["type"],
  properties: {
    type: {
      type: "string",
      enum: ["openai", "local", "proxy"],
      description: "Type of LLM provider"
    },
    name: {
      type: "string",
      description: "Display name for the provider"
    },
    baseUrl: {
      type: "string",
      description: "Base URL for the API endpoint"
    },
    apiKey: {
      type: "string",
      description: "API key for authentication"
    },
    defaultModel: {
      type: "string",
      description: "Default model to use"
    },
    models: {
      type: "array",
      items: {
        type: "string"
      },
      description: "List of available models"
    },
    // Local provider specific properties
    serverType: {
      type: "string",
      enum: ["ollama", "lmstudio", "other"],
      description: "Type of local LLM server (for local provider)"
    },
    startupTimeout: {
      type: "number",
      description: "Timeout in milliseconds for server startup (for local provider)"
    },
    startupRetries: {
      type: "number",
      description: "Number of retries for server connection (for local provider)"
    },
    // Proxy provider specific properties
    requiresAuth: {
      type: "boolean",
      description: "Whether authentication is required (for proxy provider)"
    },
    authType: {
      type: "string",
      enum: ["bearer", "header", "query"],
      description: "Type of authentication (for proxy provider)"
    },
    authHeaderName: {
      type: "string",
      description: "Name of the authentication header (for proxy provider with header auth)"
    },
    authQueryParam: {
      type: "string",
      description: "Name of the authentication query parameter (for proxy provider with query auth)"
    },
    timeout: {
      type: "number",
      description: "Timeout in milliseconds for API requests (for proxy provider)"
    }
  },
  // Define specific requirements based on provider type
  allOf: [
    {
      if: {
        properties: { type: { enum: ["openai"] } }
      },
      then: {
        required: ["apiKey"]
      }
    },
    {
      if: {
        properties: { type: { enum: ["local"] } }
      },
      then: {
        required: ["baseUrl"]
      }
    },
    {
      if: {
        properties: { type: { enum: ["proxy"] } }
      },
      then: {
        required: ["baseUrl"]
      }
    }
  ]
};

export default llmProviderSchema;

// Made with Bob
