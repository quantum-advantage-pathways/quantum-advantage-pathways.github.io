/**
 * Proxy Provider implementation
 * 
 * This provider handles communication with any OpenAI-compatible API endpoint.
 * It can be used to connect to services like Azure OpenAI, Anthropic (with adapter),
 * or any other service that implements the OpenAI API format.
 */

import fetch from 'node-fetch';
import BaseLLMProvider from './baseProvider.js';
import logger from '../../utils/logger.js';

export default class ProxyProvider extends BaseLLMProvider {
  /**
   * Constructor
   * @param {string} id - Provider ID
   * @param {Object} config - Provider configuration
   */
  constructor(id, config) {
    super(id, config);
    
    // Set default models if not provided
    if (!this.models || this.models.length === 0) {
      this.models = ['default-model'];
    }
    
    // Set default model if not provided
    if (!this.defaultModel) {
      this.defaultModel = this.models[0];
    }
    
    // Ensure baseUrl is set
    if (!this.baseUrl) {
      throw new Error('Base URL is required for proxy provider');
    }
    
    // Normalize baseUrl to ensure it ends with /v1 if not already
    if (!this.baseUrl.endsWith('/v1')) {
      this.baseUrl = this.baseUrl.endsWith('/') 
        ? `${this.baseUrl}v1` 
        : `${this.baseUrl}/v1`;
    }
    
    // Additional configuration
    this.requiresAuth = config.requiresAuth !== undefined ? config.requiresAuth : true;
    this.authType = config.authType || 'bearer'; // 'bearer', 'header', 'query'
    this.authHeaderName = config.authHeaderName || 'Authorization';
    this.authQueryParam = config.authQueryParam || 'api_key';
    this.timeout = config.timeout || 30000; // 30 seconds
  }

  /**
   * Check if the provider requires an API key
   * @returns {boolean} - True if API key is required
   */
  requiresApiKey() {
    return this.requiresAuth;
  }

  /**
   * Get headers for API requests
   * @returns {Object} - Headers object
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.requiresAuth && this.apiKey) {
      if (this.authType === 'bearer') {
        headers[this.authHeaderName] = `Bearer ${this.apiKey}`;
      } else if (this.authType === 'header') {
        headers[this.authHeaderName] = this.apiKey;
      }
    }
    
    return headers;
  }

  /**
   * Get URL with auth query parameter if needed
   * @param {string} endpoint - API endpoint
   * @returns {string} - URL with auth query parameter if needed
   */
  getUrl(endpoint) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    if (this.requiresAuth && this.apiKey && this.authType === 'query') {
      return `${url}${url.includes('?') ? '&' : '?'}${this.authQueryParam}=${encodeURIComponent(this.apiKey)}`;
    }
    
    return url;
  }

  /**
   * Check if the provider is available
   * @returns {Promise<boolean>} - True if available
   */
  async checkAvailability() {
    try {
      if (this.requiresAuth && !this.apiKey) {
        logger.warn(`No API key provided for ${this.type} provider (${this.id})`);
        return false;
      }
      
      // Make a simple request to the models endpoint
      const response = await fetch(this.getUrl('/models'), {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.timeout)
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
        
        throw new Error(`API error: ${errorMessage}`);
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
      
      const response = await fetch(this.getUrl('/models'), {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.timeout)
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
        
        throw new Error(`API error: ${errorMessage}`);
      }
      
      const data = await response.json();
      
      // Extract model IDs
      const modelIds = data.data?.map(model => model.id) || [];
      
      // Update models list if we got any
      if (modelIds.length > 0) {
        this.models = modelIds;
        
        // Update default model if current one is not in the list
        if (!this.models.includes(this.defaultModel)) {
          this.defaultModel = this.models[0];
        }
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
```json
{
  "extractedConfig": {
    // Configuration fields based on the user's request
  }
}
```

Only include fields that you can confidently extract from the user's message.`
        });
      }
      
      // Prepare request body
      const requestBody = {
        model,
        messages: formattedMessages,
        temperature,
        max_tokens: maxTokens,
        n: 1,
        stream: false
      };
      
      // Add any additional parameters from options
      if (options.stop) requestBody.stop = options.stop;
      if (options.presence_penalty !== undefined) requestBody.presence_penalty = options.presence_penalty;
      if (options.frequency_penalty !== undefined) requestBody.frequency_penalty = options.frequency_penalty;
      if (options.top_p !== undefined) requestBody.top_p = options.top_p;
      
      // Make request to API
      const response = await fetch(this.getUrl('/chat/completions'), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout)
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
        
        throw new Error(`API error: ${errorMessage}`);
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
}

// Made with Bob
