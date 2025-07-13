// NEW – src/components/VolumeButton.tsx
import React, { useEffect, useState } from "react";
import SoundManager from "../utils/SoundManager";
import { useTheme } from "../theme/ThemeContext";

export type VolumeLevel = 0 | 1 | 2 | 3; // 0 = mute … 3 = high

interface Props {
  level: VolumeLevel;
  onChange: (next: VolumeLevel) => void;
}

/** Cycles mute → low → mid → high and mirrors it in SoundManager. */
export default function VolumeButton({ level, onChange }: Props) {
  const theme = useTheme();
  const [animationKey, setAnimationKey] = useState(0);

  const cycle = () => {
    const next = ((level + 1) % 4) as VolumeLevel;
    SoundManager.setMuted(next === 0);
    SoundManager.setGlobalVolume([0, 0.33, 0.66, 1][next]);
    onChange(next);
    // Trigger animation when volume changes
    if (next > 0) {
      setAnimationKey(prev => prev + 1);
    }
  };

  useEffect(() => {
    document.querySelectorAll('style[data-owner="volume-btn-style"]').forEach((n) => n.remove());
    const s = document.createElement('style');
    s.dataset.owner = 'volume-btn-style';
    s.innerHTML = `
      @keyframes volumeWaves {
        0% { 
          opacity: 0.3;
          transform: scale(0.8);
        }
        25% { 
          opacity: 0.6;
          transform: scale(0.9);
        }
        50% { 
          opacity: 1;
          transform: scale(1);
        }
        75% { 
          opacity: 0.8;
          transform: scale(1.05);
        }
        100% { 
          opacity: 1;
          transform: scale(1);
        }
      }
      .volume-btn-seg {
        position: relative;
        border: none;
        padding: 4px;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: inherit;
        cursor: pointer;
        overflow: visible;
        outline: none;
        border-radius: 12px;
        background: 
          linear-gradient(-35deg, rgba(255,255,255,0.07) 0%, transparent 60%),
          linear-gradient(180deg, ${theme.panelTop} 0%, ${theme.panelBot} 100%);
        background-blend-mode: soft-light;
      }
      
      /* Light mode - proper 3D plastic effect */
      ${theme.mode === 'light' ? `
      .volume-btn-seg {
        box-shadow: 
          inset 0 1px 0 rgba(255,255,255,0.9),
          inset 0 -1px 0 rgba(0,0,0,0.2),
          inset 1px 0 0 rgba(255,255,255,0.4),
          inset -1px 0 0 rgba(0,0,0,0.1),
          0 2px 4px rgba(0,0,0,0.15);
      }
      .volume-btn-seg:active {
        transform: translateY(1px);
        box-shadow: 
          inset 0 1px 0 rgba(0,0,0,0.2),
          inset 0 -1px 0 rgba(255,255,255,0.7),
          inset 1px 0 0 rgba(0,0,0,0.1),
          inset -1px 0 0 rgba(255,255,255,0.3),
          0 1px 2px rgba(0,0,0,0.2);
      }
      ` : `
      /* Dark mode - keep existing glow effect */
      .volume-btn-seg {
        box-shadow: inset 0 2px 3px rgba(255,255,255,0.08), inset 0 -1px 2px rgba(0,0,0,0.40), 0 6px 12px rgba(0,0,0,0.30);
      }
      .volume-btn-seg:active {
        transform: translateY(1px);
        box-shadow: inset 0 1px 2px rgba(255,255,255,0.10), inset 0 -1px 2px rgba(0,0,0,0.50), 0 2px 4px rgba(0,0,0,0.35);
      }
      `}
      
      .volume-waves {
        animation: volumeWaves 1.5s ease-out forwards;
        animation-play-state: paused;
      }
      .volume-waves-trigger-${animationKey} {
        animation-play-state: running;
      }
      .volume-btn-seg::before {
        content: "";
        position: absolute;
        inset: 4px;
        border-radius: 8px;
        background: rgba(255,255,255,.08);
        opacity: 0;
        transition: opacity 0.12s;
      }
      .volume-btn-seg:hover::before {
        opacity: ${theme.mode === 'light' ? '0.25' : '0.35'};
      }
      .volume-btn-seg svg {
        width: 40px;
        height: 40px;
        position: relative;
        overflow: visible;
      }
    `;
    document.head.appendChild(s);
    return () => { s.remove(); };
  }, [theme, animationKey]);

  const title =
    level === 0 ? 'Un-mute'
    : level === 1 ? 'Volume low'
    : level === 2 ? 'Volume mid'
    :               'Volume high';

  return (    <button
      title={title}
      className="volume-btn-seg"
      style={{
        position: 'relative',
        width: '48px',
        height: '48px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px',
        color: 'inherit',
        overflow: 'visible',
        background: 'transparent',
        border: 'none',
        outline: 'none',
      }}
      onPointerUp={cycle}
    >      <svg
        viewBox="-4 -4 40 40"
        fill="none"
        stroke={theme.text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          width: '40px',
          height: '40px',
          position: 'relative',
          overflow: 'visible',
        }}
      >        {/* — rounded speaker body (filled) — */}
        <path
          d="M6 12a1 1 0 0 1 1-1h3.5l4-3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1l-4-3H7a1 1 0 0 1-1-1V12z"
          fill={theme.text} stroke={theme.text} strokeLinejoin="round"
        />
        {/* — sound waves — */}
        {level > 0 && <path className={`volume-waves volume-waves-trigger-${animationKey}`} d="M17 12.2a3 3 0 0 1 0 5.6" fill="none" />}
        {level > 1 && <path className={`volume-waves volume-waves-trigger-${animationKey}`} d="M21 10a5.5 5.5 0 0 1 0 10" fill="none" />}
        {level > 2 && <path className={`volume-waves volume-waves-trigger-${animationKey}`} d="M25 8a8 8 0 0 1 0 14" fill="none" />}
        {/* — mute slash — */}
        {level === 0 && <line x1="17" y1="9" x2="24" y2="21" />}
      </svg>
    </button>
  );
}
