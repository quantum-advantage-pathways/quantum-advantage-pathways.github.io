import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

function ChatInput({ onSendMessage, disabled, placeholder = 'Type your message...' }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  // Auto-resize the textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [message]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;
    
    onSendMessage(message);
    setMessage('');
  };
  
  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form className="chat-input-container" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className="chat-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
      />
      
      <Button 
        type="submit" 
        variant="primary"
        disabled={!message.trim() || disabled}
        icon="➤"
        iconPosition="right"
      >
        Send
      </Button>
    </form>
  );
}

export default ChatInput;

// Made with Bob
