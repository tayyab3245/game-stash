// Cover Art Selector Component
import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import SoundManager from '../../core/audio/SoundManager';

interface CoverArtSelectorProps {
  coverFile: File | null;
  coverUrl?: string;
  onCoverChange: (file: File | null) => void;
  hideHeader?: boolean;  // New prop to hide header
  showPreviewFirst?: boolean;  // New prop to show preview above button
  showOnlyButton?: boolean;  // New prop to show only the button without preview
}

const CoverArtSelector: React.FC<CoverArtSelectorProps> = ({
  coverFile,
  coverUrl,
  onCoverChange,
  hideHeader = false,
  showPreviewFirst = false,
  showOnlyButton = false
}) => {
  const { theme, mode } = useTheme();
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
      imageBorder: 'rgba(0, 0, 0, 0.1)',
      imageBg: '#f8f9fa',
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
      imageBorder: 'rgba(255, 255, 255, 0.1)',
      imageBg: '#495057',
    }
  };

  const currentTheme = unifiedStyles[mode];

  const sectionHeader: React.CSSProperties = {
    fontSize: 18,  // Smaller for compact design
    fontWeight: 600,
    marginBottom: 8,
    color: currentTheme.textPrimary,
    letterSpacing: '0.3px',
    textAlign: 'center',  // Center for cover art
    fontFamily: '"Nunito", sans-serif',
  };

  const modalBtn: React.CSSProperties = {
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 600,
    fontSize: 24,  // Larger for 3x modal
    minWidth: 180,  // Larger for 3x modal
    padding: '20px 32px',  // Larger padding for 3x modal
    borderRadius: '24px',  // Larger radius
    background: currentTheme.surface,
    color: currentTheme.textPrimary,
    border: 'none',
    boxShadow: currentTheme.shadow,
    outline: 'none',
    cursor: 'pointer',
    margin: 0,
    transition: 'all 0.2s ease',
    position: 'relative',
    userSelect: 'none',
  };

  const coverPreview: React.CSSProperties = {
    marginBottom: showPreviewFirst ? 16 : 12,  // Different spacing based on position
    marginTop: showPreviewFirst ? 0 : 12,
    maxHeight: showPreviewFirst ? 240 : 120,  // Larger when shown first
    maxWidth: showPreviewFirst ? 200 : 100,   
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '16px',  // Larger radius for 3x modal
    border: 'none',
    boxShadow: currentTheme.shadow,
    background: currentTheme.imageBg,
    alignSelf: 'flex-start',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, width: '100%' }}>
      {!hideHeader && <div style={sectionHeader}>Cover Art</div>}
      
      {/* Show preview first if requested and not button-only mode */}
      {showPreviewFirst && !showOnlyButton && preview && (
        <img
          src={preview}
          alt="Cover preview"
          style={coverPreview}
        />
      )}
      
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
      
      {/* Show preview after button if not shown first and not button-only mode */}
      {!showPreviewFirst && !showOnlyButton && preview && (
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
