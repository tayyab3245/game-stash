// Emulator Path Selector Component
import React, { useRef, useState } from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import SoundManager from '../../core/audio/SoundManager';

interface EmulatorPathSelectorProps {
  emuPath: string;
  onEmuPathChange: (path: string) => void;
}

const EmulatorPathSelector: React.FC<EmulatorPathSelectorProps> = ({ emuPath, onEmuPathChange }) => {
  const { theme } = useTheme();
  const emuRef = useRef<HTMLInputElement>(null);
  const [emuName, setEmuName] = useState<string>(
    emuPath ? emuPath.split(/[/\\]/).pop()! : ""
  );

  const sectionHeader: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: theme.text,
    letterSpacing: 0.5,
    textAlign: 'left',
    alignSelf: 'flex-start',
  };

  const modalBtn: React.CSSProperties = {
    fontFamily: 'inherit',
    fontWeight: 700,
    fontSize: 16,
    minWidth: 110,
    padding: '12px 24px',
    borderRadius: 18,
    background: `linear-gradient(180deg, ${theme.panelTop} 0%, ${theme.panelBot} 100%)`,
    color: theme.text,
    border: `2.5px solid ${theme.panelEdge}`,
    boxShadow: '0 2px 0 0 #bdbdbd, 0 4px 12px 0 rgba(0,0,0,0.10)',
    outline: 'none',
    cursor: 'pointer',
    margin: 0,
    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
    position: 'relative',
    userSelect: 'none',
  };

  const pathDisplay: React.CSSProperties = {
    fontSize: 12,
    color: theme.text,
    opacity: 0.7,
    marginTop: 2,
    textAlign: "left",
    wordBreak: "break-all"
  };

  const fileNameDisplay: React.CSSProperties = {
    fontSize: 14,
    color: theme.text,
    textAlign: "left",
    marginTop: 2
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: '100%' }}>
      <div style={sectionHeader}>Emulator Path</div>
      <button
        style={modalBtn}
        onClick={() => {
          SoundManager.playUISelect();
          emuRef.current?.click();
        }}
      >
        {emuName ? "Change Emulator" : "Select Emulator"}
      </button>
      <input
        type="file"
        ref={emuRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const filePath = (file as any).path || "";
            onEmuPathChange(filePath);
            setEmuName(file.name);
          }
        }}
      />
      {emuName && (
        <div style={fileNameDisplay}>{emuName}</div>
      )}
      {emuPath && (
        <div style={pathDisplay}>{emuPath}</div>
      )}
    </div>
  );
};

export default EmulatorPathSelector;
