// Header - selected game's title (scrolls when too long) and hours played
import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";
import './Header.css';

export interface HeaderProps {
  selectedGame?: {
    title: string;
    hoursPlayed: number;
  } | null;
  placeholder?: string; // shown when no game is selected
  hidden?: boolean;     // fade the title panel away (e.g. while the "+" slot is selected)
}

const MARQUEE_PX_PER_SEC = 45;

const Header: React.FC<HeaderProps> = ({ selectedGame, placeholder = 'Select a game', hidden = false }) => {
  const { mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.header : darkStyles.header;
  const title = selectedGame?.title ?? placeholder;

  const boxRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  // How far the title runs past its box; re-measured when the title or the window changes
  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;
    const measure = () => {
      const pad = parseFloat(getComputedStyle(box).paddingLeft) + parseFloat(getComputedStyle(box).paddingRight);
      setOverflow(Math.max(0, Math.ceil(text.scrollWidth - (box.clientWidth - pad))));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [title]);

  const scrolling = overflow > 0;
  // Slide time scales with distance; the keyframes add pauses at each end
  const duration = 2 * (overflow / MARQUEE_PX_PER_SEC) / 0.6;

  return (
    <div style={{
      ...styles.container,
      opacity: hidden ? 0 : 1,
      transform: hidden ? 'translateY(-16px)' : 'none',
      transition: 'opacity 0.25s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      <div style={styles.titleWrap}>
        <h2
          ref={boxRef}
          className={`gs-title ${scrolling ? 'is-scrolling' : ''}`}
          style={{ ...styles.gameTitle, textOverflow: 'clip' }}
          title={selectedGame?.title}
        >
          <span
            key={title} // restart the scroll for each new title
            ref={textRef}
            className="gs-title__text"
            style={scrolling ? {
              ['--gs-marquee-shift' as any]: `-${overflow}px`,
              animationDuration: `${duration}s`,
            } : undefined}
          >
            {title}
          </span>
        </h2>
        {selectedGame && (
          <div style={styles.hours}>
            {selectedGame.hoursPlayed} hour{selectedGame.hoursPlayed === 1 ? '' : 's'} played
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
