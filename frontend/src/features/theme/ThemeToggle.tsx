// ThemeToggle - Restored animated SVG theme toggle (ported from legacy)
import React, { useId } from "react";
import { useTheme } from "./ThemeContext";
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";

export interface ThemeToggleProps {
  /** Called with the new mode after a click (optional) */
  onThemeChange?: (mode: "light" | "dark") => void;
  /** If true render only the SVG (no wrapper button, no click) */
  inline?: boolean;
}

/**
 * Click → toggles light ⇄ dark
 * Shows an animated sun / moon icon with centralized styling.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  onThemeChange,
  inline = false,
}) => {
  const { theme, mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.themeToggle : darkStyles.themeToggle;

  /* click simply *notifies* the parent  */
  const handleClick = () => {
    const next = mode === "light" ? "dark" : "light";
    onThemeChange?.(next);
  };

  // Button press effect handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.transform = 'translateY(2px)';
    // Use a pressed shadow effect
    button.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.transform = 'translateY(0px)';
    button.style.boxShadow = styles.button?.boxShadow || '';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    button.style.transform = 'translateY(0px)';
    button.style.boxShadow = styles.button?.boxShadow || '';
  };

  /* ─── SVG constants ─── */
  const uid = useId();
  const VIEWBOX = 160;  // Increased from 120 to 160 for much larger icon
  const CENTER = VIEWBOX / 2;
  const CORE_RADIUS = 16;  // Scaled up from 12 to 16
  const RAY_COUNT = 8;
  const RAY_LEN = 12;   // Scaled up from 8 to 12
  const RAY_WID = 5;    // Scaled up from 4 to 5
  const RAY_GAP = 4;    // Scaled up from 3 to 4
  const MASK_RADIUS = CORE_RADIUS + 1;

  /* the actual art, reused in both render modes */
  const SunMoonSVG = (
    <svg
      width={VIEWBOX}
      height={VIEWBOX}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      style={{ display: "block", color: styles.iconColor }}
    >
      <mask id={`rayMask-${uid}`}>
        <rect width="100%" height="100%" fill="#fff" />
        <circle cx={CENTER} cy={CENTER} r={MASK_RADIUS} fill="#000" />
      </mask>
      {/* rays */}
      <g
        mask={`url(#rayMask-${uid})`}
        style={{
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform:
            mode === "light"
              ? "rotate(0deg) scale(1)"
              : "rotate(45deg) scale(0.55)",
          opacity: mode === "light" ? 1 : 0,
          transition:
            "opacity .8s ease-out, transform 1.2s cubic-bezier(.4,1.7,.6,1)",
        }}
      >
        {Array.from({ length: RAY_COUNT }).map((_, i) => (
          <rect
            key={i}
            x={CENTER - RAY_WID / 2}
            y={CENTER - CORE_RADIUS - RAY_GAP - RAY_LEN}
            width={RAY_WID}
            height={RAY_LEN}
            rx={1}
            fill="currentColor"
            transform={`rotate(${(360 / RAY_COUNT) * i} ${CENTER} ${CENTER})`}
          />
        ))}
      </g>
      {/* core disc ⇄ ring */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={CORE_RADIUS}
        fill="currentColor"
        style={{
          opacity: mode === "light" ? 1 : 0,
          transition: "opacity .8s linear",
          filter:
            mode === "light"
              ? "drop-shadow(0 0 6px rgba(255,255,255,.5))"
              : "none",
        }}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={CORE_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        style={{
          opacity: mode === "light" ? 0 : 1,
          transition: "opacity .8s linear",
        }}
      />
    </svg>
  );

  /* ─── render ─── */
  if (inline) {
    /* just the icon – parent handles the click */
    return SunMoonSVG;
  }

  /* button version with centralized styling */
  return (
    <div style={styles.container}>
      <button
        onClick={handleClick}
        aria-label="Toggle theme"
        style={{
          ...styles.button,
          transition: 'all 0.15s ease',
          transform: 'translateY(0px)',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {SunMoonSVG}
      </button>
    </div>
  );
};

export default ThemeToggle;
