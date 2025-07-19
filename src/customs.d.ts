declare module '*.mp3';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

// Electron API types
interface LauncherAPI {
  autoDetect: (title: string, platform: string) => Promise<{ romPath: string | null; emuPath: string | null }>;
  exists: (absPath: string) => Promise<boolean>;
  play: (emuPath: string, romPath: string) => Promise<{ ok: boolean; error?: string }>;
  getImageUrl: (imageUrl: string) => Promise<string | null>;
}

interface GameData {
  id?: number;
  title: string;
  platform?: string;
  romPath?: string;
  emuPath?: string;
  region?: string;
  fileName?: string;
  fileSizeMB?: number;
  isPatched?: boolean;
  imageUrl?: string;
  hoursPlayed?: number;
}

interface GameAPI {
  getAllGames: () => Promise<{ success: boolean; data?: GameData[]; error?: string }>;
  addGame: (gameData: GameData, coverBuffer?: Buffer) => Promise<{ success: boolean; id?: number; error?: string }>;
  updateGame: (id: number, gameData: Partial<GameData>, coverBuffer?: Buffer) => Promise<{ success: boolean; error?: string }>;
  deleteGame: (id: number) => Promise<{ success: boolean; error?: string }>;
  replaceCollection: (newGames: GameData[]) => Promise<{ success: boolean; error?: string }>;
  deleteAllGames: () => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    launcherAPI: LauncherAPI;
    gameAPI: GameAPI;
  }
}
