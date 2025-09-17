import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ChatPage from './pages/ChatPage';
import ConfigurationsPage from './pages/ConfigurationsPage';
import ConfigEditorPage from './pages/ConfigEditorPage';
import PreviewPage from './pages/PreviewPage';
import NotFoundPage from './pages/NotFoundPage';
import LLMProvidersPage from './pages/LLMProvidersPage';
import './styles/App.css';
import './styles/Chat.css';
import './styles/Config.css';
import './styles/LLMProviders.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:sessionId" element={<ChatPage />} />
          <Route path="configurations" element={<ConfigurationsPage />} />
          <Route path="configurations/new" element={<ConfigEditorPage />} />
          <Route path="configurations/:configId" element={<ConfigEditorPage />} />
          <Route path="preview/:configId" element={<PreviewPage />} />
          <Route path="providers" element={<LLMProvidersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

// Made with Bob