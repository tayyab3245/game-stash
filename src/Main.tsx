// Main component using organized architecture
import React, { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { ThemeProvider, useTheme } from "./features/theme";
import GameShelf from "./core/gameShelf/GameShelf";
import ThemeToggle from "./features/theme/ThemeToggle";
import { ADD_MARKER, MAX_GAME_SLOTS } from "./core/gameShelf/constants";
import { GameFormModal, GameForm } from "./components/gameForm";
import useGames, { Game } from "./hooks/useGames";
// Import new architecture components
import CommandBar from "./features/commandBar/CommandBar";
import Header from "./features/header/Header";
import VolumeButton from "./features/volume/VolumeButton";
import { VolumeLevel } from "./features/volume/VolumeButton.logic";
import SettingsPanel, { AppSettings, DEFAULT_APP_SETTINGS, SettingsButton } from "./features/settings/SettingsPanel";
import GridButton from "./features/grid/GridButton";
import { GridLogic, GridMode, MultiGridMode } from "./features/grid/GridButton.logic";
import HelpTrigger from "./components/HelpTrigger";
// Import theme styles
import { lightStyles } from "./core/theme/light.styles";
import { darkStyles } from "./core/theme/dark.styles";
// Import custom cursor
import { CustomCursor } from "./features/cursor";
import SoundManager from "./core/audio/SoundManager";
import "./core/theme/tokens.css";
import "./Main.css";


// Main content component that uses theme context
function MainContent({ onThemeChange }: { onThemeChange: (mode: "light" | "dark") => void }) {
  const { games, loadGames } = useGames();
  const { theme } = useTheme();

  /* every button clicks on press and on release */
  useEffect(() => SoundManager.attachButtonClicks(), []);

  /* wipe default browser margin that caused a white border */
  useLayoutEffect(() => {
    document.body.style.margin = '0';
    return () => { document.body.style.margin = ''; };
  }, []);

  /* ── state ── */
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const [addFocused, setAddFocused] = useState(false); // the "+" slot is selected
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [updating, setUpdating] = useState(false);
  const [flashOk, setFlashOk] = useState(false);
  const [editMode, _setEditMode] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState<VolumeLevel>(3);
  const [rowMode, setRowMode] = useState<GridMode>(1);
  const [lastMultiMode, setLastMultiMode] = useState<MultiGridMode>(2); // what the grid button returns to
  const [editTitle, setEditTitle] = useState("");
  const [showHints, setShowHints] = useState(true);
  const [forceShowHints, setForceShowHints] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  /* ── app-wide settings live in the Electron settings file ── */
  useEffect(() => {
    (window as any).settingsAPI?.getAll().then((s: any) => setAppSettings({
      showClock: s?.app?.showClock ?? true,
      showHints: s?.app?.showHints ?? true,
      music: s?.app?.music ?? true,
      emulatorPath: s?.folderPaths?.emulator ?? '',
      romsPath: s?.folderPaths?.roms ?? '',
    }));
  }, []);

  const updateAppSettings = (patch: Partial<AppSettings>) => {
    const next = { ...appSettings, ...patch };
    setAppSettings(next);
    (window as any).settingsAPI?.update({
      app: { showClock: next.showClock, showHints: next.showHints, music: next.music },
      folderPaths: { emulator: next.emulatorPath, roms: next.romsPath },
    });
  };

  useEffect(() => SoundManager.setMusicEnabled(appSettings.music), [appSettings.music]);

  /* ── Environment detection ── */
  const isElectron = !!(window as any).gameAPI && !!(window as any).settingsAPI;

  /* ── Memoized textures array to ensure GameShelf re-renders ── */
  const [gameTextures, setGameTextures] = useState<string[]>([]);
  // Servable cover URL per game id (imageUrl is a path like /covers/x.jpg the page can't load directly)
  const [coverUrls, setCoverUrls] = useState<Record<number, string>>({});
  
  useEffect(() => {
    const updateTextures = async () => {
      
      if (isElectron) {
        // In Electron, convert imageUrl to file paths
        const texturePromises = games.map(async (g: Game) => {
          if (!g.imageUrl) {
            return null;
          }
          try {
            const fileUrl = await (window as any).launcherAPI.getImageUrl(g.imageUrl);
            return fileUrl;
          } catch (err) {
            console.warn('Failed to get image URL for game:', g.title, err);
            return null;
          }
        });
        
        const resolvedTextures = await Promise.all(texturePromises);
        setCoverUrls(Object.fromEntries(
          games.map((g: Game, i) => [g.id, resolvedTextures[i]]).filter(([, url]) => Boolean(url)),
        ));
        const validTextures = resolvedTextures.filter((url): url is string => Boolean(url));
        // The "+" slot only shows while there's room left on the shelf
        setGameTextures(validTextures.length < MAX_GAME_SLOTS ? [...validTextures, ADD_MARKER] : validTextures);
      } else {
        // In browser mode, use imageUrl directly (for legacy Express mode)
        const textures = games.map((g: Game) => g.imageUrl).filter((url): url is string => Boolean(url));
        setGameTextures(textures.length < MAX_GAME_SLOTS ? [...textures, ADD_MARKER] : textures);
      }
    };

    updateTextures();
  }, [games, isElectron]);

  /* ── load games on mount ── */
  useEffect(() => {
    loadGames();
  }, [loadGames, isElectron]);

  /* ── Automatically select the first game when games are loaded ── */
  useEffect(() => {
    if (games.length > 0 && selIdx === null && !addFocused) {
      setSelIdx(0);
    }
  }, [games.length, selIdx, addFocused]);

  /* ── Command bar stays put while browsing (no flicker on every move); hidden only behind the modal ── */
  const commandBarVisible = (selIdx !== null || addFocused) && !modalOpen;

  /* ── time display: tick on the minute boundary so the clock is never up to a minute behind ── */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    let timer: number;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = window.setTimeout(tick, 60000 - (current.getSeconds() * 1000 + current.getMilliseconds()) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  /* ── derived state ── */
  const selectedGame = selIdx !== null ? games[selIdx] : null;
  // On the "+" slot the big button adds a game instead of launching one
  const canLaunch = Boolean(selectedGame) || addFocused;
  const editEnabled = Boolean(selectedGame);

  /* ── event handlers ── */
  const createOrUpdateGame = async (formData: GameForm) => {
    try {
      setUpdating(true);
      
      // Convert file to buffer if provided
      let coverBuffer = undefined;
      if (formData.coverFile) {
        coverBuffer = await formData.coverFile.arrayBuffer();
      }

      const gameData = {
        platform: "3DS" as const,
        title: formData.title,
        romPath: formData.romPath,
        emuPath: formData.emuPath,
      };

      let result;
      if (modalMode === "add") {
        result = await (window as any).gameAPI.addGame(gameData, coverBuffer);
      } else {
        if (selIdx === null) throw new Error("No game selected to edit");
        const id = games[selIdx].id;
        result = await (window as any).gameAPI.updateGame(id, gameData, coverBuffer);
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to save");
      }
      
      setModalOpen(false);
      await loadGames();
      setFlashOk(true);
      setTimeout(() => setFlashOk(false), 800);
    } catch (e: any) {
      window.alert(`Error: ${e.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = () => {
    if (selIdx !== null) {
      const game = games[selIdx];
      setEditTitle(game.title);
      setModalMode("edit");
      setModalOpen(true);
    }
  };

  const handleLaunch = async () => {
    if (addFocused) {
      setModalMode("add");
      setModalOpen(true);
      return;
    }
    if (!canLaunch || !selectedGame) return;
    const api = (window as any).launcherAPI;
    if (!api) {
      console.warn("launcherAPI not available in this environment.");
      return;
    }

    try {
      // A game's own paths win; otherwise fall back to Settings (default emulator, ROM folder by title)
      const emuPath = selectedGame.emuPath || appSettings.emulatorPath;
      let romPath = selectedGame.romPath;
      if (!romPath && appSettings.romsPath) {
        romPath = (await api.autoDetect(selectedGame.title, '3DS', appSettings.romsPath))?.romPath || '';
      }
      if (!emuPath) {
        window.alert("No emulator set. Choose a default one in Settings, or set one for this game with Edit.");
        return;
      }
      if (!romPath) {
        window.alert("No ROM found for this game. Pick its ROM with Edit, or choose your ROM folder in Settings.");
        return;
      }
      const [romOk, emuOk] = await Promise.all([api.exists(romPath), api.exists(emuPath)]);
      if (!romOk || !emuOk) {
        window.alert(!emuOk ? "Emulator not found at its saved location." : "ROM not found at its saved location.");
        return;
      }
      const result = await api.play(emuPath, romPath);
      if (result && !result.ok) window.alert(`Couldn't launch: ${result.error}`);
    } catch (err: any) {
      console.error('Launch error:', err);
      window.alert(`Error launching game: ${err.message}`);
    }
  };

  const onCancel = () => {
    setModalOpen(false);
    setEditTitle("");
  };

  // Function to manually trigger/toggle hints
  const triggerHints = () => {
    if (selIdx !== null) { // Removed rowMode === 1 restriction to work in both grid modes
      if (showHints || forceShowHints) {
        // If hints are showing, turn them off
        setShowHints(false);
        setForceShowHints(false);
        setHintMessage("Hints disabled");
      } else {
        // If hints are not showing, turn them on
        setShowHints(true);
        setForceShowHints(true);
        setHintMessage("Hints enabled");
        // Reset force show after a delay to allow natural behavior to resume
        setTimeout(() => setForceShowHints(false), 5000);
      }
      
      // Clear message after 2 seconds
      setTimeout(() => setHintMessage(null), 2000);
    }
  };

  const initialData = modalMode === "edit" && selectedGame ? {
    title: selectedGame.title,
    romPath: selectedGame.romPath,
    emuPath: selectedGame.emuPath,
    coverUrl: coverUrls[selectedGame.id] || "",
  } : {};

  const styles = theme.mode === 'light' ? lightStyles : darkStyles;

  return (
    <div className="gs-app" data-theme={theme.mode} style={{
      background: theme.mode === 'light' ? 'linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%)' : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    }}>
      {/* Custom Ring Cursor */}
      <CustomCursor enabled={true} />

      {/* Top bar, 3DS-style: theme + layout buttons | title | time, volume, settings */}
      <div className="gs-topbar">
        <div style={styles.leftButtonBackground.container}>
          <ThemeToggle onThemeChange={onThemeChange} />
          <div style={styles.gridButtons.container}>
            <GridButton
              icon={1}
              active={rowMode === 1}
              title={GridLogic.getTitle(1)}
              onClick={() => setRowMode(1)}
            />
            <GridButton
              icon={rowMode === 1 ? lastMultiMode : rowMode}
              active={rowMode !== 1}
              title={rowMode === 1 ? GridLogic.getTitle(lastMultiMode) : 'Switch grid size'}
              onClick={() => {
                const next = GridLogic.nextMulti(rowMode, lastMultiMode);
                setLastMultiMode(next);
                setRowMode(next);
              }}
            />
          </div>
        </div>

        <Header selectedGame={selectedGame} hidden={addFocused} />

        <div style={styles.rightButtonBackground.container}>
          {appSettings.showClock && (
            <span style={styles.header.dateTime}>
              {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
          <VolumeButton
            level={volumeLevel}
            onChange={setVolumeLevel}
          />
          <SettingsButton open={settingsOpen} onClick={() => setSettingsOpen(open => !open)} />
        </div>
      </div>

      {/* Game shelf */}
      <div className="gs-shelf">
        <div className="gs-shelf-inner">
        <GameShelf
          textures={gameTextures}
          width="100%"
          height="100%"
          rows={rowMode}
          showHints={showHints && appSettings.showHints}
          forceShowHints={forceShowHints}
          onHintsChange={(show) => setShowHints(show)}
          onSelect={(idx) => {
            if (idx === -1) {
              // Add button clicked
              setModalMode("add");
              setModalOpen(true);
              setSelIdx(null);
            } else {
              // Game selected
              setAddFocused(false);
              setSelIdx(idx);
            }
          }}
          onAddSelected={() => {
            setAddFocused(true);
            setSelIdx(null);
          }}
          onLongPress={(idx) => {
            if (idx < games.length) {
              setSelIdx(idx);
              handleEdit();
            } else {
              setModalMode("add");
              setModalOpen(true);
            }
          }}
        />
        {/* Help Trigger Button - visible when a game is selected (unless hints are off in Settings) */}
        <div className="gs-help">
          <HelpTrigger
            visible={selIdx !== null && !modalOpen && appSettings.showHints}
            hintsActive={showHints || forceShowHints}
            message={hintMessage}
            theme={theme.mode}
            onClick={triggerHints}
          />
        </div>
        </div>
      </div>

      {/* Command bar */}
      <div className="gs-commandbar">
        <CommandBar
          onLaunch={handleLaunch}
          onEdit={handleEdit}
          canLaunch={canLaunch}
          editEnabled={editEnabled}
          launchLabel={addFocused ? 'ADD GAME' : 'LAUNCH'}
          visible={commandBarVisible}
        />
      </div>

      {/* Add/Edit modal */}
      {/* GameFormModal brings its own overlay; a second blurred layer here doubled the GPU cost */}
      {modalOpen && (
          <GameFormModal
            key={modalMode + (editTitle || '')}
            mode={modalMode}
            initial={initialData}
            onSubmit={(data: GameForm) => {
              createOrUpdateGame(data);
            }}
            onDismiss={() => {
              onCancel();
            }}
            onDelete={
              modalMode === "edit" && selectedGame
                ? async () => {
                    if (selIdx !== null) {
                      try {
                        const result = await (window as any).gameAPI.deleteGame(selectedGame.id);
                        if (result.success) {
                          loadGames();
                          setModalOpen(false);
                          setSelIdx(null);
                        } else {
                          throw new Error(result.error || "Failed to delete game");
                        }
                      } catch (e: any) {
                        window.alert(`Error: ${e.message}`);
                      }
                    }
                  }
                : undefined
            }
          />
      )}
      {settingsOpen && (
        <SettingsPanel
          settings={appSettings}
          onChange={updateAppSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

// Main wrapper component with theme provider
export default function Main() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    const stored = window.localStorage.getItem('themeMode');
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  // Persist theme changes
  const handleThemeChange = (newMode: "light" | "dark") => {
    setThemeMode(newMode);
    window.localStorage.setItem('themeMode', newMode);
  };

  // Create theme object compatible with ThemeProvider
  const theme = {
    mode: themeMode,
    background: themeMode === 'light' ? '#fafafa' : '#0f0f0f',
    primary: '#e60012',
    surface: themeMode === 'light' ? '#ffffff' : '#1a1a1a',
    text: themeMode === 'light' ? '#141414' : '#f4f4f4',
    shadow: themeMode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.7)',
    glow: themeMode === 'light' ? '0 0 8px rgba(255,255,255,0.6)' : '0 0 8px rgba(255,255,255,0.4)',
    embossed: themeMode === 'light' 
      ? 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.25)'
      : 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.6)',
    panelTop: themeMode === 'light' ? '#ffffff' : '#2e2e2e',
    panelBot: themeMode === 'light' ? '#d9d9d9' : '#202020',
    panelEdge: themeMode === 'light' ? '#c3c3c3' : '#141414',
  };

  return (
    <ThemeProvider theme={theme}>
      <MainContent onThemeChange={handleThemeChange} />
    </ThemeProvider>
  );
}
