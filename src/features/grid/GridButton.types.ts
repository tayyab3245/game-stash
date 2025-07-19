// Grid button types
import { GridMode } from './GridButton.logic';

export interface GridButtonProps {
  mode: GridMode;
  onChange: (newMode: GridMode) => void;
  filled?: boolean;
  
  // Optional customization
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export { GridMode } from './GridButton.logic';
