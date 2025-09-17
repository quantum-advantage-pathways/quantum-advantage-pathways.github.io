/**
 * Chat Service for the Leaderboard Generator Chat Interface
 * 
 * This service handles chat sessions and messages, using the LLM service
 * to process messages and extract configuration data.
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import * as llmService from './llmService.js';
import * as configService from './configService.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default sessions directory
const DEFAULT_SESSIONS_DIR = path.join(__dirname, '..', '..', 'data', 'sessions');

// In-memory sessions store
const sessions = new Map();

// Session stages
const STAGES = {
  WELCOME: 'welcome',
  PROJECT_UNDERSTANDING: 'project_understanding',
  BASIC_CONFIGURATION: 'basic_configuration',
  COLUMN_DEFINITION: 'column_definition',
  VISUALIZATION_SETUP: 'visualization_setup',
  CONTENT_CREATION: 'content_creation',
  FINAL_REVIEW: 'final_review',
  GENERATION: 'generation'
};

/**
 * Initialize the chat service
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initializeChatService(options = {}) {
  logger.info('Initializing chat service...');
  
  try {
    // Create sessions directory if it doesn't exist
    const sessionsDir = options.sessionsDir || process.env.SESSIONS_DIR || DEFAULT_SESSIONS_DIR;
    await fs.ensureDir(sessionsDir);
    
    // Load existing sessions
    const sessionFiles = await fs.readdir(sessionsDir);
    
    for (const file of sessionFiles) {
      if (file.endsWith('.json')) {
        try {
          const sessionId = file.replace('.json', '');
          const sessionData = await fs.readJson(path.join(sessionsDir, file));
          
          sessions.set(sessionId, sessionData);
          logger.info(`Loaded session: ${sessionId}`);
        } catch (error) {
          logger.error(`Error loading session file ${file}:`, error);
        }
      }
    }
    
    logger.info(`Loaded ${sessions.size} sessions`);
    logger.info('Chat service initialized successfully');
  } catch (error) {
    logger.error('Error initializing chat service:', error);
    throw error;
  }
}

/**
 * Create a new chat session
 * @param {Object} options - Session options
 * @returns {Promise<Object>} - New session object
 */
export async function createSession(options = {}) {
  try {
    const sessionId = options.sessionId || uuidv4();
    const name = options.name || `Session ${new Date().toLocaleString()}`;
    
    // Create initial configuration
    const config = await configService.createInitialConfig();
    
    // Create session object
    const session = {
      id: sessionId,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      config,
      metadata: {
        currentStage: STAGES.WELCOME,
        completedStages: [],
        activeProvider: options.providerId || null
      }
    };
    
    // Add welcome message
    const welcomeMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `Welcome to the Leaderboard Generator! I'll help you create a custom leaderboard for the Quantum Advantage Framework.

I'll guide you through the process step by step, asking questions about your leaderboard. You can provide information in any order, and I'll help organize it into a proper configuration.

Let's start with the basics. What kind of leaderboard would you like to create? For example, it could be for quantum chemistry simulations, error correction codes, or any other quantum computing domain.`,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(welcomeMessage);
    
    // Save session
    sessions.set(sessionId, session);
    await saveSession(sessionId);
    
    logger.info(`Created new session: ${sessionId}`);
    
    return session;
  } catch (error) {
    logger.error('Error creating session:', error);
    throw error;
  }
}

/**
 * Get a session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - Session object
 */
