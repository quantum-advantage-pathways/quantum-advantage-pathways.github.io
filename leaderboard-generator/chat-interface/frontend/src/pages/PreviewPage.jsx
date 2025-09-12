import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import useConfigStore from '../store/configStore';

function PreviewPage() {
  const { configId } = useParams();
  const navigate = useNavigate();
  
  const [error, setError] = useState(null);
  
  const {
    currentConfig,
    isLoadingConfigs,
    previewHtml,
    visualizationSvg,
    isGeneratingPreview,
    isGeneratingVisualization,
    previewError,
    visualizationError,
    loadConfiguration,
    generatePreview,
    generateVisualizationPreview,
    generateLeaderboard,
    isGenerating
  } = useConfigStore();
  
  // Load the configuration and generate previews
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load the configuration
        await loadConfiguration(configId);
        
        // Generate previews
        generatePreview();
        generateVisualizationPreview();
      } catch (err) {
        setError(err.message || 'Failed to load configuration');
      }
    };
    
    loadData();
  }, [configId, loadConfiguration, generatePreview, generateVisualizationPreview]);
  
  const handleEditConfig = () => {
    navigate(`/configurations/${configId}`);
  };
  
  const handleGenerateLeaderboard = () => {
    generateLeaderboard(configId);
  };
  
  const handleBack = () => {
    navigate('/configurations');
  };
  
  if (isLoadingConfigs) {
    return <Loading text="Loading configuration..." />;
  }
  
  if (!currentConfig) {
    return (
      <div className="preview-page">
        <Alert type="error">
          Configuration not found
        </Alert>
        <Button variant="primary" onClick={handleBack}>
          Back to Configurations
        </Button>
      </div>
    );
  }
  
  return (
    <div className="preview-page">
      <div className="preview-page-header">
        <h1>Preview: {currentConfig.title || currentConfig.id}</h1>
        <div className="preview-page-actions">
          <Button 
            variant="outline" 
            onClick={handleEditConfig}
          >
            Edit Configuration
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGenerateLeaderboard}
            isLoading={isGenerating}
            disabled={isGenerating}
          >
            Generate Leaderboard
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {previewError && (
        <Alert type="error" onClose={() => useConfigStore.setState({ previewError: null })}>
          {previewError}
        </Alert>
      )}
      
      {visualizationError && (
        <Alert type="error" onClose={() => useConfigStore.setState({ visualizationError: null })}>
          {visualizationError}
        </Alert>
      )}
      
      <div className="preview-section">
        <h2>Visualization Preview</h2>
        {isGeneratingVisualization ? (
          <Loading text="Generating visualization preview..." />
        ) : visualizationSvg ? (
          <div 
            className="visualization-preview"
            dangerouslySetInnerHTML={{ __html: visualizationSvg }}
          />
        ) : (
          <div className="empty-preview">
            <p>No visualization preview available</p>
          </div>
        )}
      </div>
      
      <div className="preview-section">
        <h2>Leaderboard Preview</h2>
        {isGeneratingPreview ? (
          <Loading text="Generating leaderboard preview..." />
        ) : previewHtml ? (
          <div className="preview-container">
            <div className="preview-header">
              <h3>Preview</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => generatePreview()}
              >
                Refresh
              </Button>
            </div>
            <div className="preview-content">
              <iframe
                title="Leaderboard Preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts"
              />
            </div>
          </div>
        ) : (
          <div className="empty-preview">
            <p>No leaderboard preview available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewPage;

// Made with Bob
