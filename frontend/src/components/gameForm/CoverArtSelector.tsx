// Cover Art Selector Component
import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import SoundManager from '../../core/audio/SoundManager';

interface CoverArtSelectorProps {
  coverFile: File | null;
  coverUrl?: string;
  onCoverChange: (file: File | null) => void;
}

const CoverArtSelector: React.FC<CoverArtSelectorProps> = ({
  coverFile,
  coverUrl,
  onCoverChange
}) => {
  const { theme } = useTheme();
  const coverRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (coverFile) {
      setPreview(URL.createObjectURL(coverFile));
    } else if (coverUrl) {
      setPreview(coverUrl);
    } else {
      setPreview(null);
    }
  }, [coverFile, coverUrl]);

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

  const coverPreview: React.CSSProperties = {
    marginTop: 12,
    height: 154,
    width: 110,
    objectFit: 'cover',
    aspectRatio: '110/154',
    borderRadius: 12,
    border: `2px solid ${theme.panelEdge}`,
    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
    background: theme.surface,
    alignSelf: 'center',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
      <div style={sectionHeader}>Cover Art</div>
      <button
        style={modalBtn}
        onClick={() => {
          SoundManager.playUISelect();
          coverRef.current?.click();
        }}
      >
        {coverFile ? "Change Cover" : "Select Cover"}
      </button>
      <input
        type="file"
        ref={coverRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onCoverChange(file);
        }}
      />
      {preview && (
        <img
          src={preview}
          alt="Cover preview"
          style={coverPreview}
        />
      )}
    </div>
  );
};

export default CoverArtSelector;
