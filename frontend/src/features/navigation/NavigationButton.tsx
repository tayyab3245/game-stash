// NavigationButton - Circular arrow button with centralized styling
import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { getEnhancedTheme } from '../../core/theme';
import ArrowIcon from './ArrowIcon';
import { NavigationButtonProps } from './NavigationButton.types';

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  disabled = false,
  size = 72,
  className = '',
}) => {
  const baseTheme = useTheme();
  const theme = getEnhancedTheme(baseTheme);
  const styles = theme.styles.navigationButton;
  const [isActive, setIsActive] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsActive(true);
    onMouseDown?.();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsActive(false);
    onMouseUp?.();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsActive(false);
    onMouseLeave?.();
  };

  const buttonStyle = {
    ...styles.button,
    ...styles[direction], // Apply left/right positioning
    ...(isActive ? styles.buttonActive : {}),
    width: size,
    height: size,
  };

  return (
    <button
      className={`navigation-button navigation-button--${direction} ${className}`}
      style={buttonStyle}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      // Removed hover logic: no style changes on hover
    >
      <ArrowIcon 
        direction={direction}
        size={Math.round(size * 0.4)} // Scale arrow to button size
        color={styles.arrowColor}
      />
    </button>
  );
};

export default NavigationButton;
