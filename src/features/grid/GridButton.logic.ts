// Grid button logic - two buttons, like the 3DS: one for the single row,
// one that flips between the 2-row and the compact 2×2 views
export type GridMode = 1 | 2 | 3;
export type MultiGridMode = 2 | 3;

export class GridLogic {
  /** Where the multi-row button goes when pressed */
  static nextMulti(current: GridMode, lastMulti: MultiGridMode): MultiGridMode {
    if (current === 1) return lastMulti;   // coming from the single row: back to the last grid used
    return current === 2 ? 3 : 2;          // already in a grid: flip between the two
  }

  static getTitle(mode: GridMode): string {
    switch (mode) {
      case 1:
        return 'Single row view';
      case 2:
        return 'Double row view';
      case 3:
        return 'Compact grid view';
      default:
        return 'Grid view';
    }
  }
}
