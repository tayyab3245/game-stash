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
import HelpTrigger from "./components/HelpTrigger";
// Import theme styles
import { lightStyles } from "./core/theme/light.styles";
import { darkStyles } from "./core/theme/dark.styles";
// Import custom cursor
import { CustomCursor } from "./features/cursor";

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
  const [showHints, setShowHints] = useState(true);
  const [forceShowHints, setForceShowHints] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [commandBarVisible, setCommandBarVisible] = useState(true);
  const [gameTransitioning, setGameTransitioning] = useState(false);

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

  /* ── Handle command bar animation when game selection changes ── */
  useEffect(() => {
    if (selIdx !== null && !modalOpen) {
      // Hide command bar immediately when game changes
      setCommandBarVisible(false);
      setGameTransitioning(true);
      
      // Show command bar after a delay (allowing game to center)
      const timer = setTimeout(() => {
        setCommandBarVisible(true);
        setGameTransitioning(false);
      }, 600); // Adjust timing to match your 3D animation duration
      
      return () => clearTimeout(timer);
    } else {
      // No game selected or modal is open, hide command bar
      setCommandBarVisible(false);
      setGameTransitioning(false);
    }
  }, [selIdx, modalOpen]);

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

  // Function to manually trigger/toggle hints
  const triggerHints = () => {
    console.log('Toggling hints manually from Main');
    if (selIdx !== null && rowMode === 1) {
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
    coverUrl: `${API}${selectedGame.imageUrl}`,
  } : {};

  return (
    <div style={{ 
      background: theme.mode === 'light' ? 'linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%)' : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      position: 'relative'
    }}>
      {/* Custom Ring Cursor */}
      <CustomCursor enabled={true} />
      
      {/* Left Button Group Background */}
      <div style={theme.mode === 'light' ? lightStyles.leftButtonBackground.container : darkStyles.leftButtonBackground.container}></div>
      
      {/* Upper left: view-toggle buttons */}
      <div style={theme.mode === 'light' ? lightStyles.gridButtons.container : darkStyles.gridButtons.container}>
        {[1, 2].map((r) => (
          <GridButton
            key={r}
            mode={r as 1 | 2}
            filled={rowMode === r}
            onChange={(newRowMode) => {
              // Hide command bar during row mode transition
              setCommandBarVisible(false);
              setGameTransitioning(true);
              setRowMode(newRowMode as 1 | 2);
              
              // Show command bar after transition
              setTimeout(() => {
                setCommandBarVisible(true);
                setGameTransitioning(false);
              }, 600);
            }}
          />
        ))}
      </div>

      {/* Header */}
      <Header selectedGame={selectedGame} currentTime={now} />
      
      {/* Right Button Group Background */}
      <div style={theme.mode === 'light' ? lightStyles.rightButtonBackground.container : darkStyles.rightButtonBackground.container}></div>
      
      {/* Theme Toggle - using centralized styling */}
      <ThemeToggle onThemeChange={onThemeChange} />

      {/* Volume control - using centralized styling */}
      <VolumeButton 
        level={volumeLevel} 
        onChange={setVolumeLevel} 
      />

      {/* Game shelf */}
      <div style={{ height: SHELF_H }}>
        <GameShelf
          textures={[...games.map((g: Game) => `${API}${g.imageUrl}`), ADD_MARKER]}
          width="100%"
          height="100%"
          rows={rowMode}
          showHints={showHints}
          forceShowHints={forceShowHints}
          onHintsChange={(show) => setShowHints(show)}
          onSelect={(idx) => {
            if (idx === -1) {
              // Add button clicked
              setModalMode("add");
              setModalOpen(true);
              setSelIdx(null);
            } else {
              // Game selected - trigger command bar animation
              if (idx !== selIdx) {
                setCommandBarVisible(false);
                setGameTransitioning(true);
              }
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
        visible={commandBarVisible}
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
      
      {/* Help Trigger Button - always visible when a game is selected in single row mode */}
      <HelpTrigger
        visible={rowMode === 1 && selIdx !== null && !modalOpen}
        hintsActive={showHints || forceShowHints}
        yOffset={690} // Adjust this value to move the button up/down
        onClick={triggerHints}
      />
      
      {/* Hint Status Message - positioned next to help button in top right */}
      {hintMessage && (
        <div style={{
          position: 'fixed',
          top: 'calc(100vh - 690px - 45px)', // Moved up by 12px (was -28px, now -40px)
          right: '105px', // Added more spacing from button (was 85px, now 105px)
          background: theme.mode === 'light' ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          color: theme.mode === 'light' ? '#ffffff' : '#141414',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 1001,
          whiteSpace: 'nowrap',
          animation: 'helpMessageFadeInOut 2s ease-in-out forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {hintMessage}
          {/* Arrow pointing to button */}
          <div style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid ' + (theme.mode === 'light' ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)'),
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            position: 'absolute',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
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
