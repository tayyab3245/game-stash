/* global electron preload API */
export {};

declare global {
  interface Window {
    launcherAPI: {
      /* file exists check */
      exists: (absPath: string) => Promise<boolean>;
      /* smart guess paths */
      autoDetect: (title: string, platform: 'Switch' | '3DS') =>
        Promise<{ romPath: string | null; emuPath: string | null }>;
      /* launch – 0-arg (legacy) OR (emu,rom) */
      play: (() => Promise<{ ok: boolean; error?: string }>)
          & ((emu: string, rom: string) => Promise<{ ok: boolean; error?: string }>);
    };
  }
}
