import React from 'react';

function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  icon = null,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const iconOnlyClass = !children && icon ? 'btn-icon' : '';
  
  const buttonClasses = [
    baseClass,
    variantClass,
    sizeClass,
    iconOnlyClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="loading-spinner" style={{ width: '1em', height: '1em' }}></span>
          {children && <span className="ml-sm">{children}</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn-icon-left">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="btn-icon-right">{icon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;

// Made with Bob
