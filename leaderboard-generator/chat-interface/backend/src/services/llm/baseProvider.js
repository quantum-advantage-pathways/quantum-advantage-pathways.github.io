/**
 * Base LLM Provider class
 * 
 * This class defines the common interface and functionality for all LLM providers.
 * Specific providers should extend this class and implement the required methods.
 */

import logger from '../../utils/logger.js';

export default class BaseLLMProvider {
  /**
   * Constructor
   * @param {string} id - Provider ID
   * @param {Object} config - Provider configuration
   */
  constructor(id, config) {
    this.id = id;
    this.config = config;
    this.type = config.type;
    this.name = config.name || this.type;
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.defaultModel = config.defaultModel;
    this.models = config.models || [];
    this.available = false;
    this.status = 'initializing';
    this.errorMessage = null;
  }

  /**
   * Initialize the provider
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      logger.info(`Initializing ${this.type} provider (${this.id})...`);
      
      // Check if API key is required but not provided
      if (this.requiresApiKey() && !this.apiKey) {
        throw new Error(`API key is required for ${this.type} provider`);
      }
      
      // Check availability
      this.available = await this.checkAvailability();
      this.status = this.available ? 'active' : 'inactive';
      
      logger.info(`${this.type} provider (${this.id}) initialized successfully. Status: ${this.status}`);
    } catch (error) {
      this.available = false;
      this.status = 'error';
      this.errorMessage = error.message;
      
      logger.error(`Error initializing ${this.type} provider (${this.id}):`, error);
      throw error;
    }
  }

  /**
   * Check if the provider requires an API key
   * @returns {boolean} - True if API key is required
   */
  requiresApiKey() {
    return true; // Most providers require an API key
  }

  /**
   * Check if the provider is available
   * @returns {Promise<boolean>} - True if available
   */
  async checkAvailability() {
    try {
      // This should be implemented by subclasses
      return true;
    } catch (error) {
      logger.error(`Error checking availability for ${this.type} provider (${this.id}):`, error);
      return false;
    }
  }

  /**
   * Check if the provider is currently available
   * @returns {Promise<boolean>} - True if available
   */
  async isAvailable() {
    if (this.status === 'error') {
      return false;
    }
    
    try {
      this.available = await this.checkAvailability();
      this.status = this.available ? 'active' : 'inactive';
      return this.available;
    } catch (error) {
      this.available = false;
      this.status = 'error';
      this.errorMessage = error.message;
      return false;
    }
  }

  /**
   * Get provider information
   * @returns {Object} - Provider info
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModel,
      models: this.models,
      available: this.available,
      status: this.status,
      errorMessage: this.errorMessage
    };
  }

  /**
   * Get available models
   * @returns {Promise<Array<string>>} - Array of model IDs
   */
  async getModels() {
    // This should be implemented by subclasses
    return this.models;
  }

  /**
   * Process a message
   * @param {Array<Object>} messages - Array of message objects
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Response object
   */
  async processMessage(messages, options = {}) {
    try {
      if (!this.available) {
        throw new Error(`Provider ${this.id} is not available`);
      }
      
      const startTime = Date.now();
      
      // This should be implemented by subclasses
      const response = await this._processMessage(messages, options);
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      logger.info(`Processed message with ${this.type} provider (${this.id}) in ${latency}ms`);
      
      return {
        ...response,
        metadata: {
          ...(response.metadata || {}),
          provider: this.id,
          model: options.model || this.defaultModel,
          latency
        }
      };
    } catch (error) {
      logger.error(`Error processing message with ${this.type} provider (${this.id}):`, error);
      throw error;
    }
  }

  /**
   * Internal method to process a message (to be implemented by subclasses)
   * @param {Array<Object>} messages - Array of message objects
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} - Response object
   */
  async _processMessage(messages, options = {}) {
    throw new Error('_processMessage must be implemented by subclass');
  }

  /**
   * Test the provider with a simple prompt
   * @param {string} prompt - Test prompt
   * @returns {Promise<Object>} - Test result
   */
  async test(prompt) {
    try {
      if (!this.available) {
        throw new Error(`Provider ${this.id} is not available`);
      }
      
      const startTime = Date.now();
      
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt || 'Hello, are you working correctly?' }
      ];
      
      const response = await this.processMessage(messages);
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      return {
        success: true,
        response: response.content,
        model: response.metadata?.model || this.defaultModel,
        latency
      };
    } catch (error) {
      logger.error(`Test failed for ${this.type} provider (${this.id}):`, error);
      throw error;
    }
  }

  /**
   * Update provider configuration
   * @param {Object} config - New configuration
   * @returns {Promise<void>}
   */
  async updateConfig(config) {
    try {
      // Update configuration
      this.config = { ...this.config, ...config };
      
      // Update properties
      if (config.name) this.name = config.name;
      if (config.baseUrl) this.baseUrl = config.baseUrl;
      if (config.apiKey) this.apiKey = config.apiKey;
      if (config.defaultModel) this.defaultModel = config.defaultModel;
      if (config.models) this.models = config.models;
      
      // Re-initialize
      await this.initialize();
      
      logger.info(`Updated configuration for ${this.type} provider (${this.id})`);
    } catch (error) {
      logger.error(`Error updating configuration for ${this.type} provider (${this.id}):`, error);
      throw error;
    }
  }

  /**
   * Shutdown the provider
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      logger.info(`Shutting down ${this.type} provider (${this.id})...`);
      
      // Perform any cleanup
      await this._shutdown();
      
      this.available = false;
      this.status = 'inactive';
      
      logger.info(`${this.type} provider (${this.id}) shut down successfully`);
    } catch (error) {
      logger.error(`Error shutting down ${this.type} provider (${this.id}):`, error);
      throw error;
    }
  }

  /**
   * Internal method to perform shutdown cleanup (to be implemented by subclasses if needed)
   * @returns {Promise<void>}
   */
  async _shutdown() {
    // Default implementation does nothing
  }
}

// Made with Bob
