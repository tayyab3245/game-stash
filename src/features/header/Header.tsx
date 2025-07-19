// Header - Game title and clock display (ported from legacy)
import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import { lightStyles } from "../../core/theme/light.styles";
import { darkStyles } from "../../core/theme/dark.styles";

export interface HeaderProps {
  selectedGame?: {
    title: string;
    hoursPlayed: number;
  } | null;
  currentTime: Date;
}

const Header: React.FC<HeaderProps> = ({ selectedGame, currentTime }) => {
  const { theme, mode } = useTheme();
  const styles = mode === 'light' ? lightStyles.header : darkStyles.header;

  const timeString = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div style={styles.container}>
      <div style={styles.titleWrap}>
        <h2 style={styles.gameTitle}>
          {selectedGame?.title ?? 'Select a game'}
        </h2>
        {selectedGame && (
          <div style={styles.hours}>
            {selectedGame.hoursPlayed} hour{selectedGame.hoursPlayed === 1 ? '' : 's'} played
          </div>
        )}
      </div>
      <span style={styles.dateTime}>
        {timeString}
      </span>
    </div>
  );
};

export default Header;
