/**
 * API Routes Index
 * 
 * This file exports all API routes for the chat interface.
 */

import express from 'express';
import chatRoutes from './chatRoutes.js';
import configRoutes from './configRoutes.js';
import leaderboardRoutes from './leaderboardRoutes.js';
import llmRoutes from './llmRoutes.js';

const router = express.Router();

// API version and health check
router.get('/', (req, res) => {
  res.json({
    name: 'Leaderboard Generator Chat Interface API',
    version: '1.0.0',
    status: 'ok'
  });
});

// Mount routes
router.use('/chat', chatRoutes);
router.use('/config', configRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/llm', llmRoutes);

export default router;