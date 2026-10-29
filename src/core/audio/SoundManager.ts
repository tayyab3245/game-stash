// Core audio management system
// Every UI sound is the same soft click (the one the EDIT button always used),
// played at different pitches so actions still feel distinct, over quiet background music.
import { Howl, Howler } from "howler";

import clickUrl from "../../assets/audio/pan-sound-alt.mp3";
import backgroundUrl from "../../assets/audio/background.mp3";

// Playback rates: >1 is higher-pitched, <1 lower
const PITCH = {
  select: 1.18,   // moving the selector / picking something
  confirm: 1.32,  // opening, launching, adding
  back: 0.86,     // closing, cancelling, going back
  pan: 1.0,       // command bar buttons
  press: 0.92,    // any button going down: a deeper "click"
  release: 1.24,  // ...and coming back up: a lighter "clack"
};

// A touch of random variation so repeated clicks don't sound robotic
const JITTER = 0.04;

class SoundManager {
  private static clickHowl: Howl | null = null;
  private static backgroundHowl: Howl | null = null;
  private static musicEnabled = true;

  private static init() {
    if (SoundManager.clickHowl) return;
    SoundManager.clickHowl = new Howl({
      src: [clickUrl],
      loop: false,
      volume: 0.5,
      html5: false,
      preload: true,
    });
  }

  /** Play the click at a given pitch (1 = original). */
  public static playClick(rate = 1) {
    SoundManager.init();
    const howl = SoundManager.clickHowl!;
    const id = howl.play();
    howl.rate(rate * (1 + (Math.random() * 2 - 1) * JITTER), id);
  }

  /**
   * Every button clicks twice, like a real one: once on press, once on release.
   * One document-level listener covers all buttons, present and future.
   * Returns a cleanup function.
   */
  public static attachButtonClicks(): () => void {
    let pressed: Element | null = null;
    const buttonFrom = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.('button, [role="button"]');
      return el && !(el as HTMLButtonElement).disabled ? el : null;
    };
    const onDown = (e: PointerEvent) => {
      SoundManager.playBackground(); // first interaction anywhere starts the music
      if (e.button !== 0) return;
      pressed = buttonFrom(e);
      if (pressed) SoundManager.playClick(PITCH.press);
    };
    const onUp = () => {
      if (pressed) SoundManager.playClick(PITCH.release);
      pressed = null;
    };
    const onKey = () => SoundManager.playBackground();
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', onUp, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('pointerup', onUp, true);
      document.removeEventListener('pointercancel', onUp, true);
    };
  }

  /** Settings toggle for the background music */
  public static setMusicEnabled(enabled: boolean) {
    SoundManager.musicEnabled = enabled;
    if (!enabled) SoundManager.stopBackground();
    else if (SoundManager.backgroundHowl) SoundManager.playBackground(); // resume if it had started
  }

  // Background music starts on the first interaction (browsers block autoplay before that)
  public static playBackground() {
    if (!SoundManager.musicEnabled) return;
    if (!SoundManager.backgroundHowl) {
      SoundManager.backgroundHowl = new Howl({
        src: [backgroundUrl],
        loop: true,
        volume: 0.15,
        html5: true,
        preload: true,
      });
    }
    if (!SoundManager.backgroundHowl.playing()) SoundManager.backgroundHowl.play();
  }

  public static stopBackground() {
    if (SoundManager.backgroundHowl?.playing()) SoundManager.backgroundHowl.pause();
  }

  public static playPan() {
    SoundManager.playClick(PITCH.pan);
  }

  public static playUISelect() {
    SoundManager.playClick(PITCH.select);
  }

  public static playUIBack() {
    SoundManager.playClick(PITCH.back);
  }

  public static playObjectSelect() {
    SoundManager.playClick(PITCH.confirm);
  }

  /** Mute/unmute all sounds. */
  public static setMuted(muted: boolean) {
    SoundManager.init();
    Howler.mute(muted);
  }

  public static setGlobalVolume(volume: number) {
    SoundManager.init();
    Howler.volume(volume);
  }
}

export default SoundManager;
