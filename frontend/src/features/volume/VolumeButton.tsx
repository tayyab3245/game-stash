// VolumeButton - Volume control with centralized styling
import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";
import { VolumeLogic } from './VolumeButton.logic';
import { VolumeButtonProps } from './VolumeButton.types';
import VolumeIcon from './VolumeIcon';

const VolumeButton: React.FC<VolumeButtonProps> = ({
  level,
  onChange,
  className = '',
  style = {},
  disabled = false,
}) => {
  const { theme, mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.volumeButton : darkStyles.volumeButton;
  const [animationKey, setAnimationKey] = useState(0);

  const handleClick = () => {
    if (disabled) return;
    
    const nextLevel = VolumeLogic.cycle(level);
    onChange(nextLevel);
    
    // Trigger animation if volume is turned on
    if (VolumeLogic.shouldAnimate(nextLevel)) {
      setAnimationKey(prev => prev + 1);
    }
  };

  // Button press effect handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const button = e.currentTarget;
    button.style.transform = 'translateY(2px)';
    // Use a pressed shadow effect
    button.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const button = e.currentTarget;
    button.style.transform = 'translateY(0px)';
    button.style.boxShadow = styles.button?.boxShadow || '';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const button = e.currentTarget;
    button.style.transform = 'translateY(0px)';
    button.style.boxShadow = styles.button?.boxShadow || '';
  };

  const title = VolumeLogic.getTitle(level);

  // Apply centralized styling with behavior logic preserved
  const buttonStyle = {
    ...styles.button,
    ...style,
    color: styles.iconColor,
    transition: 'all 0.15s ease',
    transform: 'translateY(0px)',
  };

  return (
    <div style={styles.container}>
      <button
        className={`volume-button ${className}`}
        style={buttonStyle}
        disabled={disabled}
        onClick={handleClick}
        title={title}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <VolumeIcon 
          level={level}
          animationTrigger={animationKey}
        />
      </button>
    </div>
  );
};

export default VolumeButton;
