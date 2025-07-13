// Light theme - Pure appearance definitions  
import React from 'react';

// UNIFIED LEGACY LIGHT THEME DESIGN SYSTEM
// All UI elements share the same clean matte plastic visual DNA
const LIGHT_UNIFIED = {
  // === LEGACY LIGHT FOUNDATION ===
  // Primary matte plastic surface - used by ALL interactive elements
  surface: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 95%)',
  surfaceSolid: '#f8f9fa',
  surfaceSecondary: '#e9ecef',
  
  // Original legacy app background
  appBg: 'linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%)',
  
  // === UNIFIED MATTE PLASTIC LIGHTING ===
  // Subtle rim light on all elements
  rimLight: 'rgba(255, 255, 255, 0.6)',
  // Edge definition shadow on all elements  
  edgeShadow: 'rgba(0, 0, 0, 0.15)',
  // Depth shadow for elevation
  depthShadow: 'rgba(0, 0, 0, 0.1)',
  
  // === UNIFIED MATERIAL SYSTEM ===
  // Standard matte plastic shadow applied to ALL elements
  standardShadow: `
    inset 0 2px 3px rgba(255, 255, 255, 0.6),
    inset 0 -1px 2px rgba(0, 0, 0, 0.15),
    0 6px 12px rgba(0, 0, 0, 0.1)
  `,
  // Elevated panels get the same treatment but bigger
  elevatedShadow: `
    inset 0 2px 4px rgba(255, 255, 255, 0.6),
    inset 0 -2px 3px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1)
  `,
  
  // === UNIFIED BORDER SYSTEM ===
  borderRadius: '12px',         // Standard radius for buttons
  borderRadiusLarge: '40px',    // Large radius for panels
  border: 'rgba(0, 0, 0, 0.1)',
  
  // === UNIFIED TYPOGRAPHY (CONSISTENT ACROSS ALL ELEMENTS) ===
  textPrimary: '#000000',       // Black text for light theme
  textSecondary: 'rgba(0, 0, 0, 0.7)',  // Dark gray for secondary text
  textDark: '#000000',          // Black text for light backgrounds
  
  // === UNIFIED INTERACTION STATES ===
  hover: 'rgba(255, 255, 255, 0.2)',
  active: 'rgba(0, 0, 0, 0.1)',
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
  
  // === UNIFIED SPACING SYSTEM ===
  spacingStandard: '16px',
  spacingSmall: '8px',
  spacingLarge: '24px',
};

