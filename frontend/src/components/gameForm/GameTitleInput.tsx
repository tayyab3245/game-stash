// Game Title Input Component
import React from 'react';
import { useTheme } from '../../features/theme/ThemeContext';

interface GameTitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

const GameTitleInput: React.FC<GameTitleInputProps> = ({ value, onChange }) => {
  const { theme, mode } = useTheme();

  const sectionHeader: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: theme.text,
    letterSpacing: 0.5,
    textAlign: 'left',
    alignSelf: 'flex-start',
  };

  const modernInput: React.CSSProperties = {
    fontSize: 17,
    padding: '14px 18px',
    borderRadius: 16,
    border: `1.5px solid ${theme.panelEdge}`,
    background: mode === 'light' ? '#f7f7fa' : '#23242a',
    color: theme.text,
    transition: 'border 0.2s',
    marginBottom: 2,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: '100%' }}>
      <div style={sectionHeader}>Title</div>
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
