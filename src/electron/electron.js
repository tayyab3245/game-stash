// C:\Dev\game-library\src\electron\electron.js

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path  = require('path');
const fs    = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const url = require('url');
const GameDatabase = require('./database');
const SettingsManager = require('./settings');

// At runtime, __dirname === C:\Dev\game-library\src\electron
// So we need to go up two levels to get to the project root
const ROOT   = path.join(__dirname, '..', '..');
const EMUS   = path.join(ROOT, 'emulators');
const ROMS   = path.join(ROOT, 'roms');
const is3DS  = f => ['.3ds', '.cia'].some(ext => f.toLowerCase().endsWith(ext));

// Initialize database and settings - using user data directory
const gameDB = new GameDatabase();
const settingsManager = new SettingsManager();

// Create simple HTTP server for serving cover images
const COVERS_PORT = 3001;
const coversServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Only serve files from /covers path
  if (parsedUrl.pathname.startsWith('/covers/')) {
    const filename = path.basename(parsedUrl.pathname);
    const filePath = path.join(gameDB.coversDir, filename);
    
    // Check if file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      // Set appropriate content type
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === '.png') {
        contentType = 'image/png';
      }
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', // Allow CORS for dev
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      });
      
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Start covers server
coversServer.listen(COVERS_PORT, () => {
  console.log(`Cover images server running on http://localhost:${COVERS_PORT}`);
});

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
  
  // For packaged apps, use the correct path within the app bundle
  let prodURL;
  if (app.isPackaged) {
    // In packaged app, index.html is in the same directory as electron.js
    prodURL = `file://${path.join(__dirname, 'index.html')}`;
  } else {
    // In development, files are in the build directory
    prodURL = `file://${path.join(__dirname, '..', '..', 'build', 'index.html')}`;
  }

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

// Convert image URL to HTTP URL
ipcMain.handle('fs:getImageUrl', (event, imageUrl) => {
  if (!imageUrl) return null;
  // Convert "/covers/filename.jpg" to HTTP URL
  return `http://localhost:${COVERS_PORT}${imageUrl}`;
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

// Settings operations
ipcMain.handle('settings:getAll', () => {
  return settingsManager.getAllSettings();
});

ipcMain.handle('settings:setEmulatorPath', (event, path) => {
  return settingsManager.setEmulatorPath(path);
});

ipcMain.handle('settings:setRomsPath', (event, path) => {
  return settingsManager.setRomsPath(path);
});

ipcMain.handle('settings:setCoverArtPath', (event, path) => {
  return settingsManager.setCoverArtPath(path);
});

ipcMain.handle('settings:update', (event, newSettings) => {
  return settingsManager.updateSettings(newSettings);
});

ipcMain.handle('settings:reset', () => {
  return settingsManager.resetSettings();
});

// File/folder dialog operations
ipcMain.handle('dialog:selectFolder', async (event, options) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: options?.title || 'Select Folder',
    defaultPath: options?.defaultPath || undefined
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  
  return filePaths[0];
});

ipcMain.handle('dialog:selectFile', async (event, options) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    title: options?.title || 'Select File',
    defaultPath: options?.defaultPath || undefined,
    filters: options?.filters || []
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  
  return filePaths[0];
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
  coversServer.close(() => {
    console.log('Cover images server closed');
  });
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
