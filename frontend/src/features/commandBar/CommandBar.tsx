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
  
  const [editHover, setEditHover] = useState(false);
  const [editActive, setEditActive] = useState(false);
  const [launchHover, setLaunchHover] = useState(false);
  const [launchActive, setLaunchActive] = useState(false);

  // Play click sound
  const blip = () => SoundManager.playPan();

  // Edit button - left third
  const editButtonStyle = {
    ...styles.button,
    ...(editEnabled ? {} : styles.buttonDisabled),
    ...(editHover && editEnabled ? styles.buttonHover : {}),
    ...(editActive && editEnabled ? styles.buttonActive : {}),
    flex: 1,
    borderTopLeftRadius: '40px',
    borderBottomLeftRadius: '40px',
    borderRight: `1px solid rgba(0, 0, 0, 0.3)`,
  };

  // Launch button - right two-thirds
  const launchButtonStyle = {
    ...styles.button,
    ...(canLaunch ? {} : styles.buttonDisabled),
    ...(launchHover && canLaunch ? styles.buttonHover : {}),
    ...(launchActive && canLaunch ? styles.buttonActive : {}),
    flex: 2,
    borderTopRightRadius: '40px',
    borderBottomRightRadius: '40px',
    borderLeft: `1px solid rgba(255, 255, 255, 0.2)`,
  };

  // Container styling
  const containerStyle = {
    ...styles.container,
    position: 'fixed' as const,
    bottom: 0,
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
        onMouseEnter={() => setEditHover(true)}
        onMouseLeave={() => setEditHover(false)}
        onMouseDown={() => setEditActive(true)}
        onMouseUp={() => setEditActive(false)}
      >
        EDIT
      </button>

      {/* LAUNCH – right two-thirds */}
      <button
        style={launchButtonStyle}
        disabled={!canLaunch}
        onClick={handleLaunch}
        onMouseEnter={() => setLaunchHover(true)}
        onMouseLeave={() => setLaunchHover(false)}
        onMouseDown={() => setLaunchActive(true)}
        onMouseUp={() => setLaunchActive(false)}
      >
        LAUNCH
      </button>
    </div>
  );
};

export default CommandBar;
