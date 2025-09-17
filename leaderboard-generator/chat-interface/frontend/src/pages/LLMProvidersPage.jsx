import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import LLMProviderForm from '../components/config/LLMProviderForm';
import axios from 'axios';

function LLMProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  
  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);
  
  // Fetch providers from API
  const fetchProviders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/v1/llm/providers');
      setProviders(response.data);
    } catch (err) {
      setError('Failed to load LLM providers. Please try again.');
      console.error('Error fetching providers:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle provider selection
  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setIsEditing(false);
  };
  
  // Handle create new provider
  const handleCreateNew = () => {
    setSelectedProvider(null);
    setIsCreating(true);
    setIsEditing(true);
  };
  
  // Handle edit provider
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    
    if (isCreating) {
      setSelectedProvider(null);
    }
  };
  
  // Handle save provider
  const handleSave = async (providerData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      let response;
      
      if (isCreating) {
        // Create new provider
        response = await axios.post('/api/v1/llm/providers', providerData);
        setSuccessMessage(`Provider "${providerData.name}" created successfully.`);
      } else {
        // Update existing provider
        response = await axios.put(`/api/v1/llm/providers/${selectedProvider.id}`, providerData);
        setSuccessMessage(`Provider "${providerData.name}" updated successfully.`);
      }
      
      // Refresh providers list
      await fetchProviders();
      
      // Select the newly created/updated provider
      setSelectedProvider(response.data);
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      setError(`Failed to ${isCreating ? 'create' : 'update'} provider. ${err.response?.data?.message || err.message}`);
      console.error('Error saving provider:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete provider
  const handleDelete = async () => {
    if (!selectedProvider) return;
    
    if (!window.confirm(`Are you sure you want to delete the provider "${selectedProvider.name}"?`)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/v1/llm/providers/${selectedProvider.id}`);
      setSuccessMessage(`Provider "${selectedProvider.name}" deleted successfully.`);
      
      // Refresh providers list
      await fetchProviders();
      
      // Clear selection
      setSelectedProvider(null);
    } catch (err) {
      setError(`Failed to delete provider. ${err.response?.data?.message || err.message}`);
      console.error('Error deleting provider:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle test provider
  const handleTest = async () => {
    if (!selectedProvider) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await axios.post(`/api/v1/llm/providers/${selectedProvider.id}/test`);
      
      if (response.data.success) {
        setSuccessMessage(`Provider "${selectedProvider.name}" test successful. Response: "${response.data.response}"`);
      } else {
        setError(`Provider test failed: ${response.data.error}`);
      }
    } catch (err) {
      setError(`Failed to test provider. ${err.response?.data?.message || err.message}`);
      console.error('Error testing provider:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle set as default
  const handleSetDefault = async () => {
    if (!selectedProvider) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(`/api/v1/llm/providers/${selectedProvider.id}/default`);
      setSuccessMessage(`Provider "${selectedProvider.name}" set as default.`);
      
      // Refresh providers list
      await fetchProviders();
    } catch (err) {
      setError(`Failed to set provider as default. ${err.response?.data?.message || err.message}`);
      console.error('Error setting default provider:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render provider status badge
  const renderStatusBadge = (status) => {
    let className = 'status-badge';
    
    switch (status) {
      case 'active':
        className += ' status-active';
        break;
      case 'inactive':
        className += ' status-inactive';
        break;
      case 'error':
        className += ' status-error';
        break;
      default:
        className += ' status-unknown';
    }
    
    return <span className={className}>{status}</span>;
  };
  
  // Render provider list
  const renderProviderList = () => {
    if (providers.length === 0) {
      return (
        <EmptyState
          title="No LLM Providers"
          message="No LLM providers have been configured yet."
          action={
            <Button variant="primary" onClick={handleCreateNew}>
              Add Provider
            </Button>
          }
        />
      );
    }
    
    return (
      <div className="provider-list">
        {providers.map(provider => (
          <div 
            key={provider.id}
            className={`provider-item ${selectedProvider?.id === provider.id ? 'selected' : ''}`}
            onClick={() => handleSelectProvider(provider)}
          >
            <div className="provider-name">
              {provider.name}
              {provider.isDefault && <span className="default-badge">Default</span>}
            </div>
            <div className="provider-type">{provider.type}</div>
            <div className="provider-status">
              {renderStatusBadge(provider.status)}
            </div>
          </div>
        ))}
        
        <div className="provider-actions">
          <Button variant="primary" onClick={handleCreateNew}>
            Add Provider
          </Button>
        </div>
      </div>
    );
  };
  
  // Render provider details
  const renderProviderDetails = () => {
    if (!selectedProvider) {
      return (
        <EmptyState
          title="No Provider Selected"
          message="Select a provider from the list or create a new one."
        />
      );
    }
    
    if (isEditing) {
      return (
        <LLMProviderForm
          provider={selectedProvider}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      );
    }
    
    return (
      <div className="provider-details">
        <div className="provider-header">
          <h2>{selectedProvider.name}</h2>
          <div className="provider-header-actions">
            <Button variant="outline" onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
        
        <div className="provider-info">
          <div className="info-group">
            <div className="info-label">Type</div>
            <div className="info-value">{selectedProvider.type}</div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Status</div>
            <div className="info-value">
              {renderStatusBadge(selectedProvider.status)}
              {selectedProvider.errorMessage && (
                <div className="error-message">{selectedProvider.errorMessage}</div>
              )}
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Base URL</div>
            <div className="info-value">{selectedProvider.baseUrl}</div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Default Model</div>
            <div className="info-value">{selectedProvider.defaultModel}</div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Available Models</div>
            <div className="info-value">
              {selectedProvider.models && selectedProvider.models.length > 0 ? (
                <ul className="models-list">
                  {selectedProvider.models.map(model => (
                    <li key={model}>{model}</li>
                  ))}
                </ul>
              ) : (
                <span className="no-models">No models available</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="provider-actions">
          <Button variant="primary" onClick={handleTest}>
            Test Connection
          </Button>
          {!selectedProvider.isDefault && (
            <Button variant="outline" onClick={handleSetDefault}>
              Set as Default
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  // Render create provider form
  const renderCreateForm = () => {
    return (
      <div className="create-provider">
        <h2>Create New Provider</h2>
        <LLMProviderForm
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    );
  };
  
  return (
    <div className="llm-providers-page">
      <div className="page-header">
        <h1>LLM Providers</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      
      {isLoading && <Loading />}
      
      <div className="providers-container">
        <Card title="Available Providers" className="providers-list-card">
          {renderProviderList()}
        </Card>
        
        <Card title={isCreating ? "Create Provider" : "Provider Details"} className="provider-details-card">
          {isCreating ? renderCreateForm() : renderProviderDetails()}
        </Card>
      </div>
    </div>
  );
}

export default LLMProvidersPage;

// Made with Bob
