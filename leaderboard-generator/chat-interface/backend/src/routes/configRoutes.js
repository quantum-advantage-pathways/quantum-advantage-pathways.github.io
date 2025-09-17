/**
 * Configuration API Routes for the Leaderboard Generator Chat Interface
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import * as configService from '../services/configService.js';

const router = express.Router();

/**
 * Get all configurations
 * GET /api/v1/config
 */
router.get('/', async (req, res) => {
  try {
    const configs = await configService.getAllConfigurations();
    res.json(configs);
  } catch (error) {
    logger.error('Error getting configurations:', error);
    res.status(500).json({ error: 'Failed to get configurations' });
  }
});

/**
 * Create a new configuration
 * POST /api/v1/config
 */
router.post('/', async (req, res) => {
  try {
    const config = req.body;
    
    // Generate an ID if not provided
    if (!config.id) {
      config.id = uuidv4();
    }
    
    // Validate the configuration
    const validationResult = await configService.validateConfiguration(config);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: 'Invalid configuration',
        validationErrors: validationResult.errors
      });
    }
    
    // Save the configuration
    const savedConfig = await configService.saveConfiguration(config);
    
    logger.info(`Created new configuration: ${savedConfig.id}`);
    res.status(201).json(savedConfig);
  } catch (error) {
    logger.error('Error creating configuration:', error);
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

/**
 * Get a specific configuration
 * GET /api/v1/config/:configId
 */
router.get('/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    const config = await configService.getConfiguration(configId);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    logger.error(`Error getting configuration ${req.params.configId}:`, error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

/**
 * Update a configuration
 * PUT /api/v1/config/:configId
 */
router.put('/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    const config = req.body;
    
    // Ensure the ID in the body matches the URL
    if (config.id && config.id !== configId) {
      return res.status(400).json({ error: 'Configuration ID mismatch' });
    }
    
    // Set the ID from the URL
    config.id = configId;
    
    // Check if the configuration exists
    const existingConfig = await configService.getConfiguration(configId);
    
    if (!existingConfig) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    // Validate the configuration
    const validationResult = await configService.validateConfiguration(config);
    
    if (!validationResult.valid) {
      return res.status(400).json({
        error: 'Invalid configuration',
        validationErrors: validationResult.errors
      });
    }
    
    // Save the updated configuration
    const updatedConfig = await configService.saveConfiguration(config);
    
    logger.info(`Updated configuration: ${updatedConfig.id}`);
    res.json(updatedConfig);
  } catch (error) {
    logger.error(`Error updating configuration ${req.params.configId}:`, error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

/**
 * Delete a configuration
 * DELETE /api/v1/config/:configId
 */
router.delete('/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    const success = await configService.deleteConfiguration(configId);
    
    if (!success) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    logger.info(`Deleted configuration: ${configId}`);
    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting configuration ${req.params.configId}:`, error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

/**
 * Validate a configuration
 * POST /api/v1/config/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const config = req.body;
    const validationResult = await configService.validateConfiguration(config);
    
    res.json(validationResult);
  } catch (error) {
    logger.error('Error validating configuration:', error);
    res.status(500).json({ error: 'Failed to validate configuration' });
  }
});

/**
 * Get configuration templates
 * GET /api/v1/config/templates
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await configService.getConfigurationTemplates();
    res.json(templates);
  } catch (error) {
    logger.error('Error getting configuration templates:', error);
    res.status(500).json({ error: 'Failed to get configuration templates' });
  }
});

/**
 * Get a specific configuration template
 * GET /api/v1/config/templates/:templateId
 */
router.get('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await configService.getConfigurationTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    logger.error(`Error getting template ${req.params.templateId}:`, error);
    res.status(500).json({ error: 'Failed to get configuration template' });
  }
});

export default router;

// Made with Bob
