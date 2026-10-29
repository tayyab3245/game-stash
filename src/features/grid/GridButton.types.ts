// GridButton component types
import { GridMode } from './GridButton.logic';

export interface GridButtonProps {
  icon: GridMode;          // which layout the icon shows
  active: boolean;         // this button's layout is the one on screen
  onClick: () => void;
  title: string;

  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export { GridMode } from './GridButton.logic';
