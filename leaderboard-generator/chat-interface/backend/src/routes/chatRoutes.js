/**
 * Chat API Routes for the Leaderboard Generator Chat Interface
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import * as chatService from '../services/chatService.js';
import * as llmService from '../services/llmService.js';

const router = express.Router();

/**
 * Create a new chat session
 * POST /api/v1/chat/sessions
 */
router.post('/sessions', async (req, res) => {
  try {
    const { name = 'New Chat' } = req.body;
    
    const sessionId = uuidv4();
    const session = await chatService.createSession(sessionId, { name });
    
    logger.info(`Created new chat session: ${sessionId}`);
    res.status(201).json(session);
  } catch (error) {
    logger.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

/**
 * Get all chat sessions
 * GET /api/v1/chat/sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await chatService.getSessions();
    res.json(sessions);
  } catch (error) {
    logger.error('Error getting chat sessions:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

/**
 * Get a specific chat session
 * GET /api/v1/chat/sessions/:sessionId
 */
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await chatService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.json(session);
  } catch (error) {
    logger.error(`Error getting chat session ${req.params.sessionId}:`, error);
    res.status(500).json({ error: 'Failed to get chat session' });
  }
});

/**
 * Delete a chat session
 * DELETE /api/v1/chat/sessions/:sessionId
 */
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const success = await chatService.deleteSession(sessionId);
    
    if (!success) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    logger.info(`Deleted chat session: ${sessionId}`);
    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting chat session ${req.params.sessionId}:`, error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

/**
 * Get messages for a chat session
 * GET /api/v1/chat/sessions/:sessionId/messages
 */
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await chatService.getMessages(sessionId);
    
    if (!messages) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.json(messages);
  } catch (error) {
    logger.error(`Error getting messages for session ${req.params.sessionId}:`, error);
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
});

/**
 * Send a message in a chat session
 * POST /api/v1/chat/sessions/:sessionId/messages
 */
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, role = 'user' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Add the user message to the session
    const userMessage = await chatService.addMessage(sessionId, { role, content });
    
    if (!userMessage) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    // Get the conversation history
    const messages = await chatService.getMessages(sessionId);
    
    // Generate a response using the LLM service
    const llmResponse = await llmService.generateChatResponse(messages);
    
    // Add the assistant's response to the session
    const assistantMessage = await chatService.addMessage(sessionId, {
      role: 'assistant',
      content: llmResponse.content
    });
    
    // Extract configuration if available
    if (llmResponse.configuration) {
      await chatService.updateSessionMetadata(sessionId, {
        extractedConfig: llmResponse.configuration
      });
    }
    
    // Return both messages
    res.status(201).json({
      userMessage,
      assistantMessage,
      extractedConfig: llmResponse.configuration
    });
  } catch (error) {
    logger.error(`Error sending message in session ${req.params.sessionId}:`, error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * Get the current conversation stage
 * GET /api/v1/chat/sessions/:sessionId/stage
 */
router.get('/sessions/:sessionId/stage', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await chatService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    res.json({
      stage: session.metadata?.stage || 'introduction',
      stageData: session.metadata?.stageData || {}
    });
  } catch (error) {
    logger.error(`Error getting stage for session ${req.params.sessionId}:`, error);
    res.status(500).json({ error: 'Failed to get conversation stage' });
  }
});

/**
 * Update the conversation stage
 * PUT /api/v1/chat/sessions/:sessionId/stage
 */
router.put('/sessions/:sessionId/stage', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { stage, stageData = {} } = req.body;
    
    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' });
    }
    
    const success = await chatService.updateSessionMetadata(sessionId, {
      stage,
      stageData
    });
    
    if (!success) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    
    logger.info(`Updated stage for session ${sessionId} to ${stage}`);
    res.json({ stage, stageData });
  } catch (error) {
    logger.error(`Error updating stage for session ${req.params.sessionId}:`, error);
    res.status(500).json({ error: 'Failed to update conversation stage' });
  }
});

export default router;

// Made with Bob
