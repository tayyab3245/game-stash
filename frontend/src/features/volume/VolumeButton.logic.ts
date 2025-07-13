// Pure volume control logic - no UI concerns
import SoundManager from '../../core/audio/SoundManager';

export type VolumeLevel = 0 | 1 | 2 | 3; // 0 = mute … 3 = high

export class VolumeLogic {
  static cycle(currentLevel: VolumeLevel): VolumeLevel {
    const next = ((currentLevel + 1) % 4) as VolumeLevel;
    
    // Update sound manager
    SoundManager.setMuted(next === 0);
    SoundManager.setGlobalVolume([0, 0.33, 0.66, 1][next]);
    
    return next;
  }

  static getTitle(level: VolumeLevel): string {
    switch (level) {
      case 0: return 'Un-mute';
      case 1: return 'Volume low';
      case 2: return 'Volume mid';
      case 3: return 'Volume high';
      default: return 'Volume';
    }
  }

  static shouldAnimate(newLevel: VolumeLevel): boolean {
    return newLevel > 0;
  }

  static getVolumePercentage(level: VolumeLevel): number {
    return [0, 33, 66, 100][level];
  }
}
