// C:\Dev\game-library\src\electron\electron.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path  = require('path');
const fs    = require('fs');
const { spawn } = require('child_process');
const GameDatabase = require('./database');

// At runtime, __dirname === C:\Dev\game-library\src\electron
// So we need to go up two levels to get to the project root
const ROOT   = path.join(__dirname, '..', '..');
const EMUS   = path.join(ROOT, 'emulators');
const ROMS   = path.join(ROOT, 'roms');
const is3DS  = f => ['.3ds', '.cia'].some(ext => f.toLowerCase().endsWith(ext));

// Initialize database
const dbPath = path.join(ROOT, 'backend', 'games.db');
const gameDB = new GameDatabase(ROOT);

// Utility to check file existence
const fileExists = p => fs.existsSync(p) && fs.statSync(p).isFile();

const findEmu = platform => {
  if (platform === '3DS') {
    const candidate = path.join(EMUS, 'citra', 'citra-qt.exe');
    return fileExists(candidate) ? candidate : null;
  }
  if (platform === 'Switch') {
    const candidate = path.join(EMUS, 'ryujinx', 'Ryujinx.exe');
    return fileExists(candidate) ? candidate : null;
  }
  return null;
};

function createWindow () {
  const preloadPath = path.resolve(__dirname, 'preload.js');
  
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadPath
    },
  });

  // Development (localhost:3000) vs. production (load built index.html)
  const devURL  = 'http://localhost:3000';
  const prodURL = `file://${path.join(ROOT, 'build', 'index.html')}`;

  // If packaged, load the built React files; otherwise load create-react-app dev server
  const target = app.isPackaged ? prodURL : devURL;
  win.loadURL(target);

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

// IPC handlers

// Database operations
ipcMain.handle('db:getAllGames', async () => {
  return await gameDB.getAllGames();
});

ipcMain.handle('db:addGame', async (event, gameData, coverBuffer) => {
  return await gameDB.addGame(gameData, coverBuffer);
});

ipcMain.handle('db:updateGame', async (event, id, gameData, coverBuffer) => {
  return await gameDB.updateGame(id, gameData, coverBuffer);
});

ipcMain.handle('db:deleteGame', async (event, id) => {
  return await gameDB.deleteGame(id);
});

ipcMain.handle('db:replaceCollection', async (event, newGames) => {
  return await gameDB.replaceCollection(newGames);
});

ipcMain.handle('db:deleteAllGames', async () => {
  return await gameDB.deleteAllGames();
});

// Convert image URL to file path
ipcMain.handle('fs:getImageUrl', (event, imageUrl) => {
  if (!imageUrl) return null;
  // Convert "/covers/filename.jpg" to full file path
  const fullPath = path.join(ROOT, 'backend', imageUrl);
  return `file://${fullPath.replace(/\\/g, '/')}`;
});

// File system operations
ipcMain.handle('fs:exists', (_e, absPath) => {
  return fileExists(absPath);
});

// Launcher operations

ipcMain.handle('launcher:autoDetect', (_e, title, platform) => {
  const consoleDir = path.join(ROMS, platform.toLowerCase());
  let romPath = null;
  if (fs.existsSync(consoleDir)) {
    const allFiles = fs.readdirSync(consoleDir);
    const match = allFiles.find(f => f.toLowerCase().includes(title.toLowerCase()));
    if (match) {
      romPath = path.join(consoleDir, match);
    }
  }
  const emuPath = findEmu(platform) || null;
  return { romPath, emuPath };
});

ipcMain.handle('launcher:play', (_e, emuPath, romPath) => {
  console.log("📢 [main] got launcher:play →", { emuPath, romPath });
  if (!fileExists(emuPath) || !fileExists(romPath)) {
    return { ok: false, error: 'ROM or Emulator missing' };
  }
  try {
    spawn(emuPath, [romPath], { detached: true, stdio: 'ignore' }).unref();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Failed to spawn process' };
  }
});

// Bootstrapping

app.whenReady().then(async () => {
  try {
    await gameDB.initialize();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  gameDB.close(); // Clean up database connection
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
