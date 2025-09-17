import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Loading from '../common/Loading';

function ConfigurationList({ 
  configurations, 
  isLoading, 
  onCreateConfig, 
  onDeleteConfig 
}) {
  if (isLoading) {
    return <Loading text="Loading configurations..." />;
  }
  
  if (!configurations || configurations.length === 0) {
    return (
      <EmptyState
        title="No configurations found"
        description="Create a new configuration or use the chat interface to generate one."
        actionText="Create Configuration"
        onAction={onCreateConfig}
      />
    );
  }
  
  return (
    <div className="config-list-container">
      <div className="config-list-header">
        <h2>Your Configurations</h2>
        <Button 
          variant="primary" 
          onClick={onCreateConfig}
        >
          Create New
        </Button>
      </div>
      
      <ul className="config-list">
        {configurations.map(config => (
          <li key={config.id} className="config-item">
            <div className="config-item-header">
              <h3 className="config-item-title">{config.title || config.id}</h3>
              <div className="config-item-actions">
                <Button 
                  variant="outline" 
                  size="sm" 
                  as={Link} 
                  to={`/configurations/${config.id}`}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  as={Link} 
                  to={`/preview/${config.id}`}
                >
                  Preview
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => onDeleteConfig(config.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="config-item-meta">
              <span>Type: {config.type || 'Standard'}</span>
              {config.lastModified && (
                <span> • Last modified: {new Date(config.lastModified).toLocaleDateString()}</span>
              )}
            </div>
            
            <div className="config-item-description">
              {config.description || 'No description provided.'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConfigurationList;

// Made with Bob
