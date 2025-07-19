// Volume button types
import { VolumeLevel } from './VolumeButton.logic';

export interface VolumeButtonProps {
  level: VolumeLevel;
  onChange: (next: VolumeLevel) => void;
  
  // Optional customization
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export { VolumeLevel } from './VolumeButton.logic';
