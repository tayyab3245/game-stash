const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const configPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (!fs.existsSync(configPath)) {
      const defaultSettings = { emulators: {}, romDirs: {} };
      fs.writeFileSync(configPath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    return { emulators: {}, romDirs: {} };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
}

module.exports = { loadSettings, saveSettings, configPath };
