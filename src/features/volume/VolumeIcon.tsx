// Volume icon - chunky rounded speaker; waves for volume, an X when muted (like the Switch)
import React from 'react';
import { VolumeLevel, VolumeLogic } from './VolumeButton.logic';

interface VolumeIconProps {
  level: VolumeLevel;
  animationTrigger?: number; // bumps on each change to replay the wave wiggle
  className?: string;
  style?: React.CSSProperties;
}

const WAVES = [
  'M20.2 12.6a4.6 4.6 0 0 1 0 6.8',
  'M23.4 9.6a8.8 8.8 0 0 1 0 12.8',
  'M26.6 6.6a13 13 0 0 1 0 18.8',
];

const VolumeIcon: React.FC<VolumeIconProps> = ({
  level,
  animationTrigger = 0,
  className = '',
  style = {},
}) => {
  const waves = VolumeLogic.waveCount(level);
  const muted = level === 0;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`volume-icon ${className}`}
      style={{ overflow: 'visible', ...style }}
    >
      {/* Speaker: soft, rounded body */}
      <path
        className="volume-icon__speaker"
        key={`speaker-${animationTrigger}`}
        d="M4.5 13.2c0-1.2.9-2 2-2h3.2l4.9-3.9c1-.8 2.4-.1 2.4 1.2v14.9c0 1.3-1.4 2-2.4 1.2l-4.9-3.9H6.5c-1.1 0-2-.9-2-2z"
        fill="currentColor"
      />

      {/* Waves fade/pop in as the level rises */}
      {WAVES.map((d, i) => (
        <path
          key={`wave-${i}-${animationTrigger}`}
          className="volume-icon__wave"
          d={d}
          style={{
            opacity: i < waves ? 1 : 0,
            transform: i < waves ? 'scale(1)' : 'scale(0.6)',
            transitionDelay: `${i * 0.05}s`,
          }}
        />
      ))}

      {/* Muted: a rounded X beside the speaker */}
      <g
        className="volume-icon__mute"
        style={{ opacity: muted ? 1 : 0, transform: muted ? 'scale(1)' : 'scale(0.4)' }}
      >
        <path d="M21.5 12.5l7 7M28.5 12.5l-7 7" strokeWidth="2.8" />
      </g>
    </svg>
  );
};

export default VolumeIcon;
