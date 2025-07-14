// Form Actions Component - Submit, Cancel, Delete buttons
import React from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import SoundManager from '../../core/audio/SoundManager';
import { GameForm } from './types';

interface FormActionsProps {
  mode: "add" | "edit";
  form: GameForm;
  isValid: boolean;
  onSubmit: () => void;
  onDismiss: () => void;
  onDelete?: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  mode,
  form,
  isValid,
  onSubmit,
  onDismiss,
  onDelete
}) => {
  const { theme, mode: themeMode } = useTheme();

  // Unified styling constants
  const unifiedStyles = {
    light: {
      surface: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 95%)',
      textPrimary: '#000000',
      border: 'rgba(0, 0, 0, 0.12)',
      shadow: `
        inset 0 2px 3px rgba(255, 255, 255, 0.6),
        inset 0 -1px 2px rgba(0, 0, 0, 0.15),
        0 6px 12px rgba(0, 0, 0, 0.1)
      `,
      hoverShadow: `
        inset 0 2px 3px rgba(255, 255, 255, 0.8),
        inset 0 -1px 2px rgba(0, 0, 0, 0.15),
        0 8px 16px rgba(0, 0, 0, 0.15)
      `,
      activeShadow: `
        inset 0 1px 2px rgba(0, 0, 0, 0.2),
        inset 0 -1px 2px rgba(255, 255, 255, 0.6),
        0 2px 4px rgba(0, 0, 0, 0.15)
      `,
    },
    dark: {
      surface: 'linear-gradient(180deg, #495057 0%, #343a40 95%)',
      textPrimary: '#f8f9fa',
      border: 'rgba(255, 255, 255, 0.12)',
      shadow: `
        inset 0 2px 3px rgba(255, 255, 255, 0.08),
        inset 0 -1px 2px rgba(0, 0, 0, 0.40),
        0 6px 12px rgba(0, 0, 0, 0.30)
      `,
      hoverShadow: `
        inset 0 2px 3px rgba(255, 255, 255, 0.12),
        inset 0 -1px 2px rgba(0, 0, 0, 0.40),
        0 8px 16px rgba(0, 0, 0, 0.40)
      `,
      activeShadow: `
        inset 0 1px 2px rgba(0, 0, 0, 0.5),
        inset 0 -1px 2px rgba(255, 255, 255, 0.08),
        0 2px 4px rgba(0, 0, 0, 0.30)
      `,
    }
  };

  const currentTheme = unifiedStyles[themeMode];

  const modalBtn: React.CSSProperties = {
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 600,
    fontSize: 24,  // Larger font to match scale
    minWidth: 160,  // Wider buttons
    padding: '20px 40px',  // More padding
    borderRadius: '48px',  // Match modal radius
    background: currentTheme.surface,
    color: currentTheme.textPrimary,
    border: 'none',  // Remove extra border - use theme shadow
    boxShadow: currentTheme.shadow,
    outline: 'none',
    cursor: 'pointer',
    margin: 0,
    transition: 'all 0.2s ease',
    position: 'relative',
    userSelect: 'none',
  };

  const modalBtnDisabled: React.CSSProperties = {
    ...modalBtn,
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: currentTheme.activeShadow,
  };

  const actionRow: React.CSSProperties = {
    display: 'flex',
    gap: 24,  // More spacing between buttons to match scale
    justifyContent: 'center',  // Center the buttons
    marginTop: 20,
    width: '100%',
    flexWrap: 'wrap',
  };

  return (
    <div style={actionRow}>
      {mode === "edit" && onDelete && (
        <button
          style={modalBtn}
          onClick={() => {
            SoundManager.playUIBack();
            onDelete();
          }}
        >
          Delete
        </button>
      )}
      <button
        style={modalBtn}
        onClick={() => {
          SoundManager.playUIBack();
          onDismiss();
        }}
      >
        Cancel
      </button>
      <button
        style={isValid ? modalBtn : modalBtnDisabled}
        disabled={!isValid}
        onClick={() => {
          if (isValid) {
            SoundManager.playUISelect();
            onSubmit();
          }
        }}
      >
        {mode === "add" ? "Add" : "Save"}
      </button>
    </div>
  );
};

export default FormActions;
