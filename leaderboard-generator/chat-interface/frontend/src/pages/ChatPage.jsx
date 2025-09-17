import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionList from '../components/chat/SessionList';
import ChatContainer from '../components/chat/ChatContainer';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import useChatStore from '../store/chatStore';
import useConfigStore from '../store/configStore';

function ChatPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const {
    sessions,
    currentSessionId,
    isLoadingSessions,
    sessionsError,
    loadSessions,
    createSession,
    deleteSession,
    setCurrentSession,
    stage,
    stageData
  } = useChatStore();
  
  const { 
    currentConfig, 
    setCurrentConfig,
    generateLeaderboard,
    isGenerating
  } = useConfigStore();
  
  // Load sessions when the component mounts
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);
  
  // Set the current session based on the URL parameter
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      setCurrentSession(sessionId);
    }
  }, [sessionId, currentSessionId, setCurrentSession]);
  
  // Update the URL when the current session changes
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      navigate(`/chat/${currentSessionId}`);
    }
  }, [currentSessionId, sessionId, navigate]);
  
  // Set the extracted config from the chat
  useEffect(() => {
    if (stageData?.extractedConfig && !currentConfig) {
      setCurrentConfig(stageData.extractedConfig);
    }
  }, [stageData, currentConfig, setCurrentConfig]);
  
  const handleCreateSession = async () => {
    const session = await createSession();
    if (session) {
      navigate(`/chat/${session.id}`);
    }
  };
  
  const handleSelectSession = (id) => {
    navigate(`/chat/${id}`);
  };
  
  const handleDeleteSession = async (id) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(id);
    }
  };
  
  const handleGenerateLeaderboard = () => {
    if (currentConfig) {
      generateLeaderboard();
    }
  };
  
  const handleEditConfig = () => {
    if (currentConfig) {
      navigate(`/configurations/${currentConfig.id}`);
    } else {
      navigate('/configurations/new');
    }
  };
  
  const showConfigActions = stage === 'configuration' || stage === 'refinement';
  
  return (
    <div className="page-with-sidebar">
      <aside className="sidebar">
        <SessionList
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          isLoading={isLoadingSessions}
        />
        
        {sessionsError && (
          <Alert type="error" onClose={() => useChatStore.setState({ sessionsError: null })}>
            {sessionsError}
          </Alert>
        )}
        
        {showConfigActions && currentConfig && (
          <div className="sidebar-actions">
            <h4>Configuration Actions</h4>
            <div className="button-group">
              <Button 
                variant="primary" 
                onClick={handleGenerateLeaderboard}
                isLoading={isGenerating}
                disabled={isGenerating}
              >
                Generate Leaderboard
              </Button>
              <Button 
                variant="outline" 
                onClick={handleEditConfig}
              >
                Edit Configuration
              </Button>
            </div>
          </div>
        )}
      </aside>
      
      <main className="main-content">
        <ChatContainer />
      </main>
    </div>
  );
}

export default ChatPage;

// Made with Bob
