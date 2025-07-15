export const ADD_MARKER = "__ADD__";
export const FULL_W_3DS = 3236;   // total pixel width of your 3DS scan
export const FULL_H_3DS = 1360;   // total pixel height of your 3DS scan
export const BACK_3DS   = 1508;   // back cover width in px (3DS)
export const SPINE_3DS  = 120;    // spine width in px (3DS)
export const FRONT_3DS  = 1608;   // front cover width in px (3DS)

export const HEIGHT_RATIO_3DS = 0.73;

export const WIDTH_FACTOR  = 0.50;
export const DEPTH_FACTOR  = WIDTH_FACTOR;
export const PANEL_RATIO   = 4.875 / 5.875;

export const OVERSCROLL_DAMP = 0.15;          

export const LAYOUT = {
  1: { scale: 1.10, gapX: 0.25, gapY: 0.05,  padTop: 0.5, padBottom: 0.05, padLeft: 0.15, padRight: 0.15 },
  2: { scale: 1.30, gapX: 0.25, gapY: 0.25, padTop: 0.3, padBottom: 0.1, padLeft: 0.15, padRight: 0.15 },
} as const;

// === SELECTOR & INTERACTION CONSTANTS ===
export const SELECTOR = {
  // Scale multipliers for different states per layout
  SELECTED_SCALE_MULTIPLIER: {
    1: 1.0,    // 1-row: Games are massive and take over screen when selected
    2: 2.1,    // 2-row: Slightly bigger when selected (for testing)
  },
  HOVER_SCALE_MULTIPLIER: {
    1: 1.98,    // 1-row: Prominent hover effect for large games
    2: 1.03,    // 2-row: Subtle hover effect for smaller games
  },
  
  // Yellow selector indicator area/frame size tweaks
  SELECTOR_FRAME_SCALE: {
    1: 2.0,     // 1-row layout: how much area the selector frames around the game
    2: 2.0,     // 2-row layout: how much area the selector frames around the game
  },
  // Animation and interaction constants
  HOVER_BASE: 0.04,                   // Base hover animation distance
  BREATHE_DISTANCE: 0.04,             // Breathing animation distance for selected items
  BREATHE_SPEED: 4.8,                 // Breathing animation speed (frequency)
  
  // Timing constants (in seconds)
  SNAP_DURATION: 0.25,                // Camera/shell snap animation
  HOVER_DURATION: 0.30,               // Hover transition duration
  TAP_DURATION: 0.18,                 // Tap feedback duration
  SELECTION_FADE_DURATION: 0.2,       // Outline fade in/out duration
  
  // Animation constants
  PAN_DAMPING: 0.005,                 // Panning damping factor
  GRID_ANIM_DURATION: 0.5,            // Grid layout change animation duration
  GRID_ANIM_HEIGHT: 0.4,              // Grid animation vertical offset
} as const;