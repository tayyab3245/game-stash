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
  const uid = useId().replace(/:/g, ''); // ':' breaks url(#…) references
  const VIEWBOX = 200;
  const CENTER = VIEWBOX / 2;
  const BODY_RADIUS = 46;   // one round body: full disc = sun, eclipsed = moon
  const RAY_COUNT = 8;
  const RAY_INNER = 64;     // chubby, round-capped rays
  const RAY_OUTER = 80;
  const RAY_WIDTH = 15;
  const isLight = mode === "light";
  const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  // 4-point sparkle with soft, rounded points
  const sparkle = (cx: number, cy: number, r: number) =>
    `M${cx} ${cy - r} Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} ` +
    `Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} ` +
    `Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} ` +
    `Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}Z`;

  /* the actual art, reused in both render modes */
  const SunMoonSVG = (
    <svg
      width={VIEWBOX}
      height={VIEWBOX}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      style={{ display: "block", color: styles.iconColor, overflow: "visible" }}
    >
      <defs>
        {/* "Goo" filter: blur then sharpen alpha, which rounds the crescent's tips */}
        <filter id={`soften-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
        </filter>
        {/* Eclipse: a dark disc slides over the sun to carve out the moon */}
        <mask id={`eclipse-${uid}`}>
          <rect width="100%" height="100%" fill="#fff" />
          <circle
            cx={isLight ? CENTER + 120 : CENTER + 30}
            cy={isLight ? CENTER - 70 : CENTER - 22}
            r={40}
            fill="#000"
            style={{
              transition: isLight
                ? "cx 0.45s ease-in, cy 0.45s ease-in"
                : `cx 0.7s ${SPRING} 0.25s, cy 0.7s ${SPRING} 0.25s`,
            }}
          />
        </mask>
      </defs>

      {/* rays: spin in and pop out with a little overshoot */}
      <g
        style={{
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform: isLight ? "rotate(0deg) scale(1)" : "rotate(-60deg) scale(0.4)",
          opacity: isLight ? 1 : 0,
          transition: isLight
            ? `transform 0.6s ${SPRING} 0.35s, opacity 0.3s ease 0.35s`
            : "transform 0.35s ease-in, opacity 0.25s ease",
        }}
      >
        {Array.from({ length: RAY_COUNT }).map((_, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER - RAY_INNER}
            x2={CENTER}
            y2={CENTER - RAY_OUTER}
            stroke="currentColor"
            strokeWidth={RAY_WIDTH}
            strokeLinecap="round"
            transform={`rotate(${(360 / RAY_COUNT) * i} ${CENTER} ${CENTER})`}
          />
        ))}
      </g>

      {/* sun ⇄ moon body: tilts a little as it turns into a moon */}
      <g filter={`url(#soften-${uid})`}>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={BODY_RADIUS}
          fill="currentColor"
          mask={`url(#eclipse-${uid})`}
          style={{
            transformOrigin: `${CENTER}px ${CENTER}px`,
            transform: isLight ? "rotate(0deg) scale(1)" : "rotate(-18deg) scale(1.22)",
            transition: `transform 0.7s ${SPRING} 0.2s`,
          }}
        />
      </g>

      {/* twinkling sparkles keep the moon company */}
      {[
        { cx: CENTER + 56, cy: CENTER - 46, r: 21, delay: 0.55 },
        { cx: CENTER + 70, cy: CENTER + 10, r: 13, delay: 0.7 },
      ].map((st, i) => (
        <g
          key={i}
          style={{
            transformOrigin: `${st.cx}px ${st.cy}px`,
            transform: isLight ? "scale(0) rotate(-90deg)" : "scale(1) rotate(0deg)",
            opacity: isLight ? 0 : 1,
            transition: isLight
              ? "transform 0.25s ease-in, opacity 0.2s ease"
              : `transform 0.5s ${SPRING} ${st.delay}s, opacity 0.3s ease ${st.delay}s`,
          }}
        >
          <path
            d={sparkle(st.cx, st.cy, st.r)}
            fill="currentColor"
            className="theme-toggle__sparkle"
            style={{ animationDelay: `${i * 0.9}s` }}
          />
        </g>
      ))}
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
