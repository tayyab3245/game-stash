// Main Game Form Modal Component
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import SoundManager from '../../core/audio/SoundManager';
import { GameForm, GameFormModalProps } from './types';
import CoverArtSelector from './CoverArtSelector';
import GameTitleInput from './GameTitleInput';
import RomPathSelector from './RomPathSelector';
import EmulatorPathSelector from './EmulatorPathSelector';
import FormActions from './FormActions';

const GameFormModal: React.FC<GameFormModalProps> = ({
  mode,
  initial = {},
  onSubmit,
  onDismiss,
  onDelete,
}) => {
  const { theme, mode: themeMode } = useTheme();
  
  const [form, setForm] = useState<GameForm>({
    title: initial.title ?? "",
    coverFile: initial.coverFile ?? null,
    romPath: initial.romPath ?? "",
    emuPath: initial.emuPath ?? "",
  });

  // Add modal animation
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes modalIn {
        0% { 
          opacity: 0; 
          transform: translate(-50%, -60%); 
        }
        100% { 
          opacity: 1; 
          transform: translate(-50%, -50%); 
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Validation
  const isValid = 
    form.title.trim() !== "" &&
    (mode === "edit" || form.coverFile !== null) &&
    form.romPath !== "" &&
    form.emuPath !== "";

  const handleSubmit = () => {
    if (isValid) {
      onSubmit(form);
    }
  };

  const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backdropFilter: "blur(6px)",
    background: themeMode === 'light' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,.4)',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
  };

  const modernPanel: React.CSSProperties = {
    animation: "modalIn .25s ease",
    display: "flex",
    flexDirection: "column",
    gap: 28,
    color: theme.text,
    background: `linear-gradient(180deg, ${theme.panelTop} 0%, ${theme.panelBot} 100%)`,
    boxShadow: themeMode === 'light' 
      ? 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1), 0 8px 32px 0 rgba(0,0,0,0.18)'
      : 'inset 0 2px 3px rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.40), 0 6px 12px rgba(0,0,0,0.30), 0 8px 32px 0 rgba(0,0,0,0.18)',
    border: `1.5px solid ${theme.panelEdge}`,
    borderRadius: 48,
    padding: '40px 40px 32px 40px',
    minWidth: 340,
    maxWidth: 440,
    width: '100%',
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const closeBtn: React.CSSProperties = {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    border: 'none',
    background: 'transparent',
    color: theme.text,
    fontSize: 28,
    fontWeight: 900,
    cursor: 'pointer',
    zIndex: 10,
    borderRadius: 24,
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const headerStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 18,
    color: theme.text,
  };

  return (
    <div style={overlay}>
      <div style={modernPanel} onClick={e => e.stopPropagation()}>
        <button
          style={closeBtn}
          aria-label="Close"
          onClick={() => {
            SoundManager.playUIBack();
            onDismiss();
          }}
        >
          ×
        </button>
        
        <h2 style={headerStyle}>
          {mode === "add" ? "Add Game" : "Edit Game"}
        </h2>

        <CoverArtSelector
          coverFile={form.coverFile}
          coverUrl={initial.coverUrl}
          onCoverChange={(file) => setForm(prev => ({ ...prev, coverFile: file }))}
        />

        <GameTitleInput
          value={form.title}
          onChange={(title) => setForm(prev => ({ ...prev, title }))}
        />

        <RomPathSelector
          romPath={form.romPath}
          onRomPathChange={(romPath) => setForm(prev => ({ ...prev, romPath }))}
        />

        <EmulatorPathSelector
          emuPath={form.emuPath}
          onEmuPathChange={(emuPath) => setForm(prev => ({ ...prev, emuPath }))}
        />

        <FormActions
          mode={mode}
          form={form}
          isValid={isValid}
          onSubmit={handleSubmit}
          onDismiss={onDismiss}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default GameFormModal;
