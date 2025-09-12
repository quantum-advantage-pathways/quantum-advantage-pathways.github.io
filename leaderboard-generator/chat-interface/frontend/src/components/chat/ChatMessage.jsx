import React from 'react';
import ReactMarkdown from 'react-markdown';

function ChatMessage({ message, isLast }) {
  const { role, content } = message;
  const isUser = role === 'user';
  
  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`}>
      <div className="chat-message-avatar">
        {isUser ? (
          <div className="avatar avatar-user">U</div>
        ) : (
          <div className="avatar avatar-assistant">A</div>
        )}
      </div>
      
      <div className="chat-message-content">
        <div className="chat-message-bubble">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        
        {!isUser && isLast && (
          <div className="chat-message-actions">
            <button className="btn btn-sm btn-outline">
              <span className="icon">↻</span> Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;

// Made with Bob
