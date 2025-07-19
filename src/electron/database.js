// C:\Dev\game-library\src\electron\database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class GameDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.coversDir = path.join(path.dirname(dbPath), 'covers');
    
    // Ensure covers directory exists
    if (!fs.existsSync(this.coversDir)) {
      fs.mkdirSync(this.coversDir, { recursive: true });
    }
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('SQLite connection error:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database.');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create games table with all required columns
        this.db.run(`
          CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            platform TEXT NOT NULL DEFAULT '3DS',
            romPath TEXT,
            emuPath TEXT,
            region TEXT,
            fileName TEXT,
            fileSizeMB INTEGER,
            isPatched INTEGER DEFAULT 0,
            imageUrl TEXT,
            hoursPlayed INTEGER DEFAULT 0
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Check if hoursPlayed column exists and add it if missing (migration)
          this.db.all(`PRAGMA table_info(games);`, (err, rows) => {
            if (err) {
              reject(err);
              return;
            }
            
            const hasColumn = rows.some(r => r.name === 'hoursPlayed');
            if (!hasColumn) {
              this.db.run(`ALTER TABLE games ADD COLUMN hoursPlayed INTEGER DEFAULT 0`, (err2) => {
                if (err2) {
                  console.error('Failed to add hoursPlayed column:', err2.message);
                  reject(err2);
                } else {
                  console.log('Migrated: added hoursPlayed column to games table.');
                  resolve();
                }
              });
            } else {
              resolve();
            }
          });
        });
      });
    });
  }

  // Helper method to run SQL queries that modify data
  runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this); // 'this' contains lastID, changes, etc.
        }
      });
    });
  }

  // Helper method to run SQL queries that return data
  queryAll(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get all games
  async getAllGames() {
    try {
      const rows = await this.queryAll('SELECT * FROM games');
      console.log(`[DB] getAllGames — ${rows.length} games`);
      return { success: true, data: rows };
    } catch (err) {
      console.error('[DB] getAllGames — Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Add a new game
  async addGame(gameData, coverBuffer = null) {
    const {
      title,
      platform = '3DS',
      romPath = '',
      emuPath = '',
      region = '',
      fileName = '',
      fileSizeMB = 0,
      isPatched = false,
      hoursPlayed = 0
    } = gameData;

    let imageUrl = null;

    // Handle cover image if provided
    if (coverBuffer) {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = uniqueSuffix + '.jpg';
        const filepath = path.join(this.coversDir, filename);
        
        fs.writeFileSync(filepath, coverBuffer);
        imageUrl = `/covers/${filename}`;
      } catch (err) {
        console.error('[DB] Error saving cover image:', err.message);
        // Continue without image rather than failing the entire operation
      }
    }

    try {
      const result = await this.runQuery(
        `INSERT INTO games
         (title, platform, romPath, emuPath, region, fileName, fileSizeMB, isPatched, imageUrl, hoursPlayed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, platform, romPath, emuPath, region, fileName, fileSizeMB, isPatched ? 1 : 0, imageUrl, hoursPlayed]
      );

      console.log(`[DB] addGame — Added "${title}" (ID: ${result.lastID})`);
      return { success: true, id: result.lastID };
    } catch (err) {
      console.error('[DB] addGame — Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Update an existing game
  async updateGame(id, gameData, coverBuffer = null) {
    const allowedFields = [
      'title', 'platform', 'romPath', 'emuPath', 'region',
      'fileName', 'fileSizeMB', 'isPatched', 'imageUrl', 'hoursPlayed'
    ];

    // Handle new cover image
    if (coverBuffer) {
      try {
        // Delete old cover if it exists
        const [game] = await this.queryAll('SELECT imageUrl FROM games WHERE id = ?', [id]);
        if (game && game.imageUrl) {
          const oldPath = path.join(path.dirname(this.dbPath), game.imageUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        // Save new cover
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = uniqueSuffix + '.jpg';
        const filepath = path.join(this.coversDir, filename);
        
        fs.writeFileSync(filepath, coverBuffer);
        gameData.imageUrl = `/covers/${filename}`;
      } catch (err) {
        console.error('[DB] Error handling cover image update:', err.message);
      }
    }

    const fieldsToUpdate = allowedFields.filter(key => key in gameData);
    if (fieldsToUpdate.length === 0) {
      return { success: false, error: 'No valid fields provided' };
    }

    const sql = `UPDATE games SET ${fieldsToUpdate.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    const params = [...fieldsToUpdate.map(f => gameData[f]), id];

    try {
      await this.runQuery(sql, params);
      console.log(`[DB] updateGame — Updated game ${id}, fields: ${fieldsToUpdate.join(', ')}`);
      return { success: true };
    } catch (err) {
      console.error(`[DB] updateGame — Error:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Delete a game
  async deleteGame(id) {
    try {
      // Get the game to find its cover image
      const [game] = await this.queryAll('SELECT imageUrl FROM games WHERE id = ?', [id]);
      
      // Delete the cover image file if it exists
      if (game && game.imageUrl) {
        const filePath = path.join(path.dirname(this.dbPath), game.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete the game record
      await this.runQuery('DELETE FROM games WHERE id = ?', [id]);
      console.log(`[DB] deleteGame — Deleted game ${id}`);
      return { success: true };
    } catch (err) {
      console.error(`[DB] deleteGame — Error:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Replace entire collection
  async replaceCollection(newGames) {
    if (!Array.isArray(newGames)) {
      return { success: false, error: 'Invalid collection format' };
    }

    try {
      // Delete all existing games and their covers
      const rows = await this.queryAll('SELECT imageUrl FROM games');
      rows.forEach(row => {
        if (row.imageUrl) {
          const filePath = path.join(path.dirname(this.dbPath), row.imageUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });

      await this.runQuery('DELETE FROM games');

      // Insert new games
      for (const game of newGames) {
        await this.runQuery(
          `INSERT INTO games
           (title, platform, romPath, emuPath, region, fileName, fileSizeMB, isPatched, imageUrl, hoursPlayed)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            game.title,
            game.platform || '3DS',
            game.romPath || '',
            game.emuPath || '',
            game.region || '',
            game.fileName || '',
            game.fileSizeMB || 0,
            game.isPatched || 0,
            game.imageUrl || null,
            game.hoursPlayed || 0
          ]
        );
      }

      console.log(`[DB] replaceCollection — Replaced with ${newGames.length} games`);
      return { success: true };
    } catch (err) {
      console.error('[DB] replaceCollection — Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Delete all games
  async deleteAllGames() {
    try {
      // Delete all cover images
      const rows = await this.queryAll('SELECT imageUrl FROM games');
      rows.forEach(row => {
        if (row.imageUrl) {
          const filePath = path.join(path.dirname(this.dbPath), row.imageUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });

      await this.runQuery('DELETE FROM games');
      console.log('[DB] deleteAllGames — Deleted all games and covers');
      return { success: true };
    } catch (err) {
      console.error('[DB] deleteAllGames — Error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = GameDatabase;
