// GameFormModal - Add / Edit a game, in the same dialog style as Settings
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../features/theme/ThemeContext';
import { GameForm, GameFormModalProps } from './types';
import '../dialog/Dialog.css';
import './GameFormModal.css';

const fileName = (p: string) => p.split(/[/\\]/).filter(Boolean).pop() ?? '';

const PencilIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const GameFormModal: React.FC<GameFormModalProps> = ({
  mode,
  initial = {},
  onSubmit,
  onDismiss,
  onDelete,
}) => {
  const { mode: themeMode } = useTheme();
  const dialogAPI = (window as any).dialogAPI;

  const [form, setForm] = useState<GameForm>({
    title: initial.title ?? "",
    coverFile: initial.coverFile ?? null,
    romPath: initial.romPath ?? "",
    emuPath: initial.emuPath ?? "",
  });

  // Preview: a newly picked file, else the game's current cover (a servable URL from Main)
  const pickedPreview = useMemo(() => (form.coverFile ? URL.createObjectURL(form.coverFile) : null), [form.coverFile]);
  useEffect(() => () => { if (pickedPreview) URL.revokeObjectURL(pickedPreview); }, [pickedPreview]);
  const preview = pickedPreview || initial.coverUrl || '';
  const [previewFailed, setPreviewFailed] = useState(false);
  useEffect(() => setPreviewFailed(false), [preview]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  // Only a title and a cover are needed: a shelf of covers is fine on its own. Game file and
  // emulator are optional (Launch falls back to the defaults in Settings).
  const isValid =
    form.title.trim() !== "" &&
    (mode === "edit" || form.coverFile !== null);

  const pickCover = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      if (file) setForm(prev => ({ ...prev, coverFile: file }));
    };
    input.click();
  };

  // Picking files here only changes this game; the defaults live in Settings
  const pickRom = async () => {
    const picked = await dialogAPI?.selectFile({
      title: 'Choose the game file',
      defaultPath: form.romPath || undefined,
      filters: [{ name: '3DS games', extensions: ['3ds', 'cia', 'cci', '3dsx'] }, { name: 'All files', extensions: ['*'] }],
    });
    if (picked) setForm(prev => ({ ...prev, romPath: picked }));
  };

  const pickEmulator = async () => {
    const picked = await dialogAPI?.selectFile({
      title: 'Choose the emulator',
      defaultPath: form.emuPath || undefined,
      filters: [{ name: 'Apps', extensions: ['app', 'exe', 'AppImage'] }, { name: 'All files', extensions: ['*'] }],
    });
    if (picked) setForm(prev => ({ ...prev, emuPath: picked }));
  };

  return (
    <div
      className={`dialog-overlay dialog-overlay--${themeMode}`}
      onPointerDown={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div className="dialog-panel" role="dialog" aria-label={mode === 'add' ? 'Add game' : 'Edit game'}>
        <div className="dialog-panel__header">
          {mode === 'add' ? <PlusIcon /> : <PencilIcon />}
          <h2>{mode === 'add' ? 'Add Game' : 'Edit Game'}</h2>
        </div>

        <section className="dialog-section">
          <h3>Cover</h3>
          <button className="game-form__cover" onClick={pickCover} aria-label="Choose a cover image">
            {preview && !previewFailed ? (
              <img src={preview} alt="Cover preview" onError={() => setPreviewFailed(true)} />
            ) : (
              <span className="game-form__cover-empty">
                <PlusIcon />
                <span>{previewFailed ? "Couldn't load the cover. Choose it again" : 'Choose a cover scan'}</span>
              </span>
            )}
          </button>
        </section>

        <section className="dialog-section">
          <h3>Details</h3>
          <label className="dialog-row">
            <div className="dialog-row__text">
              <div className="dialog-row__label">Title</div>
              <input
                className="game-form__input"
                value={form.title}
                placeholder="Game title"
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
          </label>
        </section>

        <section className="dialog-section">
          <h3>Game files · optional</h3>
          <div className="dialog-row">
            <div className="dialog-row__text">
              <div className="dialog-row__label">Game file</div>
              <div className="dialog-row__hint" title={form.romPath || undefined}>
                {form.romPath ? fileName(form.romPath) : 'Or let Settings find it in your ROM folder'}
              </div>
            </div>
            <button className="dialog-chip" onClick={pickRom}>{form.romPath ? 'Change' : 'Choose'}</button>
          </div>
          <div className="dialog-row">
            <div className="dialog-row__text">
              <div className="dialog-row__label">Emulator</div>
              <div className="dialog-row__hint" title={form.emuPath || undefined}>
                {form.emuPath ? fileName(form.emuPath) : 'Or use the default emulator from Settings'}
              </div>
            </div>
            <button className="dialog-chip" onClick={pickEmulator}>{form.emuPath ? 'Change' : 'Choose'}</button>
          </div>
        </section>

        <div className="game-form__actions">
          {mode === 'edit' && onDelete && (
            <button className="dialog-chip dialog-chip--quiet game-form__delete" onClick={onDelete}>Delete game</button>
          )}
          <span className="game-form__spacer" />
          <button className="dialog-chip" onClick={onDismiss}>Cancel</button>
          <button className="dialog-done game-form__save" disabled={!isValid} onClick={() => isValid && onSubmit(form)}>
            {mode === 'add' ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameFormModal;
