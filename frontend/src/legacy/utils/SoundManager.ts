// // src/utils/SoundManager.ts

// import { Howl, Howler } from "howler";


// import backgroundUrl   from "../assets/audio/background.mp3";
// import uiSelectUrl     from "../assets/audio/button-clicked-select-alt.mp3";
// import uiBackUrl       from "../assets/audio/button-clicked-back.mp3";
// import panUrl          from "../assets/audio/pan-sound-alt.mp3";
// import objectSelectUrl from "../assets/audio/button-clicked-select-mn.mp3";

// class SoundManager {
//   private static backgroundHowl: Howl | null      = null;
//   private static uiSelectHowl: Howl | null        = null;
//   private static uiBackHowl: Howl | null          = null;
//   private static panHowl: Howl | null             = null;
//   private static objectSelectHowl: Howl | null    = null;
//   private static isInitialized: boolean           = false;

//   private static init() {
//     if (SoundManager.isInitialized) return;
//     SoundManager.isInitialized = true;


//     SoundManager.backgroundHowl = new Howl({
//       src: [backgroundUrl],
//       loop: true,
//       volume: 0.15,
//       html5: true,
//       preload: true,
//     });

//     SoundManager.uiSelectHowl = new Howl({
//       src: [uiSelectUrl],
//       loop: false,
//       volume: 0.6,
//       html5: false,
//       preload: true,
//     });


//     SoundManager.uiBackHowl = new Howl({
//       src: [uiBackUrl],
//       loop: false,
//       volume: 0.6,
//       html5: false,
//       preload: true,
//     });


//     SoundManager.panHowl = new Howl({
//       src: [panUrl],
//       loop: false,
//       volume: 0.4,
//       html5: false,
//       preload: true,
//     });

//     SoundManager.objectSelectHowl = new Howl({
//       src: [objectSelectUrl],
//       loop: false,
//       volume: 0.6,
//       html5: false,
//       preload: true,
//     });
//   }


//   public static playBackground() {
//     SoundManager.init();
//     if (SoundManager.backgroundHowl && !SoundManager.backgroundHowl.playing()) {
//       SoundManager.backgroundHowl.play();
//     }
//   }


//   public static stopBackground() {
//     SoundManager.init();
//     if (SoundManager.backgroundHowl && SoundManager.backgroundHowl.playing()) {
//       SoundManager.backgroundHowl.pause();
//     }
//   }


//   public static playPan() {
//     SoundManager.init();
//     SoundManager.panHowl?.play();
//   }


//   public static playUISelect() {
//     SoundManager.init();
//     SoundManager.uiSelectHowl?.play();
//   }


//   public static playUIBack() {
//     SoundManager.init();
//     SoundManager.uiBackHowl?.play();
//   }


//   public static playObjectSelect() {
//     SoundManager.init();
//     SoundManager.objectSelectHowl?.play();
//   }

//   /** Mute/unmute all sounds. */
//   public static setMuted(muted: boolean) {
//     SoundManager.init();
//     Howler.mute(muted);
//   }


//   public static setGlobalVolume(volume: number) {
//     SoundManager.init();
//     Howler.volume(volume);
//   }
// }

// export default SoundManager;