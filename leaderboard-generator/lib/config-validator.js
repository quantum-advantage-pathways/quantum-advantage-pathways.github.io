/**
 * Configuration validator for leaderboard generator
 */

import Ajv from 'ajv';
import chalk from 'chalk';
import { leaderboardSchema } from './schema.js';
import fs from 'fs-extra';
import path from 'path';

// Initialize Ajv
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(leaderboardSchema);

/**
 * Validates a leaderboard configuration against the schema
 * @param {Object} config - The configuration object to validate
 * @returns {Object} - Object with isValid flag and any errors
 */
export function validateConfig(config) {
  const valid = validate(config);
  
  if (!valid) {
    return {
      isValid: false,
      errors: validate.errors
    };
  }
  
  return {
    isValid: true,
    errors: null
  };
}

/**
 * Validates a configuration file
 * @param {string} configPath - Path to the configuration file
 * @returns {Object} - The validated configuration object
 * @throws {Error} - If the configuration is invalid
 */
export async function validateConfigFile(configPath) {
  try {
    // Check if file exists
    if (!await fs.pathExists(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    // Read and parse the configuration file
    const configContent = await fs.readFile(configPath, 'utf8');
    let config;
    
    try {
      config = JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Invalid JSON in configuration file: ${error.message}`);
    }
    
    // Validate the configuration
    const { isValid, errors } = validateConfig(config);
    
    if (!isValid) {
      console.error(chalk.red('Configuration validation failed:'));
      
      errors.forEach(error => {
        console.error(chalk.red(`  - ${error.instancePath || '/'}: ${error.message}`));
      });
      
      throw new Error('Invalid configuration');
    }
    
    // Check for existing leaderboard with the same ID
    const leaderboardDir = path.join(process.cwd(), '..', 'leaderboard', config.id);
    
    if (await fs.pathExists(leaderboardDir)) {
      console.warn(chalk.yellow(`Warning: Leaderboard with ID '${config.id}' already exists at ${leaderboardDir}`));
      // We don't throw an error here, just warn the user
    }
    
    return config;
  } catch (error) {
    throw error;
  }
}

/**
 * Formats validation errors in a user-friendly way
 * @param {Array} errors - Validation errors from Ajv
 * @returns {string} - Formatted error message
 */
export function formatValidationErrors(errors) {
  if (!errors || errors.length === 0) {
    return '';
  }
  
  return errors.map(error => {
    const path = error.instancePath || '/';
    return `${path}: ${error.message}`;
  }).join('\n');
}

export default {
  validateConfig,
  validateConfigFile,
  formatValidationErrors
};

// Made with Bob
