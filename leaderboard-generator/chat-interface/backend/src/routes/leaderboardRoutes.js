/**
 * Leaderboard API Routes for the Leaderboard Generator Chat Interface
 */

import express from 'express';
import logger from '../utils/logger.js';
import * as leaderboardService from '../services/leaderboardService.js';
import * as configService from '../services/configService.js';

const router = express.Router();

/**
 * Generate a leaderboard from a configuration
 * POST /api/v1/leaderboard/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { configId, config, options = {} } = req.body;
    
    let leaderboardConfig;
    
    // Get configuration by ID or use provided config
    if (configId) {
      leaderboardConfig = await configService.getConfiguration(configId);
      
      if (!leaderboardConfig) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
    } else if (config) {
      // Validate the provided configuration
      const validationResult = await configService.validateConfiguration(config);
      
      if (!validationResult.valid) {
        return res.status(400).json({
          error: 'Invalid configuration',
          validationErrors: validationResult.errors
        });
      }
      
      leaderboardConfig = config;
    } else {
      return res.status(400).json({ error: 'Either configId or config must be provided' });
    }
    
    // Generate the leaderboard
    const result = await leaderboardService.generateLeaderboardFiles(leaderboardConfig, options);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to generate leaderboard',
        details: result.error,
        logs: result.logs
      });
    }
    
    res.json({
      success: true,
      path: result.path,
      logs: result.logs
    });
  } catch (error) {
    logger.error('Error generating leaderboard:', error);
    res.status(500).json({ error: 'Failed to generate leaderboard' });
  }
});

/**
 * Generate a preview of a leaderboard
 * POST /api/v1/leaderboard/preview
 */
router.post('/preview', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Configuration is required' });
    }
    
    // Generate the preview
    const html = await leaderboardService.generatePreview(config);
    
    res.send(html);
  } catch (error) {
    logger.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

/**
 * Generate a visualization preview
 * POST /api/v1/leaderboard/visualization-preview
 */
router.post('/visualization-preview', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !config.visualization) {
      return res.status(400).json({ error: 'Visualization configuration is required' });
    }
    
    // Generate the visualization preview
    const svg = await leaderboardService.generateVisualizationPreview(config);
    
    res.set('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    logger.error('Error generating visualization preview:', error);
    res.status(500).json({ error: 'Failed to generate visualization preview' });
  }
});

/**
 * Get the status of a leaderboard generation
 * GET /api/v1/leaderboard/status/:jobId
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // This would be implemented if we had a job queue system
    // For now, we'll just return a mock response
    res.json({
      jobId,
      status: 'completed',
      progress: 100,
      result: {
        success: true,
        path: `/leaderboard/${jobId}`
      }
    });
  } catch (error) {
    logger.error(`Error getting job status ${req.params.jobId}:`, error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

export default router;

// Made with Bob
