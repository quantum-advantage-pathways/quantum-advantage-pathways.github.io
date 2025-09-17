import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigurationList from '../components/config/ConfigurationList';
import Alert from '../components/common/Alert';
import useConfigStore from '../store/configStore';

function ConfigurationsPage() {
  const navigate = useNavigate();
  
  const {
    configurations,
    isLoadingConfigs,
    configsError,
    loadConfigurations,
    deleteConfiguration
  } = useConfigStore();
  
  // Load configurations when the component mounts
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);
  
  const handleCreateConfig = () => {
    navigate('/configurations/new');
  };
  
  const handleDeleteConfig = async (configId) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      const success = await deleteConfiguration(configId);
      
      if (success) {
        // Refresh the list
        loadConfigurations();
      }
    }
  };
  
  return (
    <div className="configurations-page">
      {configsError && (
        <Alert type="error" onClose={() => useConfigStore.setState({ configsError: null })}>
          {configsError}
        </Alert>
      )}
      
      <ConfigurationList
        configurations={configurations}
        isLoading={isLoadingConfigs}
        onCreateConfig={handleCreateConfig}
        onDeleteConfig={handleDeleteConfig}
      />
    </div>
  );
}

export default ConfigurationsPage;

// Made with Bob
