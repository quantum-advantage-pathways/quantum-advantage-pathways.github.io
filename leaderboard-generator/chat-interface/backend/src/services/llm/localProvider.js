/**
 * Local LLM Provider implementation
 * 
 * This provider handles communication with local LLM servers that provide
 * an OpenAI-compatible API, such as Ollama or LM Studio.
 */

import fetch from 'node-fetch';
import BaseLLMProvider from './baseProvider.js';
import logger from '../../utils/logger.js';

export default class LocalLLMProvider extends BaseLLMProvider {
  /**
   * Constructor
   * @param {string} id - Provider ID
   * @param {Object} config - Provider configuration
   */
  constructor(id, config) {
    super(id, config);
    
    // Set default models if not provided
    if (!this.models || this.models.length === 0) {
      this.models = ['llama3', 'mistral'];
    }
    
    // Set default model if not provided
    if (!this.defaultModel) {
      this.defaultModel = 'llama3';
    }
    
    // Set default base URL if not provided
    if (!this.baseUrl) {
      this.baseUrl = 'http://localhost:8000/v1';
    }
    
    // Local LLM specific properties
    this.serverType = config.serverType || 'ollama'; // 'ollama', 'lmstudio', etc.
    this.startupTimeout = config.startupTimeout || 30000; // 30 seconds
    this.startupRetries = config.startupRetries || 3;
  }

  /**
   * Check if the provider requires an API key
   * @returns {boolean} - True if API key is required
   */
  requiresApiKey() {
    return false; // Local LLMs typically don't require API keys
  }

  /**
   * Check if the provider is available
   * @returns {Promise<boolean>} - True if available
   */
  async checkAvailability() {
    try {
      // Try to connect to the local LLM server
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Set a timeout to avoid hanging
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Local LLM server returned status ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error checking availability for ${this.type} provider (${this.id}):`, error);
      this.errorMessage = error.message;
      return false;
    }
  }

  /**
   * Get available models
   * @returns {Promise<Array<string>>} - Array of model IDs
   */
  async getModels() {
    try {
      if (!this.available) {
        return this.models;
      }
      
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Local LLM server returned status ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract model IDs based on server type
      let modelIds = [];
      
      if (this.serverType === 'ollama') {
        // Ollama response format
        modelIds = data.models?.map(model => model.id || model.name) || [];
      } else {
        // Generic OpenAI-compatible format
        modelIds = data.data?.map(model => model.id) || [];
      }
      
      // Update models list if we got any
      if (modelIds.length > 0) {
        this.models = modelIds;
      }
      
      return this.models;
    } catch (error) {
      logger.error(`Error getting models for ${this.type} provider (${this.id}):`, error);
      return this.models;
    }
  }

  /**
   * Process a message
   * @param {Array<Object>} messages - Array of message objects
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Response object
   */
  async _processMessage(messages, options = {}) {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature !== undefined ? options.temperature : 0.7;
      const maxTokens = options.maxTokens || 2048;
      const extractConfig = options.extractConfig !== undefined ? options.extractConfig : true;
      
      // Format messages for OpenAI-compatible API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add extraction instructions if needed
      if (extractConfig) {
        // Add system message with extraction instructions
        formattedMessages.unshift({
          role: 'system',
          content: `You are an assistant helping to create a leaderboard for the Quantum Advantage Framework.
          
When the user provides information about the leaderboard they want to create, extract structured data from their request.
Respond conversationally, but also include a JSON object with the extracted configuration data.

The JSON should be formatted as follows:
\`\`\`json
{
  "extractedConfig": {
    // Configuration fields based on the user's request
  }
}
\`\`\`

Only include fields that you can confidently extract from the user's message.`
        });
      }
      
      // Make request to local LLM server
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
          n: 1,
          stream: false
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorText;
        } catch {
          errorMessage = errorText;
        }
        
        throw new Error(`Local LLM server error: ${errorMessage}`);
      }
      
      const data = await response.json();
      
      // Extract the response content
      const content = data.choices[0].message.content;
      
      // Extract configuration data if present
      let extractedConfig = null;
      if (extractConfig) {
        extractedConfig = this.extractConfigFromResponse(content);
      }
      
      // Build usage data if not provided by the server
      const usage = data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      };
      
      return {
        role: 'assistant',
        content,
        metadata: {
          model: data.model || model,
          usage,
          extractedConfig
        }
      };
    } catch (error) {
      logger.error(`Error processing message with ${this.type} provider (${this.id}):`, error);
      throw error;
    }
  }

  /**
   * Extract configuration data from response
   * @param {string} content - Response content
   * @returns {Object|null} - Extracted configuration or null if none found
   */
  extractConfigFromResponse(content) {
    try {
      // Look for JSON blocks in the response
      const jsonRegex = /```(?:json)?\s*({[\s\S]*?})\s*```/g;
      const matches = [...content.matchAll(jsonRegex)];
      
      if (matches.length > 0) {
        // Parse the first JSON block found
        const jsonStr = matches[0][1];
        const json = JSON.parse(jsonStr);
        
        // Return the extracted config if present
        return json.extractedConfig || null;
      }
      
      return null;
    } catch (error) {
      logger.error(`Error extracting configuration from response:`, error);
      return null;
    }
  }

  /**
   * Initialize the provider
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      logger.info(`Initializing ${this.type} provider (${this.id})...`);
      
      // Check availability with retries
      let available = false;
      let retries = 0;
      
      while (!available && retries < this.startupRetries) {
        try {
          available = await this.checkAvailability();
          
          if (available) {
            break;
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries++;
          
          logger.info(`Retrying connection to local LLM server (${retries}/${this.startupRetries})...`);
        } catch (error) {
          logger.error(`Error connecting to local LLM server (retry ${retries}/${this.startupRetries}):`, error);
          retries++;
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      this.available = available;
      this.status = available ? 'active' : 'inactive';
      
      if (!available) {
        this.errorMessage = `Failed to connect to local LLM server after ${this.startupRetries} retries`;
        logger.warn(this.errorMessage);
      } else {
        logger.info(`${this.type} provider (${this.id}) initialized successfully. Status: ${this.status}`);
      }
    } catch (error) {
      this.available = false;
      this.status = 'error';
      this.errorMessage = error.message;
      
      logger.error(`Error initializing ${this.type} provider (${this.id}):`, error);
      throw error;
    }
  }
}

// Made with Bob
