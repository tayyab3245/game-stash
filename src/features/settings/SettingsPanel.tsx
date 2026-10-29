// Settings - gear button + panel for app-wide options (per-game options stay in EDIT)
import React, { useEffect, useId } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { lightStyles } from '../../core/theme/light.styles';
import { darkStyles } from '../../core/theme/dark.styles';
import '../../components/dialog/Dialog.css';
import './SettingsPanel.css';

export interface AppSettings {
  showClock: boolean;
  showHints: boolean;
  music: boolean;
  emulatorPath: string;  // used by games that don't set their own emulator
  romsPath: string;      // games without a ROM are matched to files here by title
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  showClock: true,
  showHints: true,
  music: true,
  emulatorPath: '',
  romsPath: '',
};

export const GearIcon: React.FC = () => {
  const maskId = `gear-hole-${useId().replace(/:/g, '')}`; // ':' breaks url(#…)
  return (
    <svg viewBox="0 0 32 32" className="settings-gear-icon">
      <defs>
        <mask id={maskId}>
          <rect width="32" height="32" fill="#fff" />
          <circle cx="16" cy="16" r="4.2" fill="#000" />
        </mask>
      </defs>
      <g fill="currentColor" mask={`url(#${maskId})`}>
        {/* Chunky, rounded teeth: friendlier than a sharp cog */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="13" y="2.6" width="6" height="8" rx="2.6" transform={`rotate(${i * 45} 16 16)`} />
        ))}
        <circle cx="16" cy="16" r="10" />
      </g>
    </svg>
  );
};

/** Top-bar gear that opens the settings panel */
export const SettingsButton: React.FC<{ open: boolean; onClick: () => void }> = ({ open, onClick }) => {
  const { mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.volumeButton : darkStyles.volumeButton;
  return (
    <div style={styles.container}>
      <button
        className={`settings-button ${open ? 'is-open' : ''}`}
        style={{ ...styles.button, color: styles.iconColor }}
        onClick={onClick}
        aria-label="Settings"
        title="Settings"
      >
        <GearIcon />
      </button>
    </div>
  );
};

const Toggle: React.FC<{ label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label, hint, checked, onChange,
}) => (
  <div className="dialog-row">
    <div className="dialog-row__text">
      <div className="dialog-row__label">{label}</div>
      {hint && <div className="dialog-row__hint">{hint}</div>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`dialog-switch ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="dialog-switch__knob" />
    </button>
  </div>
);

const PathPicker: React.FC<{ label: string; hint: string; value: string; onPick: () => void; onClear: () => void }> = ({
  label, hint, value, onPick, onClear,
}) => (
  <div className="dialog-row">
    <div className="dialog-row__text">
      <div className="dialog-row__label">{label}</div>
      <div className="dialog-row__hint" title={value || undefined}>
        {value ? value.split(/[/\\]/).filter(Boolean).pop() : hint}
      </div>
    </div>
    <div className="dialog-row__actions">
      {value && (
        <button className="dialog-chip dialog-chip--quiet" onClick={onClear}>Clear</button>
      )}
      <button className="dialog-chip" onClick={onPick}>{value ? 'Change' : 'Choose'}</button>
    </div>
  </div>
);

export interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onClose }) => {
  const { mode } = useTheme();
  const dialogAPI = (window as any).dialogAPI;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pickEmulator = async () => {
    const picked = await dialogAPI?.selectFile({
      title: 'Choose your emulator',
      defaultPath: settings.emulatorPath || undefined,
    });
    if (picked) onChange({ emulatorPath: picked });
  };

  const pickRoms = async () => {
    const picked = await dialogAPI?.selectFolder({
      title: 'Choose your ROM folder',
      defaultPath: settings.romsPath || undefined,
    });
    if (picked) onChange({ romsPath: picked });
  };

  return (
    <div className={`dialog-overlay dialog-overlay--${mode}`} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog-panel" role="dialog" aria-label="Settings">
        <div className="dialog-panel__header">
          <GearIcon />
          <h2>Settings</h2>
        </div>

        <section className="dialog-section">
          <h3>Display</h3>
          <Toggle label="Show clock" checked={settings.showClock} onChange={(v) => onChange({ showClock: v })} />
          <Toggle label="Show hints" hint="Tips like “Drag to rotate”" checked={settings.showHints} onChange={(v) => onChange({ showHints: v })} />
        </section>

        <section className="dialog-section">
          <h3>Sound</h3>
          <Toggle label="Background music" checked={settings.music} onChange={(v) => onChange({ music: v })} />
        </section>

        <section className="dialog-section">
          <h3>Games</h3>
          <PathPicker
            label="Default emulator"
            hint="Used by any game without its own"
            value={settings.emulatorPath}
            onPick={pickEmulator}
            onClear={() => onChange({ emulatorPath: '' })}
          />
          <PathPicker
            label="ROM folder"
            hint="Games are matched to ROMs by title"
            value={settings.romsPath}
            onPick={pickRoms}
            onClear={() => onChange({ romsPath: '' })}
          />
        </section>

        <button className="dialog-done" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

export default SettingsPanel;
