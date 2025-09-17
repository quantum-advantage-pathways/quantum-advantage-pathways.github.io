import React from 'react';

function Alert({ type = 'info', children, onClose }) {
  const alertClass = `alert alert-${type}`;
  
  return (
    <div className={alertClass}>
      {children}
      {onClose && (
        <button 
          className="alert-close" 
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default Alert;

// Made with Bob
