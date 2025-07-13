// CommandBar types
export interface CommandBarProps {
  onLaunch: () => void;
  onEdit: () => void;
  canLaunch?: boolean;
  editEnabled?: boolean;
  
  // Optional customization
  className?: string;
  style?: React.CSSProperties;
}
