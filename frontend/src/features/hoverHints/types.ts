export interface HoverHintProps {
  /** Whether the hint is visible */
  visible: boolean;
  /** Position of the hint */
  position: { x: number; y: number };
  /** Type of hint to display */
  type: 'rotate' | 'navigate' | 'select' | 'custom';
  /** Custom message for custom type */
  message?: string;
  /** Animation delay in ms */
  delay?: number;
  /** Auto-hide after timeout in ms (0 = never) */
  autoHide?: number;
  /** Callback when hint is dismissed */
  onDismiss?: () => void;
}

export interface HoverHintManagerProps {
  /** Current grid mode */
  gridMode: 'single' | 'double';
  /** Whether a game is currently selected/centered */
  gameSelected: boolean;
  /** Position of the selected game on screen */
  gamePosition?: { x: number; y: number };
  /** Additional hints to show */
  additionalHints?: Omit<HoverHintProps, 'visible'>[];
  /** Callback when hint is dismissed */
  onDismiss?: () => void;
  /** Force immediate hint display (triggered by help button) */
  forceShow?: boolean;
}
