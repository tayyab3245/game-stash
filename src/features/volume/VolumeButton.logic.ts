// Volume button logic - TV-remote style: a row of dashes from mute up to max
import SoundManager from '../../core/audio/SoundManager';

export const MAX_VOLUME_LEVEL = 5;
export type VolumeLevel = 0 | 1 | 2 | 3 | 4 | 5; // 0 = mute … 5 = max

export class VolumeLogic {
  // Push a level to the audio engine
  static apply(level: VolumeLevel) {
    SoundManager.setMuted(level === 0);
    SoundManager.setGlobalVolume(level / MAX_VOLUME_LEVEL);
  }

  // Clicking the speaker steps up one dash; past max it wraps to mute
  static cycle(currentLevel: VolumeLevel): VolumeLevel {
    const next = (currentLevel >= MAX_VOLUME_LEVEL ? 0 : currentLevel + 1) as VolumeLevel;
    this.apply(next);
    return next;
  }

  static set(level: VolumeLevel): VolumeLevel {
    this.apply(level);
    return level;
  }

  // How many sound waves the speaker icon shows (0 = muted X)
  static waveCount(level: VolumeLevel): number {
    if (level === 0) return 0;
    if (level <= 2) return 1;
    if (level <= 4) return 2;
    return 3;
  }

  static getTitle(level: VolumeLevel): string {
    return level === 0 ? 'Muted' : `Volume ${level} of ${MAX_VOLUME_LEVEL}`;
  }
}
