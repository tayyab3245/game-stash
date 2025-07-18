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
    // Add press effect
    const button = e.currentTarget as HTMLButtonElement;
    button.style.transform = 'translateY(2px)';
    button.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
    onMouseDown?.();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsActive(false);
    // Remove press effect
    const button = e.currentTarget as HTMLButtonElement;
    button.style.transform = 'translateY(0px)';
    button.style.boxShadow = styles.button?.boxShadow || '';
    onMouseUp?.();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsActive(false);
    // Remove press effect
    const button = e.currentTarget as HTMLButtonElement;
    button.style.transform = 'translateY(0px)';
    button.style.boxShadow = styles.button?.boxShadow || '';
    onMouseLeave?.();
  };

  const buttonStyle = {
    ...styles.button,
    ...styles[direction], // Apply left/right positioning
    ...(isActive ? styles.buttonActive : {}),
    width: size,
    height: size,
    transition: 'all 0.15s ease',
    transform: 'translateY(0px)',
  };

  return (
    <button
      className={`navigation-button navigation-button--${direction} ${className}`}
      style={buttonStyle}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
