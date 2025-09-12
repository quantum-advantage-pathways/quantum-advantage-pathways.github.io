import React, { useEffect } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import Alert from '../common/Alert';
import useChatStore from '../../store/chatStore';

function ChatContainer() {
  const {
    messages,
    isLoadingMessages,
    messagesError,
    isSendingMessage,
    sendMessageError,
    currentSessionId,
    sendMessage,
    loadMessages
  } = useChatStore();
  
  // Load messages when the component mounts or the session changes
  useEffect(() => {
    if (currentSessionId) {
      loadMessages();
    }
  }, [currentSessionId, loadMessages]);
  
  const handleSendMessage = (content) => {
    sendMessage(content);
  };
  
  return (
    <div className="chat-container">
      {messagesError && (
        <Alert type="error" onClose={() => useChatStore.setState({ messagesError: null })}>
          {messagesError}
        </Alert>
      )}
      
      {sendMessageError && (
        <Alert type="error" onClose={() => useChatStore.setState({ sendMessageError: null })}>
          {sendMessageError}
        </Alert>
      )}
      
      <ChatHistory 
        messages={messages} 
        isLoading={isLoadingMessages} 
      />
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isSendingMessage || !currentSessionId}
        placeholder={!currentSessionId ? 'Select or create a chat to start' : 'Type your message...'}
      />
    </div>
  );
}

export default ChatContainer;

// Made with Bob
