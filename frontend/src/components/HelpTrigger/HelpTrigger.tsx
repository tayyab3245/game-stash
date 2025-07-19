import React from 'react';
import './HelpTrigger.css';

interface HelpTriggerProps {
  onClick: () => void;
  visible: boolean;
  hintsActive?: boolean; // Whether hints are currently showing
  yOffset?: number; // Adjustable Y position offset from bottom
}

const HelpTrigger: React.FC<HelpTriggerProps> = ({ onClick, visible, hintsActive = false, yOffset = 20 }) => {
  if (!visible) return null;

  return (
    <button 
      className={`help-trigger ${hintsActive ? 'help-trigger--active' : ''}`}
      onClick={onClick}
      aria-label={hintsActive ? "Hints enabled - click to disable" : "Hints disabled - click to enable"}
      style={{ bottom: `${yOffset}px` }} // Only keep the positioning override
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          cx="10" 
          cy="10" 
          r="9" 
          stroke="currentColor" 
          strokeWidth="2"
        />
        <path 
          d="M10 6V10M10 14H10.01" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default HelpTrigger;
