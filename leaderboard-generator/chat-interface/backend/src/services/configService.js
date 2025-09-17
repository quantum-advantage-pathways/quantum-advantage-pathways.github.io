/**
 * Configuration Service for the Leaderboard Generator Chat Interface
 * 
 * This service handles leaderboard configuration validation and management,
 * integrating with the existing leaderboard-generator components.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import logger from '../utils/logger.js';

// Import the existing leaderboard-generator validator
import { validateConfigFile } from '../../../lib/config-validator.js';
import { leaderboardSchema } from '../../../lib/schema.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configurations directory
const DEFAULT_CONFIGS_DIR = path.join(__dirname, '..', '..', 'data', 'configs');

/**
 * Initialize the configuration service
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initializeConfigService(options = {}) {
  logger.info('Initializing configuration service...');
  
  try {
    // Create configurations directory if it doesn't exist
    const configsDir = options.configsDir || process.env.CONFIGS_DIR || DEFAULT_CONFIGS_DIR;
    await fs.ensureDir(configsDir);
    
    logger.info('Configuration service initialized successfully');
  } catch (error) {
    logger.error('Error initializing configuration service:', error);
    throw error;
  }
}

/**
 * Create an initial empty configuration
 * @returns {Promise<Object>} - Initial configuration object
 */
export async function createInitialConfig() {
  try {
    // Create a minimal valid configuration
    const config = {
      id: '',
      title: '',
      shortDescription: '',
      columns: [
        {
          id: 'rank',
          name: 'Rank',
          type: 'number',
          width: '60px',
          className: 'rank-column',
          sortable: true,
          defaultSort: true,
          sortDirection: 'asc'
        }
      ],
      visualization: {
        type: 'scatter',
        xAxis: {
          field: '',
          label: '',
          min: 0,
          max: 100
        },
        yAxis: {
          field: '',
          label: '',
          min: 0,
          max: 100
        },
        dataPoints: {
          categoryField: '',
          categories: {}
        }
      },
      content: {
        sections: []
      },
      initialStats: {},
      initialEntries: []
    };
    
    return config;
  } catch (error) {
    logger.error('Error creating initial configuration:', error);
    throw error;
  }
}

/**
 * Validate a configuration
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} - Validation result
 */
export async function validateConfig(config) {
  try {
    // Check if the configuration is complete
    const isComplete = isConfigurationComplete(config);
    
    // If the configuration is incomplete, return validation errors
    if (!isComplete.valid) {
      return {
        valid: false,
        errors: isComplete.missingFields.map(field => ({
          field,
          message: `Missing required field: ${field}`
        })),
        config
      };
    }
    
    try {
      // Use the existing validator
      const validatedConfig = await validateConfigFile(config);
      
      return {
        valid: true,
        errors: [],
        config: validatedConfig
      };
    } catch (error) {
      // Parse validation errors
      const errors = parseValidationErrors(error);
      
      return {
        valid: false,
        errors,
        config
      };
    }
  } catch (error) {
    logger.error('Error validating configuration:', error);
    throw error;
  }
}

/**
 * Check if a configuration is complete
 * @param {Object} config - Configuration object
 * @returns {Object} - Result with valid flag and missing fields
 */
