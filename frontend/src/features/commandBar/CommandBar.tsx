// CommandBar - Main action buttons with centralized styling
import React, { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";
import SoundManager from "../../core/audio/SoundManager";

export interface CommandBarProps {
  onLaunch: () => void;
  onEdit: () => void;
  canLaunch?: boolean;
  editEnabled?: boolean;
}

const CommandBar: React.FC<CommandBarProps> = ({
  onLaunch,
  onEdit,
  canLaunch = false,
  editEnabled = false,
}) => {
  const { theme, mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.commandBar : darkStyles.commandBar;

  // Play click sound
  const blip = () => SoundManager.playPan();

  // Button press effect handlers
  const handleMouseDown = (buttonRef: HTMLButtonElement, isEnabled: boolean) => {
    if (!isEnabled) return;
    buttonRef.style.transform = 'translateY(2px)';
    buttonRef.style.boxShadow = styles.buttonActive?.boxShadow || '';
  };

  const handleMouseUp = (buttonRef: HTMLButtonElement, isEnabled: boolean) => {
    if (!isEnabled) return;
    buttonRef.style.transform = 'translateY(0px)';
    buttonRef.style.boxShadow = styles.button?.boxShadow || '';
  };

  const handleMouseLeave = (buttonRef: HTMLButtonElement, isEnabled: boolean) => {
    if (!isEnabled) return;
    buttonRef.style.transform = 'translateY(0px)';
    buttonRef.style.boxShadow = styles.button?.boxShadow || '';
  };

  // Edit button - left third
  const editButtonStyle = {
    ...styles.button,
    ...(editEnabled ? {} : styles.buttonDisabled),
    flex: 1,
    borderTopLeftRadius: '40px',
    borderBottomLeftRadius: '40px',
    borderRight: `1px solid rgba(0, 0, 0, 0.3)`,
    transition: 'all 0.15s ease',
    transform: 'translateY(0px)',
  };

  // Launch button - right two-thirds
  const launchButtonStyle = {
    ...styles.button,
    ...(canLaunch ? {} : styles.buttonDisabled),
    flex: 2,
    borderTopRightRadius: '60px',
    borderBottomRightRadius: '60px',
    borderLeft: `1px solid rgba(255, 255, 255, 0.2)`,
    transition: 'all 0.15s ease',
    transform: 'translateY(0px)',
  };

  // Container styling
  const containerStyle = {
    ...styles.container,
    position: 'fixed' as const,
    bottom: -15,
    left: 0,
    right: 0,
    height: '72px',
    display: 'flex',
    gap: '1px',
    padding: '0 20px 20px 20px',
    zIndex: 1000,
  };

  const handleEdit = () => {
    if (editEnabled) {
      blip();
      onEdit();
    }
  };

  const handleLaunch = () => {
    if (canLaunch) {
      blip();
      onLaunch();
    }
  };

  return (
    <div style={containerStyle}>
      {/* EDIT – left third */}
      <button
        style={editButtonStyle}
        disabled={!editEnabled}
        onClick={handleEdit}
        onMouseDown={(e) => handleMouseDown(e.currentTarget, editEnabled)}
        onMouseUp={(e) => handleMouseUp(e.currentTarget, editEnabled)}
        onMouseLeave={(e) => handleMouseLeave(e.currentTarget, editEnabled)}
      >
        EDIT
      </button>

      {/* LAUNCH – right two-thirds */}
      <button
        style={launchButtonStyle}
        disabled={!canLaunch}
        onClick={handleLaunch}
        onMouseDown={(e) => handleMouseDown(e.currentTarget, canLaunch)}
        onMouseUp={(e) => handleMouseUp(e.currentTarget, canLaunch)}
        onMouseLeave={(e) => handleMouseLeave(e.currentTarget, canLaunch)}
      >
        LAUNCH
      </button>
    </div>
  );
};

export default CommandBar;
