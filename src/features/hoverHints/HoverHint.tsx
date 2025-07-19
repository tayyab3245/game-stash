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
  const timeoutRef = React.useRef<number | null>(null);
  const autoHideRef = React.useRef<number | null>(null);

  // Handle visibility with delay
  React.useEffect(() => {
    if (visible) {
      timeoutRef.current = setTimeout(() => {
        setShowHint(true);
        
        // Auto-hide if specified
        if (autoHide > 0) {
          autoHideRef.current = setTimeout(() => {
            setShowHint(false);
          }, autoHide);
        }
      }, delay);
    } else {
      setShowHint(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (autoHideRef.current) {
        clearTimeout(autoHideRef.current);
        autoHideRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
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

  if (!showHint) return null;

  return (
    <div
      className={`hover-hint hover-hint--${type}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="hover-hint__content">
        <span className="hover-hint-text">{getHintMessage()}</span>
      </div>
    </div>
  );
};

export default HoverHint;
