// src/hooks/useGames.ts

import { useState, useCallback } from 'react';

export type Platform =  '3DS';


export interface Game {
  id: number;
  title: string;
  platform: Platform;
  imageUrl: string;
  romPath: string;
  emuPath: string;
  hoursPlayed: number;
}

export default function useGames() {
  const [games, setGames] = useState<Game[]>([]);

  const loadGames = useCallback(async () => {
    try {
      // Use the new Electron gameAPI
      const result = await (window as any).gameAPI.getAllGames();
      
      if (result.success && result.data) {
        setGames(result.data);
      } else {
        throw new Error(result.error || 'Failed to load games');
      }
    } catch (err: any) {
      console.error('Error loading games:', err);
      window.alert(`Error loading games: ${err.message}`);
    }
  }, []);

  return { games, setGames, loadGames };
}
