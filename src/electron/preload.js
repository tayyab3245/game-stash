// C:\Dev\game-library\src\electron\preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcherAPI', {
  autoDetect: (title, platform) => ipcRenderer.invoke('launcher:autoDetect', title, platform),
  exists: absPath => ipcRenderer.invoke('fs:exists', absPath),
  play: (emuPath, romPath) => ipcRenderer.invoke('launcher:play', emuPath, romPath),
  getImageUrl: (imageUrl) => ipcRenderer.invoke('fs:getImageUrl', imageUrl),
});

contextBridge.exposeInMainWorld('gameAPI', {
  getAllGames: () => ipcRenderer.invoke('db:getAllGames'),
  addGame: (gameData, coverBuffer) => ipcRenderer.invoke('db:addGame', gameData, coverBuffer),
  updateGame: (id, gameData, coverBuffer) => ipcRenderer.invoke('db:updateGame', id, gameData, coverBuffer),
  deleteGame: (id) => ipcRenderer.invoke('db:deleteGame', id),
  replaceCollection: (newGames) => ipcRenderer.invoke('db:replaceCollection', newGames),
  deleteAllGames: () => ipcRenderer.invoke('db:deleteAllGames'),
});
