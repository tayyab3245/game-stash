// C:\Dev\game-library\src\electron\settings.js

const fs = require('fs');
const path = require('path');

class SettingsManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.settingsPath = path.join(projectRoot, 'backend', 'settings.json');
    this.settings = this.loadSettings();
  }

  getDefaultSettings() {
    return {
      folderPaths: {
        emulator: '',
        roms: path.join(this.projectRoot, 'roms'),
        coverArt: ''
      },
      app: {
        lastEmulatorType: '3ds',
        autoDetectEmulator: true,
        rememberWindowSize: true
      }
    };
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf8');
        const loadedSettings = JSON.parse(data);
        
        // Merge with defaults to ensure all properties exist
        const defaults = this.getDefaultSettings();
        return this.mergeSettings(defaults, loadedSettings);
      }
    } catch (err) {
      console.warn('[Settings] Error loading settings:', err.message);
    }

    // Return defaults if loading fails
    return this.getDefaultSettings();
  }

  mergeSettings(defaults, loaded) {
    const merged = { ...defaults };
    
    if (loaded.folderPaths) {
      merged.folderPaths = { ...defaults.folderPaths, ...loaded.folderPaths };
    }
    
    if (loaded.app) {
      merged.app = { ...defaults.app, ...loaded.app };
    }
    
    return merged;
  }

  saveSettings() {
    try {
      // Ensure the backend directory exists
      const backendDir = path.dirname(this.settingsPath);
      if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
      }

      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
      console.log('[Settings] Settings saved successfully');
      return { success: true };
    } catch (err) {
      console.error('[Settings] Error saving settings:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Getter methods
  getEmulatorPath() {
    return this.settings.folderPaths.emulator;
  }

  getRomsPath() {
    return this.settings.folderPaths.roms;
  }

  getCoverArtPath() {
    return this.settings.folderPaths.coverArt;
  }

  getAllSettings() {
    return { ...this.settings };
  }

  // Setter methods
  setEmulatorPath(path) {
    this.settings.folderPaths.emulator = path;
    return this.saveSettings();
  }

  setRomsPath(path) {
    this.settings.folderPaths.roms = path;
    return this.saveSettings();
  }

  setCoverArtPath(path) {
    this.settings.folderPaths.coverArt = path;
    return this.saveSettings();
  }

  updateSettings(newSettings) {
    this.settings = this.mergeSettings(this.settings, newSettings);
    return this.saveSettings();
  }

  // Reset to defaults
  resetSettings() {
    this.settings = this.getDefaultSettings();
    return this.saveSettings();
  }
}

module.exports = SettingsManager;
