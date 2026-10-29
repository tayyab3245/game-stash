import React from 'react';
import { GridMode } from './GridButton.logic';

interface GridIconProps {
  mode: GridMode;
  size?: number;
}

type Box = { x: number; y: number; w: number; h: number; r: number };

/**
 * Four rounded tiles that morph between layouts:
 *   1 → one big tile (all four stacked on top of each other)
 *   2 → two wide tiles, one per shelf row
 *   3 → a 2×2 grid (compact view)
 * Every tile stays filled; CSS transitions on x/y/width/height do the morph.
 */
const GridIcon: React.FC<GridIconProps> = ({ mode, size = 48 }) => {
  const pad = size * 0.1;
  const gap = size * 0.12;
  const full = size - pad * 2;
  const half = (full - gap) / 2;

  const layouts: Record<GridMode, Box[]> = {
    1: Array(4).fill({ x: pad, y: pad, w: full, h: full, r: full * 0.24 }),
    2: [0, 0, 1, 1].map(row => ({ x: pad, y: pad + row * (half + gap), w: full, h: half, r: half * 0.32 })),
    3: [0, 1, 2, 3].map(i => ({
      x: pad + (i % 2) * (half + gap),
      y: pad + Math.floor(i / 2) * (half + gap),
      w: half,
      h: half,
      r: half * 0.32,
    })),
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {layouts[mode].map((b, i) => (
        <rect
          key={i}
          fill="currentColor"
          shapeRendering="geometricPrecision"
          style={{
            x: b.x,
            y: b.y,
            width: b.w,
            height: b.h,
            rx: b.r,
            ry: b.r,
            // Springy overshoot, slightly staggered so the tiles "pop" apart
            transition: `all 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.035}s`,
          } as React.CSSProperties}
        />
      ))}
    </svg>
  );
};

export default GridIcon;
