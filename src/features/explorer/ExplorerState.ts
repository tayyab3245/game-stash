// Global explorer/app state management
import { useState, useCallback } from 'react';

export type VolumeLevel = 0 | 1 | 2 | 3;
export type GridMode = 1 | 2;
export type ThemeMode = 'light' | 'dark';

export interface ExplorerState {
  // Theme
  themeMode: ThemeMode;
  
  // Audio
  volumeLevel: VolumeLevel;
  
  // View
  gridMode: GridMode;
  selectedGameIndex: number | null;
  
  // Modal states
  modalOpen: boolean;
  modalMode: 'add' | 'edit';
  
  // UI states
  updating: boolean;
  flashOk: boolean;
  editTitle: string;
}

export interface ExplorerActions {
  // Theme actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Audio actions
  setVolumeLevel: (level: VolumeLevel) => void;
  
  // View actions
  setGridMode: (mode: GridMode) => void;
  setSelectedGameIndex: (index: number | null) => void;
  
  // Modal actions
  openModal: (mode: 'add' | 'edit') => void;
  closeModal: () => void;
  
  // UI actions
  setUpdating: (updating: boolean) => void;
  setFlashOk: (flash: boolean) => void;
  setEditTitle: (title: string) => void;
}

export interface ExplorerContext extends ExplorerState, ExplorerActions {}

// Hook for managing explorer state
export const useExplorerState = (): ExplorerContext => {
  // Theme state
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem('themeMode');
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  // Audio state
  const [volumeLevel, setVolumeLevelState] = useState<VolumeLevel>(2);

  // View state
  const [gridMode, setGridModeState] = useState<GridMode>(1);
  const [selectedGameIndex, setSelectedGameIndexState] = useState<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpenState] = useState(false);
  const [modalMode, setModalModeState] = useState<'add' | 'edit'>('add');

  // UI state
  const [updating, setUpdatingState] = useState(false);
  const [flashOk, setFlashOkState] = useState(false);
  const [editTitle, setEditTitleState] = useState('');

  // Actions
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    window.localStorage.setItem('themeMode', mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  const setVolumeLevel = useCallback((level: VolumeLevel) => {
    setVolumeLevelState(level);
  }, []);

  const setGridMode = useCallback((mode: GridMode) => {
    setGridModeState(mode);
  }, []);

  const setSelectedGameIndex = useCallback((index: number | null) => {
    setSelectedGameIndexState(index);
  }, []);

  const openModal = useCallback((mode: 'add' | 'edit') => {
    setModalModeState(mode);
    setModalOpenState(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpenState(false);
  }, []);

  const setUpdating = useCallback((updating: boolean) => {
    setUpdatingState(updating);
  }, []);

  const setFlashOk = useCallback((flash: boolean) => {
    setFlashOkState(flash);
  }, []);

  const setEditTitle = useCallback((title: string) => {
    setEditTitleState(title);
  }, []);

  return {
    // State
    themeMode,
    volumeLevel,
    gridMode,
    selectedGameIndex,
    modalOpen,
    modalMode,
    updating,
    flashOk,
    editTitle,
    
    // Actions
    setThemeMode,
    toggleTheme,
    setVolumeLevel,
    setGridMode,
    setSelectedGameIndex,
    openModal,
    closeModal,
    setUpdating,
    setFlashOk,
    setEditTitle,
  };
};
