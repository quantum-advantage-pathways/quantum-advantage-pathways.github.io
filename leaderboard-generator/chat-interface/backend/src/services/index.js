/**
 * Service initialization for the Leaderboard Generator Chat Interface
 */

import { initializeChatService, shutdownChatService } from './chatService.js';
import { initializeConfigService, shutdownConfigService } from './configService.js';
import { initializeLeaderboardService, shutdownLeaderboardService } from './leaderboardService.js';
import { initializeLLMService, shutdownLLMService } from './llmService.js';
import logger from '../utils/logger.js';

/**
 * Initialize all services
 * @returns {Promise<void>}
 */
export async function initializeServices() {
  logger.info('Initializing services...');
  
  try {
    // Initialize services in order of dependency
    await initializeLLMService();
    await initializeConfigService();
    await initializeChatService();
    await initializeLeaderboardService();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    throw error;
  }
}

/**
 * Shutdown all services
 * @returns {Promise<void>}
 */
export async function shutdownServices() {
  logger.info('Shutting down services...');
  
  try {
    // Shutdown in reverse order of initialization
    await shutdownLeaderboardService();
    await shutdownChatService();
    await shutdownConfigService();
    await shutdownLLMService();
    
    logger.info('All services shut down successfully');
  } catch (error) {
    logger.error('Error shutting down services:', error);
    throw error;
  }
}

// Export individual service functions for testing
export {
  initializeChatService,
  initializeConfigService,
  initializeLeaderboardService,
  initializeLLMService,
  shutdownChatService,
  shutdownConfigService,
  shutdownLeaderboardService,
  shutdownLLMService
};

// Made with Bob
