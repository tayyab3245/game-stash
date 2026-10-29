// GridButton - a layout button; the one showing the current layout has a solid icon, the other is dimmed
import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";
import { GridButtonProps } from './GridButton.types';
import GridIcon from './GridIcon';

const GridButton: React.FC<GridButtonProps> = ({
  icon,
  active,
  onClick,
  title,
  className = '',
  style = {},
  disabled = false,
}) => {
  const { mode: themeMode } = useTheme();
  const styles = themeMode === 'light' ? lightStyles.gridButtons : darkStyles.gridButtons;
  const [isChanging, setIsChanging] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsChanging(true);
    onClick();
    setTimeout(() => setIsChanging(false), 400);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(2px) scale(0.96)';
    e.currentTarget.style.boxShadow = styles.buttonActive?.boxShadow || '';
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

  const cssClasses = [
    'grid-button',
    `grid-button--mode-${icon}`,
    active ? 'grid-button--active' : '',
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
      aria-label={title}
      aria-pressed={active}
      onMouseDown={handleMouseDown}
      onMouseUp={release}
      onMouseLeave={release}
    >
      <GridIcon mode={icon} size={48} />
    </button>
  );
};

export default GridButton;
