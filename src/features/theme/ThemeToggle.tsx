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
  const VIEWBOX = 200;  // Keep large viewbox
  const CENTER = VIEWBOX / 2;
  const CORE_RADIUS = 35;  // Much larger sun to match volume button size
  const MOON_SIZE = 35;    // Same size as sun for consistency
  const RAY_COUNT = 8;
  const RAY_LEN = 24;   // Scaled up proportionally
  const RAY_WID = 8;    // Scaled up proportionally  
  const RAY_GAP = 8;    // Scaled up proportionally
  const MASK_RADIUS = CORE_RADIUS + 1;

  /* the actual art, reused in both render modes */
  const SunMoonSVG = (
    <svg
      width={VIEWBOX}
      height={VIEWBOX}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      style={{ display: "block", color: styles.iconColor }}
    >
      {/* rays */}
      <g
        style={{
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform: mode === "light" ? "rotate(0deg)" : "rotate(45deg)",
          opacity: mode === "light" ? 1 : 0,
          transition: mode === "light"
            ? "opacity 0.8s ease 0.7s, transform 0.6s ease 0.7s"
            : "opacity 0.8s ease, transform 0.6s ease",
        }}
      >
        {Array.from({ length: RAY_COUNT }).map((_, i) => {
          // Calculate ray position to check if it would overlap with moon
          const angle = (360 / RAY_COUNT) * i;
          const rayStartRadius = CORE_RADIUS + RAY_GAP;
          const rayEndRadius = rayStartRadius + RAY_LEN;
          
          // Only show ray if it doesn't extend into moon area when moon is visible
          const shouldShowRay = mode === "light" || rayStartRadius > CORE_RADIUS;
          
          return (
            <rect
              key={i}
              x={CENTER - RAY_WID / 2}
              y={CENTER - CORE_RADIUS - RAY_GAP - RAY_LEN}
              width={RAY_WID}
              height={shouldShowRay ? RAY_LEN : Math.max(0, CORE_RADIUS - rayStartRadius)}
              rx={RAY_WID / 2}
              fill="currentColor"
              transform={`rotate(${angle} ${CENTER} ${CENTER})`}
              style={{
                opacity: shouldShowRay ? 1 : 0,
                transition: "opacity 0.8s ease",
              }}
            />
          );
        })}
      </g>
      
      {/* sun core */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={CORE_RADIUS}
        fill="currentColor"
        style={{
          opacity: mode === "light" ? 1 : 0,
          transition: mode === "light" 
            ? "opacity 0.3s ease 0.5s" 
            : "opacity 0.3s ease",
        }}
      />
      
      {/* moon */}
      <defs>
        <mask id={`crescentMask-${uid}`}>
          <rect width="100%" height="100%" fill="#fff" />
          {/* Animated mask ellipse that slides in like an eclipse */}
          <ellipse 
            cx={mode === "light" ? CENTER + 80 : CENTER + 15} 
            cy={mode === "light" ? CENTER - 10 : CENTER - 5} 
            rx={25}
            ry={30}
            fill="#000"
            style={{
              transition: mode === "light" 
                ? "cx 0.5s ease, cy 0.5s ease" 
                : "cx 0.8s ease 0.5s, cy 0.8s ease 0.5s",
            }}
          />
        </mask>
      </defs>
      
      <circle
        cx={CENTER}
        cy={CENTER}
        r={CORE_RADIUS}
        fill="currentColor"
        mask={`url(#crescentMask-${uid})`}
        style={{
          opacity: mode === "light" ? 0 : 1,
          transition: mode === "light" 
            ? "opacity 0.3s ease 0.6s" 
            : "opacity 0.3s ease",
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
