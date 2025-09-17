import React from 'react';

function Loading({ size = 'md', text = 'Loading...' }) {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'width: 1rem; height: 1rem; border-width: 2px;';
      case 'lg':
        return 'width: 2.5rem; height: 2.5rem; border-width: 4px;';
      case 'md':
      default:
        return 'width: 1.5rem; height: 1.5rem; border-width: 3px;';
    }
  };

  return (
    <div className="loading-container">
      <div className="loading-spinner" style={{ ...getSpinnerSize() }}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default Loading;

// Made with Bob
