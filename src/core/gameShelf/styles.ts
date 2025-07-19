// GameShelf styles with proper theme integration
import { Theme } from '../../features/theme';

export const shellStyle = (t: Theme): React.CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: '32px',          // even closer to CommandBar
  borderRadius: 40,
  // stronger plastic-panel gradient
  background: `linear-gradient(180deg, ${t.panelTop} 0%, ${t.panelBot} 95%)`,
  pointerEvents: 'none',
  zIndex: -1,

  //  ───────── lift off the page ─────────
  boxShadow:
    t.mode === 'light'
      // reduced inset highlight + drop-shadow for light mode
      ? 'inset 0 2px 3px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.05)'
      // reduced dark-mode shadow
      : 'inset 0 1px 2px rgba(255,255,255,0.04), inset 0 -1px 1px rgba(0,0,0,0.20), 0 3px 6px rgba(0,0,0,0.15)',

  // beef up the bottom rim "lip"
  borderBottom: `6px solid ${t.panelEdge}`,
  transition: 'transform 0.25s ease-out',
});

// Arrow navigation now handled by NavigationButton component using centralized theming