export async function getSession(sessionId) {
  try {
    const session = sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    return session;
  } catch (error) {
    logger.error(`Error getting session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * List all sessions
 * @returns {Promise<Array<Object>>} - Array of session objects
 */
export async function listSessions() {
  try {
    return Array.from(sessions.values()).map(session => ({
      id: session.id,
      name: session.name,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      currentStage: session.metadata.currentStage
    }));
  } catch (error) {
    logger.error('Error listing sessions:', error);
    throw error;
  }
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} - True if successful
 */
export async function deleteSession(sessionId) {
  try {
    if (!sessions.has(sessionId)) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    // Remove from memory
    sessions.delete(sessionId);
    
    // Remove from disk
    const sessionsDir = process.env.SESSIONS_DIR || DEFAULT_SESSIONS_DIR;
    const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
    
    if (await fs.pathExists(sessionFile)) {
      await fs.remove(sessionFile);
    }
    
    logger.info(`Deleted session: ${sessionId}`);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Send a message in a session
 * @param {string} sessionId - Session ID
 * @param {string} message - Message content
 * @param {Object} options - Message options
 * @returns {Promise<Object>} - Response object
 */
export async function sendMessage(sessionId, message, options = {}) {
  try {
    // Get session
    const session = await getSession(sessionId);
    
    // Create user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    // Add to session
    session.messages.push(userMessage);
    session.updatedAt = new Date().toISOString();
    
    // Determine current stage and context
    const currentStage = session.metadata.currentStage;
    const context = buildContext(session);
    
    // Process with LLM
    const providerId = options.providerId || session.metadata.activeProvider;
    const messages = buildPrompt(session, context);
    
    const llmResponse = await llmService.processMessage(providerId, messages, {
      extractConfig: true,
      useFallback: true
    });
    
    // Create assistant message
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: llmResponse.content,
      timestamp: new Date().toISOString(),
      metadata: llmResponse.metadata
    };
    
    // Add to session
    session.messages.push(assistantMessage);
    
    // Update session metadata
    if (providerId) {
      session.metadata.activeProvider = providerId;
    }
    
    // Update configuration if extracted
    if (llmResponse.metadata?.extractedConfig) {
      const updatedConfig = await configService.updateConfig(
        session.config,
        llmResponse.metadata.extractedConfig
      );
      
      session.config = updatedConfig;
      
      // Update stage if needed
      const newStage = determineNextStage(session, currentStage);
      if (newStage !== currentStage) {
        session.metadata.currentStage = newStage;
        
        if (!session.metadata.completedStages.includes(currentStage)) {
          session.metadata.completedStages.push(currentStage);
        }
      }
    }
    
    // Save session
    await saveSession(sessionId);
    
    logger.info(`Processed message in session ${sessionId}`);
    
    return {
      messageId: assistantMessage.id,
      response: assistantMessage,
      updatedConfig: session.config
    };
  } catch (error) {
    logger.error(`Error sending message in session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Build context for the current session
 * @param {Object} session - Session object
 * @returns {Object} - Context object
 */
function buildContext(session) {
  const config = session.config;
  const currentStage = session.metadata.currentStage;
  const completedStages = session.metadata.completedStages;
  
  // Determine what information we have and what we need
  const context = {
    stage: currentStage,
    completedStages,
    hasBasicInfo: !!(config.id && config.title && config.shortDescription),
    hasColumns: !!(config.columns && config.columns.length > 0),
    hasVisualization: !!(config.visualization && config.visualization.type),
    hasContent: !!(config.content && config.content.sections && config.content.sections.length > 0),
    missingFields: []
  };
  
  // Identify missing required fields
  if (!config.id) context.missingFields.push('id');
  if (!config.title) context.missingFields.push('title');
  if (!config.shortDescription) context.missingFields.push('shortDescription');
  
  if (!context.hasColumns) {
    context.missingFields.push('columns');
  }
  
  if (!context.hasVisualization) {
    context.missingFields.push('visualization');
  }
  
  return context;
}

/**
 * Build prompt for the LLM based on session state
 * @param {Object} session - Session object
 * @param {Object} context - Context object
 * @returns {Array<Object>} - Array of message objects
 */
function buildPrompt(session, context) {
  const messages = [];
  
  // System message with instructions
  messages.push({
    role: 'system',
    content: `You are an assistant helping to create a leaderboard for the Quantum Advantage Framework.

Current stage: ${context.stage}
Completed stages: ${context.completedStages.join(', ') || 'none'}

The leaderboard configuration should follow this structure:
- id: URL-friendly identifier (lowercase with hyphens)
- title: Display title for the leaderboard
- shortDescription: Brief description shown in the hero section
- longDescription: Detailed description of the leaderboard
- columns: Array of column definitions for the table
- visualization: Configuration for the data visualization
- content: Additional content sections for the page

Current configuration state:
${JSON.stringify(session.config, null, 2)}

When the user provides information about the leaderboard they want to create, extract structured data from their request.
Respond conversationally, but also include a JSON object with the extracted configuration data.

The JSON should be formatted as follows:
\`\`\`json
{
  "extractedConfig": {
    // Configuration fields based on the user's request
  }
}
\`\`\`

Only include fields that you can confidently extract from the user's message.`
  });
  
  // Add stage-specific instructions
  switch (context.stage) {
    case STAGES.WELCOME:
      messages.push({
        role: 'system',
        content: `You are in the welcome stage. Ask the user about the type of leaderboard they want to create.
Focus on understanding the domain and purpose of the leaderboard.`
      });
      break;
      
    case STAGES.PROJECT_UNDERSTANDING:
      messages.push({
        role: 'system',
        content: `You are in the project understanding stage. Ask about the purpose, domain, and target audience of the leaderboard.
Try to extract the leaderboard's purpose and domain from the user's responses.`
      });
      break;
      
    case STAGES.BASIC_CONFIGURATION:
      messages.push({
        role: 'system',
        content: `You are in the basic configuration stage. Focus on getting the essential information:
- id: URL-friendly identifier (lowercase with hyphens)
- title: Display title for the leaderboard
- shortDescription: Brief description shown in the hero section
- longDescription: Detailed description of the leaderboard

Missing fields: ${context.missingFields.join(', ') || 'none'}`
      });
      break;
      
    case STAGES.COLUMN_DEFINITION:
      messages.push({
        role: 'system',
        content: `You are in the column definition stage. Help the user define the columns for their leaderboard table.
Each column needs:
- id: Unique identifier
- name: Display name
- type: Data type (number, text, percentage, time, hardware)
- width: CSS width (e.g., 100px)
- sortable: Whether the column is sortable (boolean)

The 'rank' column is always included by default.`
      });
      break;
      
    case STAGES.VISUALIZATION_SETUP:
      messages.push({
        role: 'system',
        content: `You are in the visualization setup stage. Help the user configure the data visualization.
The visualization needs:
- type: Visualization type (scatter, bar, line)
- xAxis: X-axis configuration (field, label, min, max)
- yAxis: Y-axis configuration (field, label, min, max)
- dataPoints: Data point configuration (categoryField, categories)`
      });
      break;
      
    case STAGES.CONTENT_CREATION:
      messages.push({
        role: 'system',
        content: `You are in the content creation stage. Help the user create additional content sections for their leaderboard.
Content sections can be:
- text: Simple text content with a title
- cards: Multiple cards with titles and content`
      });
      break;
      
    case STAGES.FINAL_REVIEW:
      messages.push({
        role: 'system',
        content: `You are in the final review stage. Present a summary of the leaderboard configuration to the user.
Ask if they want to make any changes before generating the leaderboard.`
      });
      break;
      
    case STAGES.GENERATION:
      messages.push({
        role: 'system',
        content: `You are in the generation stage. The leaderboard is ready to be generated.
Confirm with the user that they want to proceed with generation.`
      });
      break;
  }
  
  // Add conversation history (last 10 messages)
  const recentMessages = session.messages.slice(-10);
  
  for (const msg of recentMessages) {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  }
  
  return messages;
}

/**
 * Determine the next stage based on the current configuration
 * @param {Object} session - Session object
 * @param {string} currentStage - Current stage
 * @returns {string} - Next stage
 */
function determineNextStage(session, currentStage) {
  const config = session.config;
  const context = buildContext(session);
  
  // If we're in the welcome stage and have some basic info, move to project understanding
  if (currentStage === STAGES.WELCOME && (config.title || config.shortDescription)) {
    return STAGES.PROJECT_UNDERSTANDING;
  }
  
  // If we're in project understanding and have basic info, move to basic configuration
  if (currentStage === STAGES.PROJECT_UNDERSTANDING && (config.title && config.shortDescription)) {
    return STAGES.BASIC_CONFIGURATION;
  }
  
  // If we have all basic info, move to column definition
  if (currentStage === STAGES.BASIC_CONFIGURATION && context.hasBasicInfo) {
    return STAGES.COLUMN_DEFINITION;
  }
  
  // If we have columns, move to visualization setup
  if (currentStage === STAGES.COLUMN_DEFINITION && context.hasColumns) {
    return STAGES.VISUALIZATION_SETUP;
  }
  
  // If we have visualization, move to content creation
  if (currentStage === STAGES.VISUALIZATION_SETUP && context.hasVisualization) {
    return STAGES.CONTENT_CREATION;
  }
  
  // If we have content, move to final review
  if (currentStage === STAGES.CONTENT_CREATION && context.hasContent) {
    return STAGES.FINAL_REVIEW;
  }
  
  // If we're in final review and everything is complete, move to generation
  if (currentStage === STAGES.FINAL_REVIEW && 
      context.hasBasicInfo && 
      context.hasColumns && 
      context.hasVisualization && 
      context.hasContent) {
    return STAGES.GENERATION;
  }
  
  // Otherwise, stay in the current stage
  return currentStage;
}

/**
 * Save a session to disk
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
async function saveSession(sessionId) {
  try {
    const session = sessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const sessionsDir = process.env.SESSIONS_DIR || DEFAULT_SESSIONS_DIR;
    const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
    
    await fs.ensureDir(sessionsDir);
    await fs.writeJson(sessionFile, session, { spaces: 2 });
    
    logger.debug(`Saved session: ${sessionId}`);
  } catch (error) {
    logger.error(`Error saving session ${sessionId}:`, error);
    throw error;
  }
}

/**
 * Shutdown the chat service
 * @returns {Promise<void>}
 */
export async function shutdownChatService() {
  logger.info('Shutting down chat service...');
  
  try {
    // Save all sessions
    for (const [sessionId, session] of sessions.entries()) {
      try {
        const sessionsDir = process.env.SESSIONS_DIR || DEFAULT_SESSIONS_DIR;
        const sessionFile = path.join(sessionsDir, `${sessionId}.json`);
        
        await fs.ensureDir(sessionsDir);
        await fs.writeJson(sessionFile, session, { spaces: 2 });
        
        logger.debug(`Saved session during shutdown: ${sessionId}`);
      } catch (error) {
        logger.error(`Error saving session ${sessionId} during shutdown:`, error);
      }
    }
    
    // Clear sessions
    sessions.clear();
    
    logger.info('Chat service shut down successfully');
  } catch (error) {
    logger.error('Error shutting down chat service:', error);
    throw error;
  }
}

export default {
  initializeChatService,
  createSession,
  getSession,
  listSessions,
  deleteSession,
  sendMessage,
  shutdownChatService
};

// Made with Bob
