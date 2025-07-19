import React from 'react';
import './HelpTrigger.css';

interface HelpTriggerProps {
  onClick: () => void;
  visible: boolean;
  hintsActive?: boolean; // Whether hints are currently showing
  yOffset?: number; // Adjustable Y position offset from bottom
  message?: string | null; // Optional message to display next to button
  theme?: 'light' | 'dark'; // Theme for message styling
}

const HelpTrigger: React.FC<HelpTriggerProps> = ({ 
  onClick, 
  visible, 
  hintsActive = false, 
  yOffset = 20, 
  message = null,
  theme = 'dark'
}) => {
  if (!visible) return null;

  return (
    <>
      <button 
        className={`help-trigger ${hintsActive ? 'help-trigger--active' : ''}`}
        onClick={onClick}
        aria-label={hintsActive ? "Hints enabled - click to disable" : "Hints disabled - click to enable"}
        style={{ bottom: `${yOffset}px` }}
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle 
            cx="10" 
            cy="10" 
            r="9" 
            stroke="currentColor" 
            strokeWidth="2.5"
          />
          <path 
            d="M10 6V10M10 14H10.01" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {/* Message popup positioned relative to this button */}
      {message && (
        <div 
          className="help-trigger-message"
          style={{
            position: 'fixed',
            bottom: `${yOffset + 36}px`, // Position at button center (button bottom + half height)
            right: '110px',
            background: theme === 'light' ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            color: theme === 'light' ? '#ffffff' : '#141414',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            whiteSpace: 'nowrap',
            animation: 'helpMessageFadeInOut 2s ease-in-out forwards',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            // Use line-height to vertically center text instead of transforms
            lineHeight: '1',
            minHeight: '30px', // Give it a consistent height
          }}
        >
          {message}
          {/* Arrow pointing to button */}
          <div style={{
            width: 0,
            height: 0,
            borderLeft: `6px solid ${theme === 'light' ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)'}`,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            position: 'absolute',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
        </div>
      )}
    </>
  );
};

export default HelpTrigger;
