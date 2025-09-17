import { create } from 'zustand';
import { chatApi } from '../services/api';

const useChatStore = create((set, get) => ({
  // Chat sessions
  sessions: [],
  currentSessionId: null,
  isLoadingSessions: false,
  sessionsError: null,
  
  // Messages
  messages: [],
  isLoadingMessages: false,
  messagesError: null,
  
  // Message input
  messageInput: '',
  isSendingMessage: false,
  sendMessageError: null,
  
  // Conversation stage
  stage: 'introduction',
  stageData: {},
  
  // Actions
  
  // Set message input
  setMessageInput: (input) => set({ messageInput: input }),
  
  // Load all chat sessions
  loadSessions: async () => {
    set({ isLoadingSessions: true, sessionsError: null });
    
    try {
      const sessions = await chatApi.getSessions();
      set({ sessions, isLoadingSessions: false });
    } catch (error) {
      console.error('Error loading sessions:', error);
      set({ 
        isLoadingSessions: false, 
        sessionsError: error.message || 'Failed to load chat sessions' 
      });
    }
  },
  
  // Create a new chat session
  createSession: async (name = 'New Chat') => {
    set({ isLoadingSessions: true, sessionsError: null });
    
    try {
      const session = await chatApi.createSession(name);
      set(state => ({ 
        sessions: [...state.sessions, session],
        currentSessionId: session.id,
        isLoadingSessions: false,
        messages: []
      }));
      
      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      set({ 
        isLoadingSessions: false, 
        sessionsError: error.message || 'Failed to create chat session' 
      });
      return null;
    }
  },
  
  // Delete a chat session
  deleteSession: async (sessionId) => {
    try {
      await chatApi.deleteSession(sessionId);
      
      set(state => {
        const newSessions = state.sessions.filter(s => s.id !== sessionId);
        const newCurrentSessionId = state.currentSessionId === sessionId 
          ? (newSessions.length > 0 ? newSessions[0].id : null) 
          : state.currentSessionId;
          
        return {
          sessions: newSessions,
          currentSessionId: newCurrentSessionId,
          messages: newCurrentSessionId === state.currentSessionId ? state.messages : []
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  },
  
  // Set the current session
  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
    const { loadMessages } = get();
    loadMessages(sessionId);
  },
  
  // Load messages for the current session
  loadMessages: async (sessionId = null) => {
    const id = sessionId || get().currentSessionId;
    
    if (!id) return;
    
    set({ isLoadingMessages: true, messagesError: null });
    
    try {
      const messages = await chatApi.getMessages(id);
      set({ messages, isLoadingMessages: false });
      
      // Also load the stage
      const { loadStage } = get();
      await loadStage(id);
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ 
        isLoadingMessages: false, 
        messagesError: error.message || 'Failed to load messages' 
      });
    }
  },
  
  // Send a message
  sendMessage: async (content) => {
    const { currentSessionId, messageInput } = get();
    const messageContent = content || messageInput;
    
    if (!currentSessionId || !messageContent.trim()) return;
    
    set({ isSendingMessage: true, sendMessageError: null, messageInput: '' });
    
    try {
      const result = await chatApi.sendMessage(currentSessionId, messageContent);
      
      set(state => ({
        messages: [
          ...state.messages, 
          result.userMessage, 
          result.assistantMessage
        ],
        isSendingMessage: false
      }));
      
      // Update stage if needed
      if (result.extractedConfig) {
        set(state => ({
          stageData: {
            ...state.stageData,
            extractedConfig: result.extractedConfig
          }
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        isSendingMessage: false, 
        sendMessageError: error.message || 'Failed to send message',
        messageInput: messageContent // Restore the message input
      });
      return null;
    }
  },
  
  // Load the conversation stage
  loadStage: async (sessionId = null) => {
    const id = sessionId || get().currentSessionId;
    
    if (!id) return;
    
    try {
      const { stage, stageData } = await chatApi.getStage(id);
      set({ stage, stageData });
      return { stage, stageData };
    } catch (error) {
      console.error('Error loading stage:', error);
      return null;
    }
  },
  
  // Update the conversation stage
  updateStage: async (stage, stageData = {}) => {
    const { currentSessionId } = get();
    
    if (!currentSessionId) return;
    
    try {
      const result = await chatApi.updateStage(currentSessionId, stage, stageData);
      set({ stage: result.stage, stageData: result.stageData });
      return result;
    } catch (error) {
      console.error('Error updating stage:', error);
      return null;
    }
  }
}));

export default useChatStore;

// Made with Bob
