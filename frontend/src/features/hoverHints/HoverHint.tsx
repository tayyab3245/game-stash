import React from 'react';
import { HoverHintProps } from './types';
import './HoverHint.css';

const HoverHint: React.FC<HoverHintProps> = ({
  visible,
  position,
  type,
  message,
  delay = 1000,
  autoHide = 0,
  onDismiss
}) => {
  const [showHint, setShowHint] = React.useState(false);
  const [showDismissButton, setShowDismissButton] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  const autoHideRef = React.useRef<number | null>(null);
  const dismissTimeoutRef = React.useRef<number | null>(null);

  // Handle visibility with delay
  React.useEffect(() => {
    if (visible) {
      timeoutRef.current = setTimeout(() => {
        setShowHint(true);
        
        // Show dismiss button after additional delay (only after hint is shown)
        dismissTimeoutRef.current = setTimeout(() => {
          setShowDismissButton(true);
        }, 2000); // Show X button 2 seconds after hint appears
        
        // Auto-hide if specified
        if (autoHide > 0) {
          autoHideRef.current = setTimeout(() => {
            setShowHint(false);
            setShowDismissButton(false);
          }, autoHide);
        }
      }, delay);
    } else {
      setShowHint(false);
      setShowDismissButton(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (autoHideRef.current) {
        clearTimeout(autoHideRef.current);
        autoHideRef.current = null;
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    };
  }, [visible, delay, autoHide]);

  // Get hint message based on type
  const getHintMessage = () => {
    switch (type) {
      case 'rotate':
        return 'Drag to rotate game cover';
      case 'navigate':
        return 'Use arrow keys to navigate';
      case 'select':
        return 'Click to select';
      case 'custom':
        return message || '';
      default:
        return '';
    }
  };

  const handleMouseEnter = () => {
    // Only show dismiss button if hint is already visible and stable
    if (showHint) {
      setShowDismissButton(true);
    }
  };

  const handleMouseLeave = () => {
    // Graceful fade out with delay
    setTimeout(() => {
      setShowDismissButton(false);
    }, 300); // Smooth delay before hiding
  };

  if (!showHint) return null;

  return (
    <div
      className={`hover-hint hover-hint--${type}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hover-hint__content">
        <span className="hover-hint-text">{getHintMessage()}</span>
      </div>
      {showDismissButton && (
        <button 
          className="hover-hint-dismiss" 
          onClick={onDismiss}
          aria-label="Dismiss hint"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 4L4 12M4 4L12 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HoverHint;
