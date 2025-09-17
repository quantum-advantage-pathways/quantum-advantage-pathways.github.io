/**
 * LLM Provider Routes
 * 
 * API routes for managing LLM providers
 */

import express from 'express';
import llmService from '../services/llmService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Get all providers
 * GET /api/v1/llm/providers
 */
router.get('/providers', async (req, res) => {
  try {
    const providers = llmService.getProviders();
    res.json(providers);
  } catch (error) {
    logger.error('Error getting providers:', error);
    res.status(500).json({ error: 'Failed to get providers', message: error.message });
  }
});

/**
 * Get a specific provider
 * GET /api/v1/llm/providers/:id
 */
router.get('/providers/:id', async (req, res) => {
  try {
    const provider = llmService.getProvider(req.params.id);
    res.json(provider.getInfo());
  } catch (error) {
    logger.error(`Error getting provider ${req.params.id}:`, error);
    res.status(404).json({ error: 'Provider not found', message: error.message });
  }
});

/**
 * Create a new provider
 * POST /api/v1/llm/providers
 */
router.post('/providers', async (req, res) => {
  try {
    // Generate a unique ID if not provided
    const id = req.body.id || `provider_${Date.now()}`;
    
    // Register the provider
    await llmService.registerProvider(id, req.body);
    
    // Get the provider info
    const provider = llmService.getProvider(id);
    
    res.status(201).json(provider.getInfo());
  } catch (error) {
    logger.error('Error creating provider:', error);
    res.status(400).json({ error: 'Failed to create provider', message: error.message });
  }
});

/**
 * Update a provider
 * PUT /api/v1/llm/providers/:id
 */
router.put('/providers/:id', async (req, res) => {
  try {
    // Update the provider
    await llmService.updateProviderConfig(req.params.id, req.body);
    
    // Get the updated provider info
    const provider = llmService.getProvider(req.params.id);
    
    res.json(provider.getInfo());
  } catch (error) {
    logger.error(`Error updating provider ${req.params.id}:`, error);
    res.status(400).json({ error: 'Failed to update provider', message: error.message });
  }
});

/**
 * Delete a provider
 * DELETE /api/v1/llm/providers/:id
 */
router.delete('/providers/:id', async (req, res) => {
  try {
    // Check if this is the default provider
    const isDefault = llmService.getDefaultProvider().id === req.params.id;
    
    if (isDefault) {
      return res.status(400).json({ 
        error: 'Cannot delete default provider',
        message: 'Set another provider as default before deleting this one'
      });
    }
    
    // Delete the provider
    await llmService.deleteProvider(req.params.id);
    
    res.json({ success: true, message: 'Provider deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting provider ${req.params.id}:`, error);
    res.status(400).json({ error: 'Failed to delete provider', message: error.message });
  }
});

/**
 * Test a provider
 * POST /api/v1/llm/providers/:id/test
 */
router.post('/providers/:id/test', async (req, res) => {
  try {
    const prompt = req.body.prompt || 'Hello, are you working correctly?';
    const result = await llmService.testProvider(req.params.id, prompt);
    res.json(result);
  } catch (error) {
    logger.error(`Error testing provider ${req.params.id}:`, error);
    res.status(400).json({ 
      success: false,
      error: 'Failed to test provider', 
      message: error.message 
    });
  }
});

/**
 * Set a provider as default
 * POST /api/v1/llm/providers/:id/default
 */
router.post('/providers/:id/default', async (req, res) => {
  try {
    llmService.setDefaultProvider(req.params.id);
    res.json({ success: true, message: 'Default provider updated successfully' });
  } catch (error) {
    logger.error(`Error setting default provider ${req.params.id}:`, error);
    res.status(400).json({ error: 'Failed to set default provider', message: error.message });
  }
});

/**
 * Get the default provider
 * GET /api/v1/llm/default
 */
router.get('/default', async (req, res) => {
  try {
    const provider = llmService.getDefaultProvider();
    res.json(provider.getInfo());
  } catch (error) {
    logger.error('Error getting default provider:', error);
    res.status(404).json({ error: 'No default provider set', message: error.message });
  }
});

export default router;
