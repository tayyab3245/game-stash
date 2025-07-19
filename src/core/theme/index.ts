// Theme system index - unified access to all theme data
import { lightStyles } from './light.styles';
import { darkStyles } from './dark.styles';
import { designTokens } from './tokens';

export { designTokens } from './tokens';
export { lightStyles } from './light.styles';
export { darkStyles } from './dark.styles';

// Enhanced theme interface that includes styling methods
export interface ThemeWithStyles {
  mode: 'light' | 'dark';
  background: string;
  primary: string;
  surface: string;
  text: string;
  shadow: string;
  glow: string;
  embossed: string;
  panelTop: string;
  panelBot: string;
  panelEdge: string;
  
  // Enhanced styling access
  styles: typeof lightStyles | typeof darkStyles;
  tokens: typeof designTokens;
}

// Base theme creation
const createTheme = (mode: 'light' | 'dark'): ThemeWithStyles => {
  const embossed = (highlight: string, shadow: string) => 
    `inset 0 1px 0 ${highlight}, inset 0 -1px 0 ${shadow}`;

  const baseTheme = mode === 'light' ? {
    mode: 'light' as const,
    background: '#fafafa',
    primary: '#e60012',
    surface: '#ffffff',
    text: '#141414',
    shadow: 'rgba(0,0,0,0.5)',
    glow: '0 0 8px rgba(255,255,255,0.6)',
    embossed: embossed('rgba(255,255,255,0.6)', 'rgba(0,0,0,0.25)'),
    panelTop: '#ffffff',
    panelBot: '#d9d9d9',
    panelEdge: '#c3c3c3',
  } : {
    mode: 'dark' as const,
    background: '#0f0f0f',
    primary: '#e60012',
    surface: '#1a1a1a',
    text: '#f4f4f4',
    shadow: 'rgba(0,0,0,0.7)',
    glow: '0 0 8px rgba(255,255,255,0.4)',
    embossed: embossed('rgba(255,255,255,0.2)', 'rgba(0,0,0,0.6)'),
    panelTop: '#2e2e2e',
    panelBot: '#202020',
    panelEdge: '#141414',
  };

  return {
    ...baseTheme,
    styles: baseTheme.mode === 'light' ? lightStyles : darkStyles,
    tokens: designTokens,
  };
};

// Get theme with enhanced styling capabilities
export const getEnhancedTheme = ({ mode }: { mode: 'light' | 'dark' }): ThemeWithStyles => 
  createTheme(mode);

// Style utilities
export const getComponentStyles = (theme: ThemeWithStyles, component: string, variant = 'base') => {
  const componentStyles = theme.styles[component as keyof typeof theme.styles];
  if (componentStyles && typeof componentStyles === 'object') {
    return componentStyles[variant as keyof typeof componentStyles] || {};
  }
  return {};
};
