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
  const styles = themeMode === 'light' ? lightStyles.gridButtons : darkStyles.gridButtons; // Use centralized styling
  const [isChanging, setIsChanging] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsChanging(true);
    const nextMode = GridLogic.getNextMode(mode);
    onChange(nextMode);
    
    // Reset animation state
    setTimeout(() => setIsChanging(false), 200);
  };

  const title = GridLogic.getTitle(mode);
  
  // Apply centralized styling with behavior logic preserved
  const buttonStyle = {
    ...styles.button,
    ...(filled ? styles.buttonActive : {}),
    ...style,
    color: styles.iconColor, // This sets the currentColor for the SVG
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
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, styles.buttonHover);
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, buttonStyle);
      }}
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
