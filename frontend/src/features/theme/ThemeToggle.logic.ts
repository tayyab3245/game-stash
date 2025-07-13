// Theme toggle logic
import { ThemeMode } from './ThemeToggle.types';

export class ThemeToggleLogic {
  static getNextMode(currentMode: ThemeMode): ThemeMode {
    return currentMode === "light" ? "dark" : "light";
  }

  static getSunVisibility(mode: ThemeMode): number {
    return mode === "light" ? 1 : 0;
  }

  static getMoonVisibility(mode: ThemeMode): number {
    return mode === "dark" ? 1 : 0;
  }

  static getAnimationDelay(mode: ThemeMode): string {
    return mode === "light" ? "0s" : "0.2s";
  }
}
