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

  // Modern unified modal styles
  const unifiedStyles = {
    // Light theme unified constants
    light: {
      surface: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 95%)',
      rimLight: 'rgba(255, 255, 255, 0.6)',
      edgeShadow: 'rgba(0, 0, 0, 0.15)',
      depthShadow: 'rgba(0, 0, 0, 0.1)',
      elevatedShadow: `
        inset 0 2px 4px rgba(255, 255, 255, 0.6),
        inset 0 -2px 3px rgba(0, 0, 0, 0.15),
        0 8px 16px rgba(0, 0, 0, 0.1)
      `,
      textPrimary: '#000000',
      border: 'rgba(0, 0, 0, 0.1)',
    },
    // Dark theme unified constants
    dark: {
      surface: 'linear-gradient(180deg, #495057 0%, #343a40 95%)',
      rimLight: 'rgba(255, 255, 255, 0.08)',
      edgeShadow: 'rgba(0, 0, 0, 0.40)',
      depthShadow: 'rgba(0, 0, 0, 0.30)',
      elevatedShadow: `
        inset 0 2px 4px rgba(255, 255, 255, 0.08),
        inset 0 -2px 3px rgba(0, 0, 0, 0.40),
        0 8px 16px rgba(0, 0, 0, 0.30)
      `,
      textPrimary: '#f8f9fa',
      border: 'rgba(255, 255, 255, 0.05)',
    }
  };

  const currentTheme = unifiedStyles[themeMode];

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
    backdropFilter: "blur(12px)",
    background: themeMode === 'light' 
      ? 'rgba(255,255,255,0.4)' 
      : 'rgba(0,0,0,0.6)',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
  };

  const modernPanel: React.CSSProperties = {
    animation: "modalIn .3s ease-out",
    display: "flex",
    flexDirection: "column",
    gap: 32,
    color: currentTheme.textPrimary,
    background: currentTheme.surface,
    boxShadow: currentTheme.elevatedShadow,
    border: `1px solid ${currentTheme.border}`,
    borderRadius: '48px',
    padding: '80px 96px 64px 96px',
    minWidth: 800,  // More reasonable size, not too wide
    maxWidth: 1000,
    width: 'auto',  // Don't force full width
    maxHeight: '90vh',
    overflow: 'hidden',
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    fontFamily: '"Nunito", sans-serif',
  };

  const closeBtn: React.CSSProperties = {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 60,  // Larger to match button scale
    height: 60,  // Larger to match button scale
    border: 'none',
    background: currentTheme.surface,  // Match other buttons
    color: currentTheme.textPrimary,
    fontSize: 28,  // Slightly larger
    fontWeight: 600,  // Match other buttons
    cursor: 'pointer',
    zIndex: 10,
    borderRadius: '48px',  // Match modal radius instead of circle
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: currentTheme.elevatedShadow,  // Match button shadows
    fontFamily: '"Nunito", sans-serif',  // Match other buttons
    userSelect: 'none',
  };

  const headerStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 28,  // Much smaller, more proportional
    fontWeight: 700,  // Bold like header titles
    textAlign: 'center',
    marginBottom: 16,
    color: currentTheme.textPrimary,
    fontFamily: '"Nunito", sans-serif',
  };

  // Glassmorphism container style like the X button
  const glassContainer: React.CSSProperties = {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '20px',
    padding: '20px',
    backdropFilter: 'blur(4px)',
    border: `1px solid rgba(255,255,255,0.1)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
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
        
        {/* ADD GAME Header */}
        <div style={{
          background: currentTheme.surface,  // Same as modal background
          padding: '24px',
          borderRadius: '48px',  // Match modal's larger radius
          boxShadow: 'none',  // Flat like modal, no elevation
          border: `1px solid ${currentTheme.border}`,  // Same subtle border as modal
          textAlign: 'center',
          marginBottom: '32px',
          width: '100%',
          maxWidth: '600px',  // Match other elements
          alignSelf: 'center',  // Center the header
        }}>
          <h2 style={headerStyle}>
            {mode === "add" ? "ADD GAME" : "EDIT GAME"}
          </h2>
        </div>

        {/* Streamlined vertical layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', width: '100%' }}>
          
          {/* Large Cover Upload Area */}
          <div 
            style={{
              width: '100%',
              maxWidth: '500px',  // Wider container
              height: '240px',  // Much shorter to mimic preview shape
              background: currentTheme.surface,
              borderRadius: '48px',  // Match modal radius
              boxShadow: 'none',  // Flat like modal
              border: `1px solid ${currentTheme.border}`,  // Same subtle border as modal
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              padding: '24px',  // Adjust padding for shorter container
              boxSizing: 'border-box',
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.style.display = 'none';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0] ?? null;
                setForm(prev => ({ ...prev, coverFile: file }));
              };
              document.body.appendChild(input);
              input.click();
              document.body.removeChild(input);
            }}
          >
            {(form.coverFile || initial.coverUrl) ? (
              <img
                src={form.coverFile ? URL.createObjectURL(form.coverFile) : initial.coverUrl}
                alt="Cover preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '24px',  // Rounded but less than container
                }}
              />
            ) : (
              <>
                <div style={{
                  fontSize: '48px',
                  color: currentTheme.textPrimary,
                  opacity: 0.6,
                  marginBottom: '12px',
                }}>
                  ↑
                </div>
                <div style={{
                  fontSize: '18px',
                  color: currentTheme.textPrimary,
                  opacity: 0.7,
                  fontWeight: 600,
                  fontFamily: '"Nunito", sans-serif',
                }}>
                  Click to upload cover
                </div>
              </>
            )}
          </div>
          
          {/* Title Input */}
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <GameTitleInput
              value={form.title}
              onChange={(title) => setForm(prev => ({ ...prev, title }))}
              hideHeader={true}
            />
          </div>

          {/* ROM/EMULATOR Segmented Buttons */}
          <div style={{
            display: 'flex',
            background: currentTheme.surface,
            borderRadius: '48px',  // Match modal roundness
            border: `1px solid ${currentTheme.border}`,
            overflow: 'hidden',
            boxShadow: currentTheme.elevatedShadow,
            gap: '1px',
            width: '100%',
            maxWidth: '600px',  // Match other elements
          }}>
            <RomPathSelector
              romPath={form.romPath}
              onRomPathChange={(romPath) => setForm(prev => ({ ...prev, romPath }))}
              isSegmented={true}
            />
            <EmulatorPathSelector
              emuPath={form.emuPath}
              onEmuPathChange={(emuPath) => setForm(prev => ({ ...prev, emuPath }))}
              isSegmented={true}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ width: '100%', maxWidth: '600px', marginTop: '16px' }}>
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
      </div>
    </div>
  );
};

export default GameFormModal;
