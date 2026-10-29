// VolumeButton - speaker button that opens a TV-style volume column: + on top, − at the bottom
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";
import { MAX_VOLUME_LEVEL, VolumeLevel, VolumeLogic } from './VolumeButton.logic';
import { VolumeButtonProps } from './VolumeButton.types';
import VolumeIcon from './VolumeIcon';
import './VolumeButton.css';

const StepIcon: React.FC<{ plus?: boolean }> = ({ plus }) => (
  <svg viewBox="0 0 24 24" className="volume-meter__step-icon" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
    <path d="M6 12h12" />
    {plus && <path d="M12 6v12" />}
  </svg>
);

const VolumeButton: React.FC<VolumeButtonProps> = ({
  level,
  onChange,
  className = '',
  style = {},
  disabled = false,
}) => {
  const { mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.volumeButton : darkStyles.volumeButton;
  const [animationKey, setAnimationKey] = useState(0);
  const [meterOpen, setMeterOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Sync the audio engine with the starting level
  useEffect(() => {
    VolumeLogic.apply(level);
  }, []);

  // The meter stays open until you click somewhere else
  useEffect(() => {
    if (!meterOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMeterOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [meterOpen]);

  const commit = (next: VolumeLevel) => {
    VolumeLogic.set(next);
    onChange(next);
    setAnimationKey(prev => prev + 1);
  };

  const step = (delta: 1 | -1) => {
    const next = Math.max(0, Math.min(MAX_VOLUME_LEVEL, level + delta)) as VolumeLevel;
    commit(next); // at 0, minus just stays muted
  };

  const handleClick = () => {
    if (disabled) return;
    setMeterOpen(open => !open);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(2px)';
    e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
  };

  const release = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(0px)';
    e.currentTarget.style.boxShadow = styles.button?.boxShadow || '';
  };

  const buttonStyle = {
    ...styles.button,
    ...style,
    color: styles.iconColor,
    transition: 'all 0.15s ease',
    transform: 'translateY(0px)',
  };

  return (
    <div ref={rootRef} style={styles.container}>
      <button
        className={`volume-button ${className}`}
        style={buttonStyle}
        disabled={disabled}
        onClick={handleClick}
        title={VolumeLogic.getTitle(level)}
        aria-label={VolumeLogic.getTitle(level)}
        aria-expanded={meterOpen}
        onMouseDown={handleMouseDown}
        onMouseUp={release}
        onMouseLeave={release}
      >
        <VolumeIcon level={level} animationTrigger={animationKey} />
      </button>

      {/* TV-style column. DOM order is bottom→top (column-reverse): −, dashes 1…5, + */}
      <div
        className={`volume-meter volume-meter--${mode} ${meterOpen ? 'is-open' : ''}`}
        style={{ background: styles.button.background, boxShadow: styles.button.boxShadow, color: styles.iconColor }}
        role="group"
        aria-label="Volume level"
      >
        <button
          className={`volume-meter__step ${level === 0 ? 'is-muted' : ''}`}
          aria-label={level === 0 ? 'Muted' : 'Volume down'}
          onClick={() => step(-1)}
        >
          {/* Minus becomes a mute icon once the volume hits zero */}
          {level === 0 ? <VolumeIcon level={0} /> : <StepIcon />}
        </button>
        {Array.from({ length: MAX_VOLUME_LEVEL }, (_, i) => {
          const dashLevel = (i + 1) as VolumeLevel;
          return (
            <button
              key={dashLevel}
              className={`volume-meter__dash ${dashLevel <= level ? 'is-lit' : ''} ${dashLevel === level ? 'is-current' : ''}`}
              style={{ width: `${40 + i * 15}%` }}
              aria-label={`Volume ${dashLevel}`}
              onClick={() => commit(dashLevel)}
            />
          );
        })}
        <button
          className="volume-meter__step"
          aria-label="Volume up"
          disabled={level === MAX_VOLUME_LEVEL}
          onClick={() => step(1)}
        >
          <StepIcon plus />
        </button>
      </div>
    </div>
  );
};

export default VolumeButton;
