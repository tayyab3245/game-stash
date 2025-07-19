// Pure grid control logic - no UI concerns
export type GridMode = 1 | 2;

export class GridLogic {
  static getNextMode(currentMode: GridMode): GridMode {
    return currentMode === 1 ? 2 : 1;
  }

  static getTitle(mode: GridMode): string {
    switch (mode) {
      case 1:
        return 'Single row view';
      case 2:
        return 'Double row view';
      default:
        return 'Grid view';
    }
  }

  static getDescription(mode: GridMode): string {
    switch (mode) {
      case 1:
        return 'Single';
      case 2:
        return 'Double';
      default:
        return 'Grid';
    }
  }

  static getGridConfig(mode: GridMode) {
    const configs = {
      1: { count: 1, spacing: 0, padding: 4 },
      2: { count: 2, spacing: 6, padding: 4 },
    };
    return configs[mode];
  }

  static calculateBoxSize(mode: GridMode, containerSize: number): number {
    const config = this.getGridConfig(mode);
    const totalSpacing = config.spacing * (config.count - 1);
    return (containerSize - totalSpacing - config.padding * 2) / config.count;
  }

  static calculateRadius(mode: GridMode, boxSize: number): number {
    return mode === 2 ? boxSize * 0.15 : boxSize * 0.25;
  }
}
