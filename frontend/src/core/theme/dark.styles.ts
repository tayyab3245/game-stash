// Dark theme - Pure appearance definitions  
import React from 'react';

// UNIFIED LEGACY DARK THEME DESIGN SYSTEM
// All UI elements share the same clean matte plastic visual DNA
const DARK_UNIFIED = {
  // === LEGACY DARK FOUNDATION ===
  // Primary matte plastic surface - used by ALL interactive elements
  surface: 'linear-gradient(180deg, #495057 0%, #343a40 95%)',
  surfaceSolid: '#495057',
  surfaceSecondary: '#343a40',
  
  // Original legacy app background (darkened)
  appBg: 'linear-gradient(135deg, #050505 0%, #0f0f1a 50%, #0a0f1c 100%)',
  
  // === UNIFIED MATTE PLASTIC LIGHTING ===
  // Subtle rim light on all elements (not bright!)
  rimLight: 'rgba(255, 255, 255, 0.08)',
  // Edge definition shadow on all elements  
  edgeShadow: 'rgba(0, 0, 0, 0.40)',
  // Depth shadow for elevation
  depthShadow: 'rgba(0, 0, 0, 0.30)',
  
  // === UNIFIED MATERIAL SYSTEM ===
  // Standard matte plastic shadow applied to ALL elements
  standardShadow: `
    inset 0 2px 3px rgba(255, 255, 255, 0.08),
    inset 0 -1px 2px rgba(0, 0, 0, 0.40),
    0 6px 12px rgba(0, 0, 0, 0.30)
  `,
  // Elevated panels get the same treatment but bigger
  elevatedShadow: `
    inset 0 2px 4px rgba(255, 255, 255, 0.08),
    inset 0 -2px 3px rgba(0, 0, 0, 0.40),
    0 8px 16px rgba(0, 0, 0, 0.30)
  `,
  
  // === UNIFIED BORDER SYSTEM ===
  borderRadius: '12px',         // Standard radius for buttons
  borderRadiusLarge: '40px',    // Large radius for panels
  border: 'rgba(255, 255, 255, 0.05)',
  
  // === UNIFIED TYPOGRAPHY (CONSISTENT ACROSS ALL ELEMENTS) ===
  textPrimary: '#f8f9fa',       // Same bright text everywhere
  textSecondary: 'rgba(248, 249, 250, 0.8)',
  
  // === UNIFIED INTERACTION STATES ===
  hover: 'rgba(255, 255, 255, 0.06)',
  active: 'rgba(0, 0, 0, 0.2)',
  hoverShadow: `
    inset 0 2px 3px rgba(255, 255, 255, 0.12),
    inset 0 -1px 2px rgba(0, 0, 0, 0.40),
    0 8px 16px rgba(0, 0, 0, 0.40)
  `,
  activeShadow: `
    inset 0 1px 2px rgba(255, 255, 255, 0.15),
    inset 0 -1px 2px rgba(0, 0, 0, 0.45),
    0 2px 4px rgba(0, 0, 0, 0.25)
  `,
  
  // === UNIFIED SPACING SYSTEM ===
  spacingStandard: '16px',
  spacingSmall: '8px',
  spacingLarge: '24px',
};

