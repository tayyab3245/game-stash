// GridButton - Grid layout control with centralized styling
import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";
import { GridLogic } from './GridButton.logic';
import { GridButtonProps } from './GridButton.types';
import GridIcon from './GridIcon';

const GridButton: React.FC<GridButtonProps> = ({
  mode,
  onChange,
  filled = false,
  className = '',
  style = {},
  disabled = false,
}) => {
  const { theme, mode: themeMode } = useTheme();
  const styles = themeMode === 'light' ? lightStyles.gridButtons : darkStyles.gridButtons;
  const [isChanging, setIsChanging] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsChanging(true);
    onChange(mode); // Set to this button's mode, don't toggle
    
    // Reset animation state
    setTimeout(() => setIsChanging(false), 200);
  };

  // Button press effect handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const button = e.currentTarget;
    button.style.transform = 'translateY(2px)';
    button.style.boxShadow = styles.buttonActive?.boxShadow || '';
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

  const title = GridLogic.getTitle(mode);
  
  // Apply centralized styling with behavior logic preserved
  const buttonStyle = {
    ...styles.button,
    ...(filled ? styles.buttonActive : {}),
    ...style,
    color: styles.iconColor,
    transition: 'all 0.15s ease',
    transform: 'translateY(0px)',
  };

  const cssClasses = [
    'grid-button',
    `grid-button--mode-${mode}`,
    isChanging ? 'grid-button--changing' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={cssClasses}
      style={buttonStyle}
      disabled={disabled}
      onClick={handleClick}
      title={title}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <GridIcon 
        mode={mode}
        filled={filled}
        size={48}
      />
    </button>
  );
};

export default GridButton;
