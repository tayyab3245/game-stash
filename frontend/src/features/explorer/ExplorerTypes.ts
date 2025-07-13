// Explorer state types
export { 
  VolumeLevel, 
  GridMode, 
  ThemeMode,
  ExplorerState,
  ExplorerActions,
  ExplorerContext 
} from './ExplorerState';

// Game related types (imported from existing hooks)
export interface Game {
  id: number;
  title: string;
  coverPath?: string;
  romPath?: string;
  emulatorPath?: string;
  // Add other game properties as needed
}

// UI Event types
export interface GameLaunchEvent {
  game: Game;
  timestamp: Date;
}

export interface GameEditEvent {
  game: Game;
  changes: Partial<Game>;
  timestamp: Date;
}

// Modal types
export interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  targetGame?: Game;
}
