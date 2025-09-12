/**
 * LLM Service for the Leaderboard Generator Chat Interface
 * 
 * This service handles communication with different LLM providers
 * and provides a unified interface for sending messages.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration path
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', '..', 'config', 'llm.json');

// LLM provider registry
const providers = new Map();

// Default provider
let defaultProvider = null;

/**
 * Initialize the LLM service
 * @param {Object} options - Initialization options
 * @param {string} options.configPath - Path to the LLM configuration file
 * @returns {Promise<void>}
 */
export async function initializeLLMService(options = {}) {
  logger.info('Initializing LLM service...');
  
  try {
    // Load configuration
    const configPath = options.configPath || process.env.LLM_CONFIG_PATH || DEFAULT_CONFIG_PATH;
    
    // Create default config if it doesn't exist
    if (!await fs.pathExists(configPath)) {
      await fs.ensureDir(path.dirname(configPath));
      await fs.writeJson(configPath, {
        defaultProvider: 'openai',
        providers: {
          openai: {
            type: 'openai',
            apiKey: process.env.OPENAI_API_KEY || '',
            baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
            defaultModel: 'gpt-4',
            models: ['gpt-4', 'gpt-3.5-turbo']
          },
          localllm: {
            type: 'local',
            baseUrl: process.env.LOCAL_LLM_URL || 'http://localhost:8000/v1',
            defaultModel: 'llama3',
            models: ['llama3', 'mistral']
          },
          proxy: {
            type: 'proxy',
            name: 'LLM Proxy',
            baseUrl: process.env.PROXY_LLM_URL || 'http://localhost:8080/v1',
            apiKey: process.env.PROXY_API_KEY || '',
            requiresAuth: true,
            authType: 'bearer',
            defaultModel: 'default-model'
          }
        },
        fallbackOrder: ['openai', 'proxy', 'localllm']
      }, { spaces: 2 });
      
      logger.info(`Created default LLM configuration at ${configPath}`);
    }
    
    // Load configuration
    const config = await fs.readJson(configPath);
    logger.info('Loaded LLM configuration');
    
    // Register providers
    for (const [id, providerConfig] of Object.entries(config.providers)) {
      await registerProvider(id, providerConfig);
    }
    
    // Set default provider
    if (config.defaultProvider && providers.has(config.defaultProvider)) {
      defaultProvider = providers.get(config.defaultProvider);
      logger.info(`Set default provider to ${config.defaultProvider}`);
    } else if (providers.size > 0) {
      const firstProviderId = Array.from(providers.keys())[0];
      defaultProvider = providers.get(firstProviderId);
      logger.info(`Default provider not found, using ${firstProviderId}`);
    } else {
      logger.warn('No LLM providers registered');
    }
    
    // Store fallback order
    if (config.fallbackOrder) {
      global.llmFallbackOrder = config.fallbackOrder;
    }
    
    logger.info('LLM service initialized successfully');
  } catch (error) {
    logger.error('Error initializing LLM service:', error);
    throw error;
  }
}

/**
 * Register an LLM provider
 * @param {string} id - Provider ID
 * @param {Object} config - Provider configuration
 * @returns {Promise<void>}
 */
