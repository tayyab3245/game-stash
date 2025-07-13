// ROM Path Selector Component
import React, { useRef, useState } from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import SoundManager from '../../core/audio/SoundManager';

interface RomPathSelectorProps {
  romPath: string;
  onRomPathChange: (path: string) => void;
}

const RomPathSelector: React.FC<RomPathSelectorProps> = ({ romPath, onRomPathChange }) => {
  const { theme } = useTheme();
  const romRef = useRef<HTMLInputElement>(null);
  const [romName, setRomName] = useState<string>(
    romPath ? romPath.split(/[/\\]/).pop()! : ""
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
      <div style={sectionHeader}>ROM Path</div>
      <button
        style={modalBtn}
        onClick={() => {
          SoundManager.playUISelect();
          romRef.current?.click();
        }}
      >
        {romName ? "Change ROM" : "Select ROM"}
      </button>
      <input
        type="file"
        ref={romRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const filePath = (file as any).path || "";
            onRomPathChange(filePath);
            setRomName(file.name);
          }
        }}
      />
      {romName && (
        <div style={fileNameDisplay}>{romName}</div>
      )}
      {romPath && (
        <div style={pathDisplay}>{romPath}</div>
      )}
    </div>
  );
};

export default RomPathSelector;
