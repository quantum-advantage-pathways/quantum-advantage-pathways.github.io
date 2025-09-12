import { create } from 'zustand';
import { configApi, leaderboardApi } from '../services/api';

const useConfigStore = create((set, get) => ({
  // Configurations
  configurations: [],
  currentConfig: null,
  isLoadingConfigs: false,
  configsError: null,
  
  // Templates
  templates: [],
  isLoadingTemplates: false,
  templatesError: null,
  
  // Validation
  validationResult: null,
  isValidating: false,
  validationError: null,
  
  // Preview
  previewHtml: null,
  isGeneratingPreview: false,
  previewError: null,
  
  // Visualization preview
  visualizationSvg: null,
  isGeneratingVisualization: false,
  visualizationError: null,
  
  // Generation
  generationResult: null,
  isGenerating: false,
  generationError: null,
  
  // Actions
  
  // Load all configurations
  loadConfigurations: async () => {
    set({ isLoadingConfigs: true, configsError: null });
    
    try {
      const configurations = await configApi.getConfigurations();
      set({ configurations, isLoadingConfigs: false });
    } catch (error) {
      console.error('Error loading configurations:', error);
      set({ 
        isLoadingConfigs: false, 
        configsError: error.message || 'Failed to load configurations' 
      });
    }
  },
  
  // Load a specific configuration
  loadConfiguration: async (configId) => {
    set({ isLoadingConfigs: true, configsError: null });
    
    try {
      const config = await configApi.getConfiguration(configId);
      set({ currentConfig: config, isLoadingConfigs: false });
      return config;
    } catch (error) {
      console.error('Error loading configuration:', error);
      set({ 
        isLoadingConfigs: false, 
        configsError: error.message || 'Failed to load configuration' 
      });
      return null;
    }
  },
  
  // Create a new configuration
  createConfiguration: async (config) => {
    try {
      const newConfig = await configApi.createConfiguration(config);
      
      set(state => ({
        configurations: [...state.configurations, newConfig],
        currentConfig: newConfig
      }));
      
      return newConfig;
    } catch (error) {
      console.error('Error creating configuration:', error);
      return null;
    }
  },
  
  // Update a configuration
  updateConfiguration: async (configId, config) => {
    try {
      const updatedConfig = await configApi.updateConfiguration(configId, config);
      
      set(state => ({
        configurations: state.configurations.map(c => 
          c.id === configId ? updatedConfig : c
        ),
        currentConfig: state.currentConfig?.id === configId ? updatedConfig : state.currentConfig
      }));
      
      return updatedConfig;
    } catch (error) {
      console.error('Error updating configuration:', error);
      return null;
    }
  },
  
  // Delete a configuration
  deleteConfiguration: async (configId) => {
    try {
      await configApi.deleteConfiguration(configId);
      
      set(state => ({
        configurations: state.configurations.filter(c => c.id !== configId),
        currentConfig: state.currentConfig?.id === configId ? null : state.currentConfig
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting configuration:', error);
      return false;
    }
  },
  
  // Set the current configuration
  setCurrentConfig: (config) => {
    set({ currentConfig: config });
  },
  
  // Clear the current configuration
  clearCurrentConfig: () => {
    set({ currentConfig: null });
  },
  
  // Validate a configuration
  validateConfiguration: async (config) => {
    set({ isValidating: true, validationError: null });
    
    try {
      const result = await configApi.validateConfiguration(config);
      set({ validationResult: result, isValidating: false });
      return result;
    } catch (error) {
      console.error('Error validating configuration:', error);
      set({ 
        isValidating: false, 
        validationError: error.message || 'Failed to validate configuration' 
      });
      return null;
    }
  },
  
  // Load configuration templates
  loadTemplates: async () => {
    set({ isLoadingTemplates: true, templatesError: null });
    
    try {
      const templates = await configApi.getTemplates();
      set({ templates, isLoadingTemplates: false });
    } catch (error) {
      console.error('Error loading templates:', error);
      set({ 
        isLoadingTemplates: false, 
        templatesError: error.message || 'Failed to load templates' 
      });
    }
  },
  
  // Load a specific template
  loadTemplate: async (templateId) => {
    set({ isLoadingTemplates: true, templatesError: null });
    
    try {
      const template = await configApi.getTemplate(templateId);
      set({ isLoadingTemplates: false });
      return template;
    } catch (error) {
      console.error('Error loading template:', error);
      set({ 
        isLoadingTemplates: false, 
        templatesError: error.message || 'Failed to load template' 
      });
      return null;
    }
  },
  
  // Generate a preview
  generatePreview: async (config = null) => {
    const configToPreview = config || get().currentConfig;
    
    if (!configToPreview) return;
    
    set({ isGeneratingPreview: true, previewError: null });
    
    try {
      const html = await leaderboardApi.generatePreview(configToPreview);
      set({ previewHtml: html, isGeneratingPreview: false });
      return html;
    } catch (error) {
      console.error('Error generating preview:', error);
      set({ 
        isGeneratingPreview: false, 
        previewError: error.message || 'Failed to generate preview' 
      });
      return null;
    }
  },
  
  // Generate a visualization preview
  generateVisualizationPreview: async (config = null) => {
    const configToPreview = config || get().currentConfig;
    
    if (!configToPreview || !configToPreview.visualization) return;
    
    set({ isGeneratingVisualization: true, visualizationError: null });
    
    try {
      const svg = await leaderboardApi.generateVisualizationPreview(configToPreview);
      set({ visualizationSvg: svg, isGeneratingVisualization: false });
      return svg;
    } catch (error) {
      console.error('Error generating visualization:', error);
      set({ 
        isGeneratingVisualization: false, 
        visualizationError: error.message || 'Failed to generate visualization' 
      });
      return null;
    }
  },
  
  // Generate a leaderboard
  generateLeaderboard: async (configId = null, options = {}) => {
    const { currentConfig } = get();
    
    if (!configId && !currentConfig) return;
    
    set({ isGenerating: true, generationError: null });
    
    try {
      let result;
      
      if (configId) {
        result = await leaderboardApi.generateLeaderboard(configId, options);
      } else {
        result = await leaderboardApi.generateLeaderboardFromConfig(currentConfig, options);
      }
      
      set({ generationResult: result, isGenerating: false });
      return result;
    } catch (error) {
      console.error('Error generating leaderboard:', error);
      set({ 
        isGenerating: false, 
        generationError: error.message || 'Failed to generate leaderboard' 
      });
      return null;
    }
  }
}));

export default useConfigStore;

// Made with Bob
