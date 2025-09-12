import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Card from '../common/Card';

function LLMProviderForm({ 
  provider = {}, 
  onSave, 
  onCancel, 
  isLoading 
}) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'openai',
    baseUrl: '',
    apiKey: '',
    defaultModel: '',
    models: [],
    requiresAuth: true,
    authType: 'bearer',
    authHeaderName: 'Authorization',
    authQueryParam: 'api_key',
    timeout: 30000,
    ...provider
  });
  
  const [errors, setErrors] = useState({});
  
  // Update form data when provider changes
  useEffect(() => {
    if (provider) {
      setFormData(prevData => ({
        ...prevData,
        ...provider
      }));
    }
  }, [provider]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: parseInt(value, 10)
    }));
  };
  
  const handleModelsChange = (e) => {
    const models = e.target.value.split(',').map(model => model.trim()).filter(Boolean);
    setFormData(prevData => ({
      ...prevData,
      models
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  // Determine which fields to show based on provider type
  const showOpenAIFields = formData.type === 'openai';
  const showLocalFields = formData.type === 'local';
  const showProxyFields = formData.type === 'proxy';
  
  return (
    <form onSubmit={handleSubmit} className="llm-provider-form">
      <Card title="Provider Information">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Display Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="type" className="form-label">Provider Type</label>
          <select
            id="type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="openai">OpenAI</option>
            <option value="local">Local LLM</option>
            <option value="proxy">Proxy (OpenAI-compatible)</option>
          </select>
          {errors.type && <div className="form-error">{errors.type}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="baseUrl" className="form-label">Base URL</label>
          <input
            type="text"
            id="baseUrl"
            name="baseUrl"
            className="form-control"
            value={formData.baseUrl}
            onChange={handleChange}
            placeholder={
              formData.type === 'openai' ? 'https://api.openai.com/v1' : 
              formData.type === 'local' ? 'http://localhost:8000/v1' :
              'http://localhost:8080/v1'
            }
            required
          />
          {errors.baseUrl && <div className="form-error">{errors.baseUrl}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="defaultModel" className="form-label">Default Model</label>
          <input
            type="text"
            id="defaultModel"
            name="defaultModel"
            className="form-control"
            value={formData.defaultModel}
            onChange={handleChange}
            placeholder={
              formData.type === 'openai' ? 'gpt-4' : 
              formData.type === 'local' ? 'llama3' :
              'default-model'
            }
            required
          />
          {errors.defaultModel && <div className="form-error">{errors.defaultModel}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="models" className="form-label">Available Models (comma-separated)</label>
          <input
            type="text"
            id="models"
            name="models"
            className="form-control"
            value={formData.models.join(', ')}
            onChange={handleModelsChange}
            placeholder={
              formData.type === 'openai' ? 'gpt-4, gpt-3.5-turbo' : 
              formData.type === 'local' ? 'llama3, mistral' :
              'default-model'
            }
          />
          {errors.models && <div className="form-error">{errors.models}</div>}
        </div>
      </Card>
      
      <Card title="Authentication">
        {(showOpenAIFields || showProxyFields) && (
          <>
            {showProxyFields && (
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="requiresAuth"
                  name="requiresAuth"
                  checked={formData.requiresAuth}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="requiresAuth" className="checkbox-label">Requires Authentication</label>
              </div>
            )}
            
            {(showOpenAIFields || (showProxyFields && formData.requiresAuth)) && (
              <>
                <div className="form-group">
                  <label htmlFor="apiKey" className="form-label">API Key</label>
                  <input
                    type="password"
                    id="apiKey"
                    name="apiKey"
                    className="form-control"
                    value={formData.apiKey}
                    onChange={handleChange}
                    required={showOpenAIFields || (showProxyFields && formData.requiresAuth)}
                  />
                  {errors.apiKey && <div className="form-error">{errors.apiKey}</div>}
                </div>
                
                {showProxyFields && (
                  <>
                    <div className="form-group">
                      <label htmlFor="authType" className="form-label">Authentication Type</label>
                      <select
                        id="authType"
                        name="authType"
                        className="form-control"
                        value={formData.authType}
                        onChange={handleChange}
                      >
                        <option value="bearer">Bearer Token</option>
                        <option value="header">Custom Header</option>
                        <option value="query">Query Parameter</option>
                      </select>
                    </div>
                    
                    {formData.authType === 'header' && (
                      <div className="form-group">
                        <label htmlFor="authHeaderName" className="form-label">Header Name</label>
                        <input
                          type="text"
                          id="authHeaderName"
                          name="authHeaderName"
                          className="form-control"
                          value={formData.authHeaderName}
                          onChange={handleChange}
                          placeholder="Authorization"
                        />
                      </div>
                    )}
                    
                    {formData.authType === 'query' && (
                      <div className="form-group">
                        <label htmlFor="authQueryParam" className="form-label">Query Parameter Name</label>
                        <input
                          type="text"
                          id="authQueryParam"
                          name="authQueryParam"
                          className="form-control"
                          value={formData.authQueryParam}
                          onChange={handleChange}
                          placeholder="api_key"
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </Card>
      
      {showLocalFields && (
        <Card title="Local LLM Settings">
          <div className="form-group">
            <label htmlFor="serverType" className="form-label">Server Type</label>
            <select
              id="serverType"
              name="serverType"
              className="form-control"
              value={formData.serverType || 'ollama'}
              onChange={handleChange}
            >
              <option value="ollama">Ollama</option>
              <option value="lmstudio">LM Studio</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="startupTimeout" className="form-label">Startup Timeout (ms)</label>
            <input
              type="number"
              id="startupTimeout"
              name="startupTimeout"
              className="form-control"
              value={formData.startupTimeout || 30000}
              onChange={handleNumberChange}
              min="1000"
              step="1000"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startupRetries" className="form-label">Startup Retries</label>
            <input
              type="number"
              id="startupRetries"
              name="startupRetries"
              className="form-control"
              value={formData.startupRetries || 3}
              onChange={handleNumberChange}
              min="1"
              max="10"
            />
          </div>
        </Card>
      )}
      
      {showProxyFields && (
        <Card title="Proxy Settings">
          <div className="form-group">
            <label htmlFor="timeout" className="form-label">Request Timeout (ms)</label>
            <input
              type="number"
              id="timeout"
              name="timeout"
              className="form-control"
              value={formData.timeout || 30000}
              onChange={handleNumberChange}
              min="1000"
              step="1000"
            />
          </div>
        </Card>
      )}
      
      <div className="form-actions">
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading}
          disabled={isLoading}
        >
          Save Provider
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default LLMProviderForm;

// Made with Bob