function isConfigurationComplete(config) {
  const missingFields = [];
  
  // Check required top-level fields
  for (const field of ['id', 'title', 'shortDescription']) {
    if (!config[field]) {
      missingFields.push(field);
    }
  }
  
  // Check columns
  if (!config.columns || config.columns.length < 1) {
    missingFields.push('columns');
  }
  
  // Check visualization
  if (!config.visualization) {
    missingFields.push('visualization');
  } else {
    // Check required visualization fields
    if (!config.visualization.type) {
      missingFields.push('visualization.type');
    }
    
    if (!config.visualization.xAxis?.field) {
      missingFields.push('visualization.xAxis.field');
    }
    
    if (!config.visualization.yAxis?.field) {
      missingFields.push('visualization.yAxis.field');
    }
    
    if (!config.visualization.dataPoints?.categoryField) {
      missingFields.push('visualization.dataPoints.categoryField');
    }
  }
  
  // Check content
  if (!config.content || !config.content.sections) {
    missingFields.push('content.sections');
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Parse validation errors from the validator
 * @param {Error} error - Validation error
 * @returns {Array<Object>} - Array of error objects
 */
function parseValidationErrors(error) {
  try {
    // Check if the error message contains validation errors
    if (error.message && error.message.includes('Configuration validation failed')) {
      // Extract error messages
      const errorLines = error.message.split('\n').slice(1);
      
      return errorLines.map(line => {
        const match = line.match(/^([^ ]+) (.+)$/);
        if (match) {
          return {
            field: match[1],
            message: match[2]
          };
        }
        return {
          field: 'unknown',
          message: line
        };
      });
    }
    
    // Generic error
    return [{
      field: 'general',
      message: error.message
    }];
  } catch (parseError) {
    logger.error('Error parsing validation errors:', parseError);
    return [{
      field: 'general',
      message: error.message
    }];
  }
}

/**
 * Update a configuration with new data
 * @param {Object} currentConfig - Current configuration
 * @param {Object} updates - Configuration updates
 * @returns {Promise<Object>} - Updated configuration
 */
export async function updateConfig(currentConfig, updates) {
  try {
    // Create a deep copy of the current configuration
    const updatedConfig = JSON.parse(JSON.stringify(currentConfig));
    
    // Apply updates recursively
    applyUpdates(updatedConfig, updates);
    
    // Return the updated configuration
    return updatedConfig;
  } catch (error) {
    logger.error('Error updating configuration:', error);
    throw error;
  }
}

/**
 * Apply updates to a configuration object recursively
 * @param {Object} target - Target object
 * @param {Object} updates - Updates to apply
 */
function applyUpdates(target, updates) {
  if (!updates || typeof updates !== 'object') {
    return;
  }
  
  for (const [key, value] of Object.entries(updates)) {
    // Handle special cases
    if (key === 'columns' && Array.isArray(value)) {
      // For columns, merge with existing columns or add new ones
      if (!target.columns) {
        target.columns = [];
      }
      
      for (const column of value) {
        if (!column.id) continue;
        
        // Check if column already exists
        const existingIndex = target.columns.findIndex(c => c.id === column.id);
        
        if (existingIndex >= 0) {
          // Update existing column
          target.columns[existingIndex] = {
            ...target.columns[existingIndex],
            ...column
          };
        } else {
          // Add new column
          target.columns.push(column);
        }
      }
    } else if (key === 'content' && value.sections && Array.isArray(value.sections)) {
      // For content sections, merge with existing sections or add new ones
      if (!target.content) {
        target.content = { sections: [] };
      } else if (!target.content.sections) {
        target.content.sections = [];
      }
      
      for (const section of value.sections) {
        if (!section.title) continue;
        
        // Check if section already exists
        const existingIndex = target.content.sections.findIndex(s => s.title === section.title);
        
        if (existingIndex >= 0) {
          // Update existing section
          target.content.sections[existingIndex] = {
            ...target.content.sections[existingIndex],
            ...section
          };
        } else {
          // Add new section
          target.content.sections.push(section);
        }
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // For nested objects, recurse
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      
      applyUpdates(target[key], value);
    } else {
      // For primitive values and arrays, replace
      target[key] = value;
    }
  }
}

/**
 * Save a configuration to disk
 * @param {string} configId - Configuration ID
 * @param {Object} config - Configuration object
 * @returns {Promise<string>} - Path to the saved file
 */
export async function saveConfig(configId, config) {
  try {
    const configsDir = process.env.CONFIGS_DIR || DEFAULT_CONFIGS_DIR;
    const configFile = path.join(configsDir, `${configId}.json`);
    
    await fs.ensureDir(configsDir);
    await fs.writeJson(configFile, config, { spaces: 2 });
    
    logger.info(`Saved configuration: ${configId}`);
    
    return configFile;
  } catch (error) {
    logger.error(`Error saving configuration ${configId}:`, error);
    throw error;
  }
}

/**
 * Load a configuration from disk
 * @param {string} configId - Configuration ID
 * @returns {Promise<Object>} - Configuration object
 */
export async function loadConfig(configId) {
  try {
    const configsDir = process.env.CONFIGS_DIR || DEFAULT_CONFIGS_DIR;
    const configFile = path.join(configsDir, `${configId}.json`);
    
    if (!await fs.pathExists(configFile)) {
      throw new Error(`Configuration not found: ${configId}`);
    }
    
    const config = await fs.readJson(configFile);
    
    logger.info(`Loaded configuration: ${configId}`);
    
    return config;
  } catch (error) {
    logger.error(`Error loading configuration ${configId}:`, error);
    throw error;
  }
}

/**
 * List all saved configurations
 * @returns {Promise<Array<Object>>} - Array of configuration summaries
 */
export async function listConfigs() {
  try {
    const configsDir = process.env.CONFIGS_DIR || DEFAULT_CONFIGS_DIR;
    
    if (!await fs.pathExists(configsDir)) {
      return [];
    }
    
    const files = await fs.readdir(configsDir);
    const configs = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const configId = file.replace('.json', '');
          const config = await fs.readJson(path.join(configsDir, file));
          
          configs.push({
            id: configId,
            title: config.title,
            shortDescription: config.shortDescription,
            updatedAt: fs.statSync(path.join(configsDir, file)).mtime
          });
        } catch (error) {
          logger.error(`Error reading configuration file ${file}:`, error);
        }
      }
    }
    
    return configs;
  } catch (error) {
    logger.error('Error listing configurations:', error);
    throw error;
  }
}

/**
 * Delete a configuration
 * @param {string} configId - Configuration ID
 * @returns {Promise<boolean>} - True if successful
 */
export async function deleteConfig(configId) {
  try {
    const configsDir = process.env.CONFIGS_DIR || DEFAULT_CONFIGS_DIR;
    const configFile = path.join(configsDir, `${configId}.json`);
    
    if (!await fs.pathExists(configFile)) {
      throw new Error(`Configuration not found: ${configId}`);
    }
    
    await fs.remove(configFile);
    
    logger.info(`Deleted configuration: ${configId}`);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting configuration ${configId}:`, error);
    throw error;
  }
}

/**
 * Shutdown the configuration service
 * @returns {Promise<void>}
 */
export async function shutdownConfigService() {
  logger.info('Shutting down configuration service...');
  
  try {
    // Nothing to do here for now
    logger.info('Configuration service shut down successfully');
  } catch (error) {
    logger.error('Error shutting down configuration service:', error);
    throw error;
  }
}

export default {
  initializeConfigService,
  createInitialConfig,
  validateConfig,
  updateConfig,
  saveConfig,
  loadConfig,
  listConfigs,
  deleteConfig,
  shutdownConfigService
};

// Made with Bob
