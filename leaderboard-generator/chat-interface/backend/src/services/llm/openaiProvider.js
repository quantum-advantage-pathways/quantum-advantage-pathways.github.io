/**
 * OpenAI Provider implementation
 * 
 * This provider handles communication with the OpenAI API.
 */

import fetch from 'node-fetch';
import BaseLLMProvider from './baseProvider.js';
import logger from '../../utils/logger.js';

export default class OpenAIProvider extends BaseLLMProvider {
  /**
   * Constructor
   * @param {string} id - Provider ID
   * @param {Object} config - Provider configuration
   */
  constructor(id, config) {
    super(id, config);
    
    // Set default models if not provided
    if (!this.models || this.models.length === 0) {
      this.models = ['gpt-4', 'gpt-3.5-turbo'];
    }
    
    // Set default model if not provided
    if (!this.defaultModel) {
      this.defaultModel = 'gpt-4';
    }
    
    // Set default base URL if not provided
    if (!this.baseUrl) {
      this.baseUrl = 'https://api.openai.com/v1';
    }
  }

  /**
   * Check if the provider is available
   * @returns {Promise<boolean>} - True if available
   */
  async checkAvailability() {
    try {
      if (!this.apiKey) {
        logger.warn(`No API key provided for ${this.type} provider (${this.id})`);
        return false;
      }
      
      // Make a simple request to the models endpoint
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
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
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter for chat models only
      const chatModels = data.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id);
      
      // Update models list
      this.models = chatModels.length > 0 ? chatModels : this.models;
      
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
      
      // Format messages for OpenAI API
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
      
      // Make request to OpenAI API
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract the response content
      const content = data.choices[0].message.content;
      
      // Extract configuration data if present
      let extractedConfig = null;
      if (extractConfig) {
        extractedConfig = this.extractConfigFromResponse(content);
      }
      
      return {
        role: 'assistant',
        content,
        metadata: {
          model: data.model,
          usage: data.usage,
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