export const lightStyles = {
  // === APP BACKGROUND & LAYOUT ===
  app: {
    container: {
      minHeight: '100vh',
      maxWidth: '100vw',
      margin: 0,
      padding: 0,
      overflowY: 'hidden' as const,
      overflowX: 'hidden' as const,
      background: LIGHT_UNIFIED.appBg,
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
      padding: `${LIGHT_UNIFIED.spacingLarge} 32px 32px 32px`,
      maxWidth: '800px',
      margin: '0 auto',
      background: LIGHT_UNIFIED.surface,
      backdropFilter: 'blur(10px)',
      borderRadius: `0 0 ${LIGHT_UNIFIED.spacingLarge} ${LIGHT_UNIFIED.spacingLarge}`,
      boxShadow: LIGHT_UNIFIED.standardShadow,  // Clean shadow - no double outline
      border: 'none',  // Remove border for clean look
    },
    titleWrap: {
      textAlign: 'center' as const,
      marginBottom: 12,
    },
    gameTitle: {
      fontSize: 44,
      fontWeight: 700,
      color: '#000000',  // Black text for light theme
      margin: 0,
      textShadow: 'none',  // Remove text shadow
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    hours: {
      fontSize: 16,
      color: 'rgba(0, 0, 0, 0.7)',  // Dark gray for light theme
      fontWeight: 500,
    },
    dateTime: {
      position: 'absolute' as const,
      top: 28,
      right: 28,
      fontSize: 28,
      fontWeight: 700,
      color: '#000000',  // Black text for light theme
      textShadow: 'none',  // Remove text shadow
    },
  },

  // === THEME TOGGLE APPEARANCE (CLEAN SQUARE) ===
  themeToggle: {
    container: {
      position: 'absolute' as const,
      top: 16,   // Consistent top position
      right: 82, // Aligned properly with volume button (48px + 6px gap + 28px from right = 82px)
      zIndex: 100,
    },
    button: {
      width: 48,  
      height: 48, 
      padding: 0,
      background: LIGHT_UNIFIED.surface,
      border: 'none',  
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',  // Square with rounded corners
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: LIGHT_UNIFIED.standardShadow,
    } as React.CSSProperties,
    buttonHover: {
      transform: 'scale(1.1)',
      boxShadow: LIGHT_UNIFIED.hoverShadow,
    },
    iconColor: '#FFD700', // Golden sun for light theme
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
      background: LIGHT_UNIFIED.surface,
      border: 'none',  
      borderRadius: '12px',  // Square with rounded corners to match theme toggle
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: LIGHT_UNIFIED.standardShadow,
    } as React.CSSProperties,
    buttonHover: {
      background: LIGHT_UNIFIED.hover,
      transform: 'scale(1.05)',
      boxShadow: LIGHT_UNIFIED.hoverShadow,
    },
    iconColor: LIGHT_UNIFIED.textDark,
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
      background: LIGHT_UNIFIED.surface,
      border: 'none',  // Clean like arrow buttons
      borderRadius: LIGHT_UNIFIED.borderRadius,  // Larger radius for bigger buttons
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: LIGHT_UNIFIED.standardShadow,
    } as React.CSSProperties,
    buttonActive: {
      boxShadow: LIGHT_UNIFIED.activeShadow,
    },
    buttonHover: {
      transform: 'scale(1.05)',
      boxShadow: LIGHT_UNIFIED.hoverShadow,
    },
    iconColor: LIGHT_UNIFIED.textDark,
  },

  // === COMMAND BAR APPEARANCE (CLEAN CAPSULE - SOLID BUTTONS) ===
  commandBar: {
    container: {
      background: 'transparent',  // Keep container transparent
      backdropFilter: 'none',     // No backdrop
      borderTop: 'none',          // No border
    },
    button: {
      background: LIGHT_UNIFIED.surface,  // Solid matte plastic background
      boxShadow: LIGHT_UNIFIED.standardShadow,
      border: 'none',
      // borderRadius handled by component for split styling
      color: '#000000',  // Black text for light theme
      fontSize: '36px',      // Large font like header
      fontWeight: 700,       // Bold like header
      transition: 'all 0.3s ease',
      padding: '12px 24px',  // Capsule padding
      opacity: 1,            // Ensure not grayed out
    } as React.CSSProperties,
    buttonHover: {
      background: LIGHT_UNIFIED.surface,  // Keep solid on hover
      transform: 'translateY(-2px)',
      boxShadow: LIGHT_UNIFIED.hoverShadow,
      opacity: 1,            // Ensure not grayed out
    },
    buttonActive: {
      background: LIGHT_UNIFIED.surface,  // Keep solid when active
      transform: 'translateY(1px)',
      boxShadow: LIGHT_UNIFIED.activeShadow,
      opacity: 1,            // Ensure not grayed out
    },
    buttonDisabled: {
      background: LIGHT_UNIFIED.surface,  // Keep same background even when disabled
      opacity: 0.6,          // Only slightly dimmed when disabled
      cursor: 'not-allowed',
    },
    text: '#000000',  // Black text for light theme
    iconColor: '#000000',  // Black icons for light theme
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
      background: LIGHT_UNIFIED.appBg,
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
      background: LIGHT_UNIFIED.surface,
      boxShadow: LIGHT_UNIFIED.standardShadow,
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
      boxShadow: LIGHT_UNIFIED.hoverShadow,
    },
    buttonActive: {
      transform: 'translateY(-50%) scale(0.95)',
      boxShadow: LIGHT_UNIFIED.activeShadow,
    },
    left: {
      left: 24,
    },
    right: {
      right: 24,
    },
    arrowColor: LIGHT_UNIFIED.textDark,
  },

  // === BACKGROUND CONTAINER (CLEAN - NO LIP) ===
  backgroundContainer: {
    container: {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      bottom: '32px',          // space for CommandBar
      borderRadius: LIGHT_UNIFIED.borderRadiusLarge,
      background: LIGHT_UNIFIED.surface,
      pointerEvents: 'none' as const,
      zIndex: -1,
      boxShadow: LIGHT_UNIFIED.standardShadow,  // Clean shadow like arrow buttons
      borderBottom: 'none',    // Remove the "lip" effect
      transition: 'transform 0.25s ease-out',
    },
  }
};
