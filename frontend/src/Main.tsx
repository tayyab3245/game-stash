// Main component using organized architecture
import React, { useState, useEffect, useLayoutEffect } from "react";
import { ThemeProvider, useTheme } from "./features/theme";
import GameShelf from "./core/gameShelf/GameShelf";
import ThemeToggle from "./features/theme/ThemeToggle";
import { ADD_MARKER } from "./core/gameShelf/constants";
import { GameFormModal, GameForm } from "./components/gameForm";
import useGames, { Game } from "./hooks/useGames";
import SoundManager from "./core/audio/SoundManager";
// Import new architecture components
import CommandBar from "./features/commandBar/CommandBar";
import Header from "./features/header/Header";
import VolumeButton from "./features/volume/VolumeButton";
import GridButton from "./features/grid/GridButton";

type VolumeLevel = 0 | 1 | 2 | 3;

// Main content component that uses theme context
function MainContent({ onThemeChange }: { onThemeChange: (mode: "light" | "dark") => void }) {
  const { games, loadGames, API } = useGames();
  const { theme } = useTheme();

  /* wipe default browser margin that caused a white border */
  useLayoutEffect(() => {
    document.body.style.margin = '0';
    return () => { document.body.style.margin = ''; };
  }, []);

  /* ── state ── */
  const [selIdx, setSelIdx] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [updating, setUpdating] = useState(false);
  const [flashOk, setFlashOk] = useState(false);
  const [editMode, _setEditMode] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState<VolumeLevel>(2);
  const [rowMode, setRowMode] = useState<1 | 2>(1);
  const [editTitle, setEditTitle] = useState("");

  /* ── load games on mount ── */
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  /* ── Automatically select the first game when games are loaded ── */
  useEffect(() => {
    if (games.length > 0 && selIdx === null) {
      setSelIdx(0);
    }
  }, [games.length, selIdx]);

  /* ── time display ── */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  /* ── derived state ── */
  const selectedGame = selIdx !== null ? games[selIdx] : null;
  const canLaunch = Boolean(selectedGame);
  const editEnabled = Boolean(selectedGame);
  const SHELF_H = "75vh";

  /* ── event handlers ── */
  const createOrUpdateGame = async (formData: GameForm) => {
    try {
      setUpdating(true);
      
      const payload = new FormData();
      payload.append("platform", "3DS");
      payload.append("title", formData.title);
      payload.append("romPath", formData.romPath);
      payload.append("emuPath", formData.emuPath);
      if (formData.coverFile) {
        payload.append("cover", formData.coverFile);
      }

      let res: Response;
      if (modalMode === "add") {
        res = await fetch(`${API}/api`, { method: "POST", body: payload });
      } else {
        if (selIdx === null) throw new Error("No game selected to edit");
        const id = games[selIdx].id;
        res = await fetch(`${API}/api/${id}`, {
          method: "PUT",
          body: payload,
        });
      }

      if (!res.ok) {
        const errInfo = await res.json();
        throw new Error(errInfo.error || "Failed to save");
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

  const handleLaunch = () => {
    if (!canLaunch || !selectedGame) return;
    const api = (window as any).launcherAPI;
    if (!api) {
      console.warn("launcherAPI not available in this environment.");
      return;
    }
    
    Promise.all([api.exists(selectedGame.romPath), api.exists(selectedGame.emuPath)]).then(
      ([romOk, emuOk]) => {
        if (!romOk || !emuOk) {
          window.alert("ROM or Emulator missing");
          return null;
        }
        return api.play(selectedGame.emuPath, selectedGame.romPath);
      },
    ).catch((err: any) => {
      console.error('Launch error:', err);
      window.alert(`Error launching game: ${err.message}`);
    });
  };

  const onCancel = () => {
    setModalOpen(false);
    setEditTitle("");
  };

  const initialData = modalMode === "edit" && selectedGame ? {
    title: selectedGame.title,
    romPath: selectedGame.romPath,
    emuPath: selectedGame.emuPath,
    coverUrl: `${API}${selectedGame.imageUrl}`,
  } : {};

  return (
    <div style={{ 
      background: theme.mode === 'light' ? 'linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%)' : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      position: 'relative'
    }}>
      {/* Upper left: view-toggle buttons */}
      <div style={{ 
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'flex',
        gap: '8px',
        padding: '16px',
        zIndex: 100
      }}>
        {[1, 2].map((r) => (
          <GridButton
            key={r}
            mode={r as 1 | 2}
            filled={rowMode === r}
            onChange={() => setRowMode(r as 1 | 2)}
          />
        ))}
      </div>

      {/* Header */}
      <Header selectedGame={selectedGame} currentTime={now} />
      
      {/* Theme Toggle - aligned side by side with volume */}
      <div style={{
        position: 'absolute',
        top: 14,
        right: 90,  // Moved left to align with volume button
        zIndex: 100
      }}>
        <ThemeToggle onThemeChange={onThemeChange} />
      </div>

      {/* Volume control - aligned side by side with theme toggle */}
      <div style={{
        position: 'absolute',
        top: 14,    // Same top as theme toggle for proper alignment
        right: 28,  // Right edge
        zIndex: 100
      }}>
        <VolumeButton 
          level={volumeLevel} 
          onChange={setVolumeLevel} 
        />
      </div>

      {/* Game shelf */}
      <div style={{ height: SHELF_H }}>
        <GameShelf
          textures={[...games.map((g: Game) => `${API}${g.imageUrl}`), ADD_MARKER]}
          width="100%"
          height="100%"
          rows={rowMode}
          onSelect={(idx) => {
            if (idx === -1) {
              // Add button clicked
              setModalMode("add");
              setModalOpen(true);
              setSelIdx(null);
            } else {
              // Game selected
              setSelIdx(idx);
            }
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
      </div>

      {/* Command bar */}
      <CommandBar
        onLaunch={handleLaunch}
        onEdit={handleEdit}
        canLaunch={canLaunch}
        editEnabled={editEnabled}
      />

      {/* Add/Edit modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <GameFormModal
            key={modalMode + (editTitle || '')}
            mode={modalMode}
            initial={initialData}
            onSubmit={(data: GameForm) => {
              SoundManager.playUISelect();
              createOrUpdateGame(data);
            }}
            onDismiss={() => {
              SoundManager.playUIBack();
              onCancel();
            }}
            onDelete={
              modalMode === "edit" && selectedGame
                ? () => {
                    if (selIdx !== null) {
                      SoundManager.playUIBack();
                      fetch(`${API}/api/${selectedGame.id}`, { method: "DELETE" })
                        .then(() => {
                          loadGames();
                          setModalOpen(false);
                          setSelIdx(null);
                        })
                        .catch((e) => window.alert(`Error: ${e.message}`));
                    }
                  }
                : undefined
            }
          />
        </div>
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
