// Theme Context for the new architecture
import React, { createContext, useContext, ReactNode } from 'react';

export interface Theme {
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
}

interface ThemeContextType {
  theme: Theme;
  mode: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

interface ThemeProviderProps {
  theme: Theme;
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  const contextValue = {
    theme,
    mode: theme.mode
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
