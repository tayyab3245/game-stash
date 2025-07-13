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
  const { theme } = useTheme();

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

  const modalBtnDisabled: React.CSSProperties = {
    ...modalBtn,
    opacity: 0.5,
    cursor: 'not-allowed',
    boxShadow: 'none',
  };

  const actionRow: React.CSSProperties = {
    display: 'flex',
    gap: 18,
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
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
