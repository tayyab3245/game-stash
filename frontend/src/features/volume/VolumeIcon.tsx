// Pure SVG volume icon component
import React from 'react';
import { VolumeLevel } from './VolumeButton.logic';

interface VolumeIconProps {
  level: VolumeLevel;
  animationTrigger?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VolumeIcon: React.FC<VolumeIconProps> = ({
  level,
  animationTrigger = 0,
  className = '',
  style = {},
}) => {
  return (
    <svg
      viewBox="-4 -4 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        width: '80px',
        height: '80px',
        position: 'relative',
        overflow: 'visible',
        ...style,
      }}
    >
      {/* Speaker body (filled) */}
      <path
        d="M6 12a1 1 0 0 1 1-1h3.5l4-3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1l-4-3H7a1 1 0 0 1-1-1V12z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      
      {/* Sound waves with animation classes */}
      {level > 0 && (
        <path
          className={`volume-waves volume-waves-trigger-${animationTrigger}`}
          d="M17 12.2a3 3 0 0 1 0 5.6"
          fill="none"
        />
      )}
      {level > 1 && (
        <path
          className={`volume-waves volume-waves-trigger-${animationTrigger}`}
          d="M21 10a5.5 5.5 0 0 1 0 10"
          fill="none"
        />
      )}
      {level > 2 && (
        <path
          className={`volume-waves volume-waves-trigger-${animationTrigger}`}
          d="M25 8a8 8 0 0 1 0 14"
          fill="none"
        />
      )}
      
      {/* Mute slash */}
      {level === 0 && <line x1="17" y1="9" x2="24" y2="21" />}
    </svg>
  );
};

export default VolumeIcon;
