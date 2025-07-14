// Game Title Input Component
import React from 'react';
import { useTheme } from '../../features/theme/ThemeContext';

interface GameTitleInputProps {
  value: string;
  onChange: (title: string) => void;
  hideHeader?: boolean;  // New prop to hide header
}

const GameTitleInput: React.FC<GameTitleInputProps> = ({ value, onChange, hideHeader = false }) => {
  const { theme, mode } = useTheme();

  // Unified styling constants
  const unifiedStyles = {
    light: {
      surface: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 95%)',
      inputBg: '#ffffff',
      border: 'rgba(0, 0, 0, 0.12)',
      focusBorder: 'rgba(0, 0, 0, 0.25)',
      textPrimary: '#000000',
      shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    dark: {
      surface: 'linear-gradient(180deg, #495057 0%, #343a40 95%)',
      inputBg: '#2a2d34',
      border: 'rgba(255, 255, 255, 0.12)',
      focusBorder: 'rgba(255, 255, 255, 0.25)',
      textPrimary: '#f8f9fa',
      shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
    }
  };

  const currentTheme = unifiedStyles[mode];

  const sectionHeader: React.CSSProperties = {
    fontSize: 20,  // Smaller for compact design
    fontWeight: 600,
    marginBottom: 8,
    color: currentTheme.textPrimary,
    letterSpacing: '0.3px',
    textAlign: 'left',
    fontFamily: '"Nunito", sans-serif',
  };

  const modernInput: React.CSSProperties = {
    fontSize: 22,  // Larger font to match scale
    fontWeight: 600,
    padding: '20px 24px',  // More padding
    borderRadius: '48px',  // Match modal radius
    border: 'none',  // Remove extra border - use theme shadow
    background: currentTheme.inputBg,
    color: currentTheme.textPrimary,
    transition: 'all 0.2s ease',
    width: '100%',
    maxWidth: '600px',  // Match other elements
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: '"Nunito", sans-serif',
    boxShadow: currentTheme.shadow,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: '100%' }}>
      {!hideHeader && <div style={sectionHeader}>Title</div>}
      <input
        style={modernInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter game title"
      />
    </div>
  );
};

export default GameTitleInput;
