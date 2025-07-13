// Navigation button component types
export interface NavigationButtonProps {
  direction: 'left' | 'right';
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
  size?: number;
  className?: string;
}
