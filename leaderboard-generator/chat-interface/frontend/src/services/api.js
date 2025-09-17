import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API endpoints
export const chatApi = {
  // Get all chat sessions
  getSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },
  
  // Get a specific chat session
  getSession: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },
  
  // Create a new chat session
  createSession: async (name = 'New Chat') => {
    const response = await api.post('/chat/sessions', { name });
    return response.data;
  },
  
  // Delete a chat session
  deleteSession: async (sessionId) => {
    await api.delete(`/chat/sessions/${sessionId}`);
    return true;
  },
  
  // Get messages for a chat session
  getMessages: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },
  
  // Send a message in a chat session
  sendMessage: async (sessionId, content) => {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
    return response.data;
  },
  
  // Get the current conversation stage
  getStage: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/stage`);
    return response.data;
  },
  
  // Update the conversation stage
  updateStage: async (sessionId, stage, stageData = {}) => {
    const response = await api.put(`/chat/sessions/${sessionId}/stage`, { stage, stageData });
    return response.data;
  }
};

// Configuration API endpoints
export const configApi = {
  // Get all configurations
  getConfigurations: async () => {
    const response = await api.get('/config');
    return response.data;
  },
  
  // Get a specific configuration
  getConfiguration: async (configId) => {
    const response = await api.get(`/config/${configId}`);
    return response.data;
  },
  
  // Create a new configuration
  createConfiguration: async (config) => {
    const response = await api.post('/config', config);
    return response.data;
  },
  
  // Update a configuration
  updateConfiguration: async (configId, config) => {
    const response = await api.put(`/config/${configId}`, config);
    return response.data;
  },
  
  // Delete a configuration
  deleteConfiguration: async (configId) => {
    await api.delete(`/config/${configId}`);
    return true;
  },
  
  // Validate a configuration
  validateConfiguration: async (config) => {
    const response = await api.post('/config/validate', config);
    return response.data;
  },
  
  // Get configuration templates
  getTemplates: async () => {
    const response = await api.get('/config/templates');
    return response.data;
  },
  
  // Get a specific configuration template
  getTemplate: async (templateId) => {
    const response = await api.get(`/config/templates/${templateId}`);
    return response.data;
  }
};

// Leaderboard API endpoints
export const leaderboardApi = {
  // Generate a leaderboard
  generateLeaderboard: async (configId, options = {}) => {
    const response = await api.post('/leaderboard/generate', { configId, options });
    return response.data;
  },
  
  // Generate a leaderboard from a configuration object
  generateLeaderboardFromConfig: async (config, options = {}) => {
    const response = await api.post('/leaderboard/generate', { config, options });
    return response.data;
  },
  
  // Generate a preview of a leaderboard
  generatePreview: async (config) => {
    const response = await api.post('/leaderboard/preview', { config }, {
      responseType: 'text',
      headers: {
        'Accept': 'text/html'
      }
    });
    return response.data;
  },
  
  // Generate a visualization preview
  generateVisualizationPreview: async (config) => {
    const response = await api.post('/leaderboard/visualization-preview', { config }, {
      responseType: 'text',
      headers: {
        'Accept': 'image/svg+xml'
      }
    });
    return response.data;
  },
  
  // Get the status of a leaderboard generation
  getGenerationStatus: async (jobId) => {
    const response = await api.get(`/leaderboard/status/${jobId}`);
    return response.data;
  }
};

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default {
  chat: chatApi,
  config: configApi,
  leaderboard: leaderboardApi
};

// Made with Bob
