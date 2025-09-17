import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfigForm from '../components/config/ConfigForm';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import useConfigStore from '../store/configStore';

function ConfigEditorPage() {
  const { configId } = useParams();
  const navigate = useNavigate();
  const isNewConfig = configId === 'new';
  
  const [error, setError] = useState(null);
  
  const {
    currentConfig,
    isLoadingConfigs,
    validationResult,
    isValidating,
    loadConfiguration,
    createConfiguration,
    updateConfiguration,
    validateConfiguration,
    clearCurrentConfig
  } = useConfigStore();
  
  // Load the configuration if editing an existing one
  useEffect(() => {
    if (!isNewConfig) {
      loadConfiguration(configId);
    } else {
      clearCurrentConfig();
    }
    
    // Cleanup when unmounting
    return () => {
      clearCurrentConfig();
    };
  }, [configId, isNewConfig, loadConfiguration, clearCurrentConfig]);
  
  const handleSave = async (configData) => {
    try {
      // Validate the configuration first
      const validation = await validateConfiguration(configData);
      
      if (!validation.valid) {
        return; // The form will display validation errors
      }
      
      let savedConfig;
      
      if (isNewConfig) {
        savedConfig = await createConfiguration(configData);
      } else {
        savedConfig = await updateConfiguration(configId, configData);
      }
      
      if (savedConfig) {
        navigate('/configurations');
      }
    } catch (err) {
      setError(err.message || 'Failed to save configuration');
    }
  };
  
  const handleCancel = () => {
    navigate('/configurations');
  };
  
  if (!isNewConfig && isLoadingConfigs) {
    return <Loading text="Loading configuration..." />;
  }
  
  return (
    <div className="config-editor-page">
      <h1>{isNewConfig ? 'Create New Configuration' : 'Edit Configuration'}</h1>
      
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <ConfigForm
        config={isNewConfig ? null : currentConfig}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isValidating}
        validationResult={validationResult}
      />
    </div>
  );
}

export default ConfigEditorPage;

// Made with Bob