export const darkStyles = {
  // === APP BACKGROUND & LAYOUT ===
  app: {
    container: {
      minHeight: '100vh',
      maxWidth: '100vw',
      margin: 0,
      padding: 0,
      overflowY: 'hidden' as const,
      overflowX: 'hidden' as const,
      background: DARK_UNIFIED.appBg,
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      fontFamily: '"Nunito", sans-serif',
    },
    middle: {
      height: '75vh',
    }
  },

  // === HEADER APPEARANCE (CLEAN - NO DOUBLE OUTLINE) ===
  header: {
    container: {
      position: 'relative' as const,
      minHeight: 120,
      padding: `${DARK_UNIFIED.spacingLarge} 32px 32px 32px`,
      maxWidth: '800px',
      margin: '0 auto',
      background: DARK_UNIFIED.surface,
      backdropFilter: 'blur(10px)',
      borderRadius: `0 0 ${DARK_UNIFIED.spacingLarge} ${DARK_UNIFIED.spacingLarge}`,
      boxShadow: DARK_UNIFIED.standardShadow,  // Clean shadow - no double outline
      border: 'none',  // Remove border for clean look
    },
    titleWrap: {
      textAlign: 'center' as const,
      marginBottom: 12,
    },
    gameTitle: {
      fontSize: 44,
      fontWeight: 700,
      color: DARK_UNIFIED.textPrimary,
      margin: 0,
      textShadow: 'none',  // Remove text shadow
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    hours: {
      fontSize: 16,
      color: DARK_UNIFIED.textSecondary,
      fontWeight: 500,
    },
    dateTime: {
      position: 'absolute' as const,
      top: 28,
      right: 28,
      fontSize: 28,
      fontWeight: 700,
      color: DARK_UNIFIED.textPrimary,
      textShadow: 'none',  // Remove text shadow
    },
  },

  // === THEME TOGGLE APPEARANCE (CLEAN SQUARE) ===
  themeToggle: {
    container: {
      position: 'absolute' as const,
      top: 16,   // Consistent top position
      right: 82, // Aligned properly with volume button
      zIndex: 100,
    },
    button: {
      width: 48,  
      height: 48, 
      padding: 0,
      background: DARK_UNIFIED.surface,
      border: 'none',  
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',  // Square with rounded corners
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: DARK_UNIFIED.standardShadow,
    } as React.CSSProperties,
    buttonHover: {
      transform: 'scale(1.1)',
      boxShadow: DARK_UNIFIED.hoverShadow,
    },
    iconColor: '#FFFFFF', // Clean white moon for dark theme
  },

  // === VOLUME BUTTON APPEARANCE (CLEAN SQUARE) ===
  volumeButton: {
    container: {
      position: 'absolute' as const,
      top: 16,    // Same top as theme toggle
      right: 16,  // Consistent right margin
      zIndex: 100,
    },
    button: {
      width: 48,  
      height: 48, 
      padding: 0,
      background: DARK_UNIFIED.surface,
      border: 'none',  
      borderRadius: '12px',  // Square with rounded corners to match theme toggle
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: DARK_UNIFIED.standardShadow,
    } as React.CSSProperties,
    buttonHover: {
      background: DARK_UNIFIED.hover,
      transform: 'scale(1.05)',
      boxShadow: DARK_UNIFIED.hoverShadow,
    },
    iconColor: DARK_UNIFIED.textPrimary,
  },

  // === GRID BUTTONS APPEARANCE (CLEAN - LARGER SIZE) ===
  gridButtons: {
    container: {
      position: 'absolute' as const,
      left: 16,   // Consistent left margin to match right buttons
      top: 16,    // Consistent top to match right buttons
      display: 'flex',
      gap: '6px',
      zIndex: 100,
    },
    button: {
      width: 48,  // Increased from 32
      height: 48, // Increased from 32
      background: DARK_UNIFIED.surface,
      border: 'none',  // Clean like arrow buttons
      borderRadius: DARK_UNIFIED.borderRadius,  // Larger radius for bigger buttons
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: DARK_UNIFIED.standardShadow,
    } as React.CSSProperties,
    buttonActive: {
      boxShadow: DARK_UNIFIED.activeShadow,
    },
    buttonHover: {
      transform: 'scale(1.05)',
      boxShadow: DARK_UNIFIED.hoverShadow,
    },
    iconColor: DARK_UNIFIED.textPrimary,
  },

  // === COMMAND BAR APPEARANCE (CLEAN CAPSULE - SOLID BUTTONS) ===
  commandBar: {
    container: {
      background: 'transparent',  // Keep container transparent
      backdropFilter: 'none',     // No backdrop
      borderTop: 'none',          // No border
    },
    button: {
      background: DARK_UNIFIED.surface,  // Solid matte plastic background
      boxShadow: DARK_UNIFIED.standardShadow,
      border: 'none',
      // borderRadius handled by component for split styling
      color: DARK_UNIFIED.textPrimary,  // Bright white text
      fontSize: '36px',      // Large font like header
      fontWeight: 700,       // Bold like header
      transition: 'all 0.3s ease',
      padding: '12px 24px',  // Capsule padding
      opacity: 1,            // Ensure not grayed out
    } as React.CSSProperties,
    buttonHover: {
      background: DARK_UNIFIED.surface,  // Keep solid on hover
      transform: 'translateY(-2px)',
      boxShadow: DARK_UNIFIED.hoverShadow,
      opacity: 1,            // Ensure not grayed out
    },
    buttonActive: {
      background: DARK_UNIFIED.surface,  // Keep solid when active
      transform: 'translateY(1px)',
      boxShadow: DARK_UNIFIED.activeShadow,
      opacity: 1,            // Ensure not grayed out
    },
    buttonDisabled: {
      background: DARK_UNIFIED.surface,  // Keep same background even when disabled
      opacity: 0.6,          // Only slightly dimmed when disabled
      cursor: 'not-allowed',
    },
    text: DARK_UNIFIED.textPrimary,
    iconColor: DARK_UNIFIED.textPrimary,
  },

  // === LEGACY COMPATIBILITY ===
  gameManager: {
    container: {
      minHeight: '100vh',
      maxWidth: '100vw',
      margin: 0,
      padding: 0,
      overflowY: 'hidden' as const,
      overflowX: 'hidden' as const,
      background: DARK_UNIFIED.appBg,
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      fontFamily: '"Nunito", sans-serif',
    },
    middle: {
      height: '75vh',
    }
  },

  // === NAVIGATION BUTTONS ===
  navigationButton: {
    button: {
      position: 'absolute' as const,
      top: '60%',
      transform: 'translateY(-50%)',
      width: 72,
      height: 72,
      borderRadius: '50%',
      cursor: 'pointer',
      overflow: 'hidden' as const,
      zIndex: 10,
      background: DARK_UNIFIED.surface,
      boxShadow: DARK_UNIFIED.standardShadow,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(1.5px)',
      transition: 'transform 0.1s ease, box-shadow 0.1s ease',
      outline: 'none' as const,
      border: 'none',
      padding: 0,
    },
    buttonHover: {
      transform: 'translateY(-50%) scale(1.05)',
      boxShadow: DARK_UNIFIED.hoverShadow,
    },
    buttonActive: {
      transform: 'translateY(-50%) scale(0.95)',
      boxShadow: DARK_UNIFIED.activeShadow,
    },
    left: {
      left: 24,
    },
    right: {
      right: 24,
    },
    arrowColor: DARK_UNIFIED.textPrimary,
  },

  // === BACKGROUND CONTAINER (CLEAN - NO LIP) ===
  backgroundContainer: {
    container: {
      position: 'absolute' as const,
      left: 0,
      top: '10px',
      bottom: '32px',          // space for CommandBar
      borderRadius: DARK_UNIFIED.borderRadiusLarge,
      background: DARK_UNIFIED.surface,
      pointerEvents: 'none' as const,
      zIndex: -1,
      boxShadow: DARK_UNIFIED.standardShadow,  // Clean shadow like arrow buttons
      borderBottom: 'none',    // Remove the "lip" effect
      transition: 'transform 0.25s ease-out',
    },
  }
};
