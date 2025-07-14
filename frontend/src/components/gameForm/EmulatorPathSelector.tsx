// Emulator Path Selector Component
import React, { useRef, useState } from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import SoundManager from '../../core/audio/SoundManager';

interface EmulatorPathSelectorProps {
  emuPath: string;
  onEmuPathChange: (path: string) => void;
  isSegmented?: boolean;  // New prop for segmented design
}

const EmulatorPathSelector: React.FC<EmulatorPathSelectorProps> = ({ emuPath, onEmuPathChange, isSegmented = false }) => {
  const { theme, mode } = useTheme();
  const emuRef = useRef<HTMLInputElement>(null);
  const [emuName, setEmuName] = useState<string>(
    emuPath ? emuPath.split(/[/\\]/).pop()! : ""
  );

  // Unified styling constants
  const unifiedStyles = {
    light: {
      surface: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 95%)',
      textPrimary: '#000000',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      border: 'rgba(0, 0, 0, 0.12)',
      shadow: `
        inset 0 2px 3px rgba(255, 255, 255, 0.6),
        inset 0 -1px 2px rgba(0, 0, 0, 0.15),
        0 6px 12px rgba(0, 0, 0, 0.1)
      `,
    },
    dark: {
      surface: 'linear-gradient(180deg, #495057 0%, #343a40 95%)',
      textPrimary: '#f8f9fa',
      textSecondary: 'rgba(248, 249, 250, 0.6)',
      border: 'rgba(255, 255, 255, 0.12)',
      shadow: `
        inset 0 2px 3px rgba(255, 255, 255, 0.08),
        inset 0 -1px 2px rgba(0, 0, 0, 0.40),
        0 6px 12px rgba(0, 0, 0, 0.30)
      `,
    }
  };

  const currentTheme = unifiedStyles[mode];

  const sectionHeader: React.CSSProperties = {
    fontSize: 32,  // Larger to match command bar scale
    fontWeight: 700,  // Bolder to match command bar
    marginBottom: 16,
    color: currentTheme.textPrimary,
    letterSpacing: '0.4px',
    textAlign: 'left',
    fontFamily: '"Nunito", sans-serif',
  };

  // Segmented button styling
  const segmentedBtn: React.CSSProperties = {
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 600,
    fontSize: 32,  // Much larger font
    flex: 1,
    padding: '28px 32px',  // More padding
    background: 'transparent',
    color: currentTheme.textPrimary,
    border: 'none',
    borderTopRightRadius: '48px',  // Match modal roundness
    borderBottomRightRadius: '48px',  // Match modal roundness
    outline: 'none',
    cursor: 'pointer',
    margin: 0,
    transition: 'all 0.2s ease',
    position: 'relative',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '90px',  // Taller buttons
  };

  const modalBtn: React.CSSProperties = isSegmented ? segmentedBtn : {
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 700,  // Bolder to match command bar
    fontSize: 28,     // Larger to match command bar scale
    minWidth: 220,
    padding: '24px 48px',  // Larger padding
    borderRadius: '32px',   // Larger radius
    background: currentTheme.surface,
    color: currentTheme.textPrimary,
    border: `1px solid ${currentTheme.border}`,
    boxShadow: currentTheme.shadow,
    outline: 'none',
    cursor: 'pointer',
    margin: 0,
    transition: 'all 0.2s ease',
    position: 'relative',
    userSelect: 'none',
  };

  const pathDisplay: React.CSSProperties = {
    fontSize: 12,
    color: currentTheme.textSecondary,
    marginTop: 2,
    textAlign: "left",
    wordBreak: "break-all"
  };

  const fileNameDisplay: React.CSSProperties = {
    fontSize: 24,     // Larger font
    color: currentTheme.textPrimary,
    textAlign: "left",
    marginTop: 12,
    fontWeight: 600,  // Bolder
    fontFamily: '"Nunito", sans-serif',
  };

  if (isSegmented) {
    return (
      <>
        <button
          style={modalBtn}
          onClick={() => {
            SoundManager.playUISelect();
            emuRef.current?.click();
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>EMULATOR</div>
          <div style={{ fontSize: 20, opacity: 0.8 }}>
            {emuName ? emuName.substring(0, 15) + (emuName.length > 15 ? '...' : '') : "Select"}
          </div>
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
      </>
    );
  }

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
