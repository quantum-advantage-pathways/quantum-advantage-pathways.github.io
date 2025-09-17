import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="empty-state">
        <div className="empty-state-icon">404</div>
        <h2 className="empty-state-title">Page Not Found</h2>
        <p className="empty-state-description">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;

// Made with Bob
