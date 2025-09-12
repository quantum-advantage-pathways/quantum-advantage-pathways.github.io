import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import '../styles/Layout.css';

function Layout() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <h1>Quantum Advantage Leaderboard Generator</h1>
        </div>
        <nav className="main-nav">
          <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>
            Chat
          </NavLink>
          <NavLink to="/configurations" className={({ isActive }) => isActive ? 'active' : ''}>
            Configurations
          </NavLink>
          <NavLink to="/providers" className={({ isActive }) => isActive ? 'active' : ''}>
            LLM Providers
          </NavLink>
        </nav>
      </header>
      
      <main className="app-content">
        <Outlet />
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Quantum Advantage Pathways</p>
      </footer>
    </div>
  );
}

export default Layout;

// Made with Bob