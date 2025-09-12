import React from 'react';

function Card({ 
  title, 
  children, 
  actions, 
  className = '', 
  headerClassName = '',
  contentClassName = '',
  footerClassName = ''
}) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className={`card-header ${headerClassName}`}>
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      
      <div className={`card-content ${contentClassName}`}>
        {children}
      </div>
      
      {actions && (
        <div className={`card-footer ${footerClassName}`}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default Card;

// Made with Bob
