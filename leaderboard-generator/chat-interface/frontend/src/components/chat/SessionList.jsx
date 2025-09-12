import React from 'react';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import Loading from '../common/Loading';

function SessionList({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onCreateSession, 
  onDeleteSession,
  isLoading 
}) {
  if (isLoading) {
    return <Loading text="Loading sessions..." />;
  }
  
  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        title="No chat sessions"
        description="Start a new conversation to create a leaderboard."
        actionText="New Chat"
        onAction={onCreateSession}
      />
    );
  }
  
  return (
    <div className="session-list-container">
      <div className="session-list-header">
        <h3>Your Chats</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCreateSession}
        >
          New
        </Button>
      </div>
      
      <ul className="session-list">
        {sessions.map(session => (
          <li 
            key={session.id} 
            className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(session.id)}
          >
            <span className="session-item-title">{session.name || 'Untitled Chat'}</span>
            
            <div className="session-item-actions">
              <button 
                className="btn btn-icon btn-sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                aria-label="Delete session"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionList;

// Made with Bob
