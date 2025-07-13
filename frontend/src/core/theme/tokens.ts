// Core design tokens shared across all themes
export const designTokens = {
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  
  // Border radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    round: '50%',
  },
  
  // Timing
  timing: {
    fast: '0.12s',
    normal: '0.18s',
    slow: '0.3s',
    slower: '0.5s',
    slowest: '0.8s',
  },
  
  // Easing
  easing: {
    ease: 'ease',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.4, 1.7, 0.6, 1)',
  },
  
  // Component sizes
  button: {
    sm: '32px',
    md: '48px',
    lg: '64px',
  },
  
  // Animation keyframes (shared)
  keyframes: {
    volumeWaves: {
      '0%': { opacity: 0.3, transform: 'scale(0.8)' },
      '25%': { opacity: 0.6, transform: 'scale(0.9)' },
      '50%': { opacity: 1, transform: 'scale(1)' },
      '75%': { opacity: 0.8, transform: 'scale(1.05)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
    slideIn: {
      '0%': { opacity: 0, transform: 'translateY(10px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
  },
};

// Type for consistent token access
export type DesignTokens = typeof designTokens;
