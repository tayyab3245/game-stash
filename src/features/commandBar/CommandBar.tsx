// CommandBar - Main action buttons with centralized styling
import React from "react";
import { useTheme } from "../theme/ThemeContext";
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";

export interface CommandBarProps {
  onLaunch: () => void;
  onEdit: () => void;
  canLaunch?: boolean;
  editEnabled?: boolean;
  visible?: boolean; // New prop to control visibility
  launchLabel?: string; // e.g. "ADD GAME" when the + slot is selected
}

const CommandBar: React.FC<CommandBarProps> = ({
  onLaunch,
  onEdit,
  canLaunch = false,
  editEnabled = false,
  visible = true,
  launchLabel = 'LAUNCH',
}) => {
  const { mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.commandBar : darkStyles.commandBar;

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
  // Disabled halves stay solid (the animated backdrop must not show through); only the label dims
  const disabledStyle = { ...styles.buttonDisabled, opacity: 1, cursor: 'default' };

  const editButtonStyle = {
    ...styles.button,
    ...(editEnabled ? {} : disabledStyle),
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
    ...(canLaunch ? {} : disabledStyle),
    flex: 2,
    borderTopRightRadius: '60px',
    borderBottomRightRadius: '60px',
    borderLeft: `1px solid rgba(255, 255, 255, 0.2)`,
    transition: 'all 0.15s ease',
    transform: 'translateY(0px)',
  };

  // Container styling with slide animation
  const containerStyle = {
    ...styles.container,
    position: 'relative' as const,
    height: 'clamp(52px, 8vh, 68px)',
    display: 'flex',
    gap: '1px',
    padding: '0 var(--gs-edge, 16px) var(--gs-edge, 16px)',
    boxSizing: 'content-box' as const,
    zIndex: 1000,
    transform: visible ? 'translateY(0px)' : 'translateY(24px)',
    opacity: visible ? 1 : 0,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
    pointerEvents: (visible ? 'auto' : 'none') as 'auto' | 'none',
  };

  const handleEdit = () => {
    if (editEnabled) {
      onEdit();
    }
  };

  const handleLaunch = () => {
    if (canLaunch) {
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
        <span style={{ opacity: editEnabled ? 1 : 0.4 }}>EDIT</span>
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
        <span style={{ opacity: canLaunch ? 1 : 0.4 }}>{launchLabel}</span>
      </button>
    </div>
  );
};

export default CommandBar;
