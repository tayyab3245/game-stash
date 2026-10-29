export const ADD_MARKER = "__ADD__";
// Most games the shelf holds; the "+" slot disappears once it's full
export const MAX_GAME_SLOTS = 60;
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

export type ShelfRows = 1 | 2 | 3;


// Where the 3D view sits inside the shelf container: full width, below a top strip
// that holds the clock and help button. (The panel itself is drawn in 3D; see panel.ts.)
export const SHELF_VIEWPORT = { top: 56, side: 0, bottom: 0, radius: 0 } as const;

export const LAYOUT = {
  // gapX / gapY are fractions of the rendered cover size
  1: { scale: 1.10, gapX: 0.22, gapY: 0.05 },
  2: { scale: 1.30, gapX: 0.2, gapY: 0.13 },
  3: { scale: 1.30, gapX: 0.2, gapY: 0.12 },
} as const;

// === SELECTOR & INTERACTION CONSTANTS ===
export const SELECTOR = {
  // Scale multipliers for different states per layout
  SELECTED_SCALE_MULTIPLIER: {
    1: 1.0,    // 1-row: Games are massive and take over screen when selected
    2: 2.1,    // 2-row: Slightly bigger when selected (for testing)
    3: 2.1,
  },
  HOVER_SCALE_MULTIPLIER: {
    1: 1.98,    // 1-row: Prominent hover effect for large games
    2: 1.03,    // 2-row: Subtle hover effect for smaller games
    3: 1.03,
  },
  
  // Yellow selector indicator area/frame size tweaks
  SELECTOR_FRAME_SCALE: {
    1: 2.0,     // 1-row layout: how much area the selector frames around the game
    2: 2.0,     // 2-row layout: how much area the selector frames around the game
    3: 2.0,     // 3-row layout
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
  PAN_SPEED: 9,                       // Shelf pan easing rate (1/s); ~0.33s to settle
  PANEL_SCREEN_GAP_PX: 16,            // Gap between the panel's end and the screen edge at either end of the scroll
  // Panel padding around the games, as a fraction of a cover's size (roomier for one big row)
  PANEL_PAD: {
    1: { x: 0.36, y: 0.32 },
    2: { x: 0.3, y: 0.22 },
    3: { x: 0.3, y: 0.2 },
  },
  PANEL_FILL: 0.92,                   // The camera zooms so the panel fills this share of the view's height
  FOCUS_GROW: 0.05,                   // Selected cover grows by this much...
  FOCUS_FORWARD: 0.2,                 // ...and moves toward the camera by this share of its height
  GRID_ANIM_DURATION: 0.5,            // Grid layout change animation duration
  GRID_ANIM_HEIGHT: 0.4,              // Grid animation vertical offset
} as const;