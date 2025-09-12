import React from 'react';
import Button from './Button';

function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction
}) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h2 className="empty-state-title">{title}</h2>}
      {description && <p className="empty-state-description">{description}</p>}
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

// Made with Bob
