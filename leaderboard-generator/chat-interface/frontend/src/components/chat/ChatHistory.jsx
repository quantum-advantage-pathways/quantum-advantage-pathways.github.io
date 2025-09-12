import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import Loading from '../common/Loading';

function ChatHistory({ messages, isLoading }) {
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  if (isLoading) {
    return (
      <div className="chat-history">
        <Loading text="Loading messages..." />
      </div>
    );
  }
  
  if (!messages || messages.length === 0) {
    return (
      <div className="chat-history chat-history-empty">
        <div className="chat-history-placeholder">
          <h3>Start a conversation</h3>
          <p>Ask questions about creating a leaderboard or describe what you want to build.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-history">
      {messages.map((message, index) => (
        <ChatMessage 
          key={index} 
          message={message} 
          isLast={index === messages.length - 1 && message.role === 'assistant'} 
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatHistory;

// Made with Bob
