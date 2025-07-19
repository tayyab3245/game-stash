import { useState, useEffect } from 'react';

interface Settings {
  emulatorPath?: string;
  romsPath?: string;
  coverArtPath?: string;
  [key: string]: any;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Check if settingsAPI is available (Electron context)
      if (!(window as any).settingsAPI) {
        console.warn('settingsAPI not available - running in browser mode');
        setLoading(false);
        return;
      }
      
      const settingsData = await (window as any).settingsAPI?.getAll();
      setSettings(settingsData || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!(window as any).settingsAPI) {
      console.warn('settingsAPI not available');
      return;
    }
    try {
      await (window as any).settingsAPI?.update({ [key]: value });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const setEmulatorPath = async (path: string) => {
    if (!(window as any).settingsAPI) {
      console.warn('settingsAPI not available');
      return;
    }
    try {
      await (window as any).settingsAPI?.setEmulatorPath(path);
      setSettings(prev => ({ ...prev, emulatorPath: path }));
    } catch (error) {
      console.error('Failed to set emulator path:', error);
    }
  };

  const setRomsPath = async (path: string) => {
    if (!(window as any).settingsAPI) {
      console.warn('settingsAPI not available');
      return;
    }
    try {
      await (window as any).settingsAPI?.setRomsPath(path);
      setSettings(prev => ({ ...prev, romsPath: path }));
    } catch (error) {
      console.error('Failed to set roms path:', error);
    }
  };

  const setCoverArtPath = async (path: string) => {
    if (!(window as any).settingsAPI) {
      console.warn('settingsAPI not available');
      return;
    }
    try {
      await (window as any).settingsAPI?.setCoverArtPath(path);
      setSettings(prev => ({ ...prev, coverArtPath: path }));
    } catch (error) {
      console.error('Failed to set cover art path:', error);
    }
  };

  const selectFolder = async (title: string = 'Select Folder', defaultPath?: string): Promise<string | null> => {
    if (!(window as any).dialogAPI) {
      console.warn('dialogAPI not available');
      return null;
    }
    try {
      return await (window as any).dialogAPI?.selectFolder({ 
        title, 
        defaultPath: defaultPath || undefined 
      });
    } catch (error) {
      console.error('Failed to select folder:', error);
      return null;
    }
  };

  const selectFile = async (title: string = 'Select File', filters?: any[], defaultPath?: string): Promise<string | null> => {
    if (!(window as any).dialogAPI) {
      console.warn('dialogAPI not available');
      return null;
    }
    try {
      return await (window as any).dialogAPI?.selectFile({ 
        title, 
        filters,
        defaultPath: defaultPath || undefined 
      });
    } catch (error) {
      console.error('Failed to select file:', error);
      return null;
    }
  };

  return {
    settings,
    loading,
    updateSetting,
    setEmulatorPath,
    setRomsPath,
    setCoverArtPath,
    selectFolder,
    selectFile,
    refresh: loadSettings
  };
};
