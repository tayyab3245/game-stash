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
  const styles = mode === 'light' ? lightStyles.volumeButton : darkStyles.volumeButton; // Use centralized styling
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

  const title = VolumeLogic.getTitle(level);

  // Apply centralized styling with behavior logic preserved
  const buttonStyle = {
    ...styles.button,
    ...style,
    color: styles.iconColor, // This sets the currentColor for the SVG
  };

  return (
    <div style={styles.container}>
      <button
        className={`volume-button ${className}`}
        style={buttonStyle}
        disabled={disabled}
        onClick={handleClick}
        title={title}
        onMouseEnter={(e) => {
          if (!disabled) {
            Object.assign(e.currentTarget.style, styles.buttonHover);
          }
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, buttonStyle);
        }}
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
