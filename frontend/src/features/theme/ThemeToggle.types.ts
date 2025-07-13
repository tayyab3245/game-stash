// Theme toggle types
export interface ThemeToggleProps {
  /** Called with the new mode after a click */
  onThemeChange?: (mode: "light" | "dark") => void;
  /** If true render only the SVG (no wrapper button, no click) */
  inline?: boolean;
  
  // Optional customization
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export type ThemeMode = "light" | "dark";