export async function registerProvider(id, config) {
  try {
    // Import provider class based on type
    const ProviderClass = await getProviderClass(config.type);
    
    // Create provider instance
    const provider = new ProviderClass(id, config);
    
    // Initialize provider
    await provider.initialize();
    
    // Register provider
    providers.set(id, provider);
    
    logger.info(`Registered LLM provider: ${id} (${config.type})`);
  } catch (error) {
    logger.error(`Error registering LLM provider ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an LLM provider
 * @param {string} id - Provider ID
 * @returns {Promise<void>}
 */
export async function deleteProvider(id) {
  try {
    // Check if provider exists
    if (!providers.has(id)) {
      throw new Error(`Provider not found: ${id}`);
    }
    
    // Get provider
    const provider = providers.get(id);
    
    // Shutdown provider
    await provider.shutdown();
    
    // Remove provider from registry
    providers.delete(id);
    
    // Update configuration file
    const configPath = process.env.LLM_CONFIG_PATH || DEFAULT_CONFIG_PATH;
    const config = await fs.readJson(configPath);
    
    // Remove provider from config
    delete config.providers[id];
    
    // Remove from fallback order if present
    if (config.fallbackOrder) {
      config.fallbackOrder = config.fallbackOrder.filter(providerId => providerId !== id);
    }
    
    // Save updated config
    await fs.writeJson(configPath, config, { spaces: 2 });
    
    logger.info(`Deleted LLM provider: ${id}`);
  } catch (error) {
    logger.error(`Error deleting LLM provider ${id}:`, error);
    throw error;
  }
}

/**
 * Get provider class based on type
 * @param {string} type - Provider type
 * @returns {Promise<Class>} - Provider class
 */
async function getProviderClass(type) {
  try {
    // Import provider class dynamically
    const module = await import(`./llm/${type}Provider.js`);
    return module.default;
  } catch (error) {
    logger.error(`Error loading provider class for type ${type}:`, error);
    throw new Error(`Unsupported LLM provider type: ${type}`);
  }
}

/**
 * Get all registered providers
 * @returns {Array<Object>} - Array of provider info objects
 */
export function getProviders() {
  return Array.from(providers.values()).map(provider => provider.getInfo());
}

/**
 * Get a specific provider by ID
 * @param {string} providerId - Provider ID
 * @returns {Object} - Provider instance
 * @throws {Error} - If provider not found
 */
export function getProvider(providerId) {
  const provider = providers.get(providerId);
  if (!provider) {
    throw new Error(`LLM provider not found: ${providerId}`);
  }
  return provider;
}

/**
 * Get the default provider
 * @returns {Object} - Default provider instance
 * @throws {Error} - If no default provider is set
 */
export function getDefaultProvider() {
  if (!defaultProvider) {
    throw new Error('No default LLM provider set');
  }
  return defaultProvider;
}

/**
 * Set the default provider
 * @param {string} providerId - Provider ID
 * @returns {void}
 * @throws {Error} - If provider not found
 */
export function setDefaultProvider(providerId) {
  const provider = providers.get(providerId);
  if (!provider) {
    throw new Error(`LLM provider not found: ${providerId}`);
  }
  defaultProvider = provider;
  
  // Update configuration file
  const configPath = process.env.LLM_CONFIG_PATH || DEFAULT_CONFIG_PATH;
  fs.readJson(configPath)
    .then(config => {
      config.defaultProvider = providerId;
      return fs.writeJson(configPath, config, { spaces: 2 });
    })
    .then(() => {
      logger.info(`Set default provider to ${providerId} and updated configuration`);
    })
    .catch(error => {
      logger.error(`Error updating default provider in configuration:`, error);
    });
}

/**
 * Process a message with the specified provider
 * @param {string} providerId - Provider ID (optional, uses default if not specified)
 * @param {Array<Object>} messages - Array of message objects
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Response object
 */
export async function processMessage(providerId, messages, options = {}) {
  try {
    // Get provider
    const provider = providerId ? getProvider(providerId) : getDefaultProvider();
    
    // Process message
    return await provider.processMessage(messages, options);
  } catch (error) {
    logger.error('Error processing message:', error);
    
    // Try fallback providers if enabled
    if (options.useFallback && global.llmFallbackOrder) {
      return await processMessageWithFallback(messages, options);
    }
    
    throw error;
  }
}

/**
 * Process a message with fallback providers
 * @param {Array<Object>} messages - Array of message objects
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Response object
 */
async function processMessageWithFallback(messages, options = {}) {
  const fallbackOrder = global.llmFallbackOrder || [];
  let lastError = null;
  
  for (const providerId of fallbackOrder) {
    try {
      if (!providers.has(providerId)) continue;
      
      const provider = providers.get(providerId);
      if (await provider.isAvailable()) {
        logger.info(`Using fallback provider: ${providerId}`);
        return await provider.processMessage(messages, options);
      }
    } catch (error) {
      lastError = error;
      logger.error(`Fallback provider ${providerId} failed:`, error);
    }
  }
  
  throw new Error(`All providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Test a provider connection
 * @param {string} providerId - Provider ID
 * @param {string} prompt - Test prompt
 * @returns {Promise<Object>} - Test result
 */
export async function testProvider(providerId, prompt) {
  try {
    const provider = getProvider(providerId);
    const result = await provider.test(prompt);
    return {
      success: true,
      response: result.response,
      provider: providerId,
      model: result.model,
      latency: result.latency
    };
  } catch (error) {
    logger.error(`Provider test failed for ${providerId}:`, error);
    return {
      success: false,
      error: error.message,
      provider: providerId
    };
  }
}

/**
 * Update provider configuration
 * @param {string} providerId - Provider ID
 * @param {Object} config - New configuration
 * @returns {Promise<Object>} - Updated provider info
 */
export async function updateProviderConfig(providerId, config) {
  try {
    // Get provider
    const provider = getProvider(providerId);
    
    // Update configuration
    await provider.updateConfig(config);
    
    // Save configuration to file
    const configPath = process.env.LLM_CONFIG_PATH || DEFAULT_CONFIG_PATH;
    const fullConfig = await fs.readJson(configPath);
    fullConfig.providers[providerId] = { ...fullConfig.providers[providerId], ...config };
    await fs.writeJson(configPath, fullConfig, { spaces: 2 });
    
    logger.info(`Updated configuration for provider ${providerId}`);
    
    return provider.getInfo();
  } catch (error) {
    logger.error(`Error updating provider config for ${providerId}:`, error);
    throw error;
  }
}

/**
 * Shutdown the LLM service
 * @returns {Promise<void>}
 */
export async function shutdownLLMService() {
  logger.info('Shutting down LLM service...');
  
  try {
    // Shutdown all providers
    for (const [id, provider] of providers.entries()) {
      try {
        await provider.shutdown();
        logger.info(`Shut down provider: ${id}`);
      } catch (error) {
        logger.error(`Error shutting down provider ${id}:`, error);
      }
    }
    
    // Clear providers
    providers.clear();
    defaultProvider = null;
    
    logger.info('LLM service shut down successfully');
  } catch (error) {
    logger.error('Error shutting down LLM service:', error);
    throw error;
  }
}

export default {
  initializeLLMService,
  registerProvider,
  deleteProvider,
  getProviders,
  getProvider,
  getDefaultProvider,
  setDefaultProvider,
  processMessage,
  testProvider,
  updateProviderConfig,
  shutdownLLMService
};