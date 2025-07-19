// Pure CommandBar logic - no UI concerns
export interface CommandBarActions {
  onLaunch: () => void;
  onEdit: () => void;
}

export interface CommandBarState {
  canLaunch: boolean;
  editEnabled: boolean;
}

export class CommandBarLogic {
  static getButtonLabel(action: 'launch' | 'edit', state: CommandBarState): string {
    switch (action) {
      case 'launch':
        return state.canLaunch ? 'Launch Game' : 'Select Game';
      case 'edit':
        return state.editEnabled ? 'Edit Game' : 'Edit Disabled';
      default:
        return '';
    }
  }

  static isButtonEnabled(action: 'launch' | 'edit', state: CommandBarState): boolean {
    switch (action) {
      case 'launch':
        return state.canLaunch;
      case 'edit':
        return state.editEnabled;
      default:
        return false;
    }
  }

  static getButtonIcon(action: 'launch' | 'edit'): string {
    switch (action) {
      case 'launch':
        return '▶';
      case 'edit':
        return '✎';
      default:
        return '';
    }
  }

  static handleAction(action: 'launch' | 'edit', actions: CommandBarActions, state: CommandBarState): void {
    if (!this.isButtonEnabled(action, state)) return;

    switch (action) {
      case 'launch':
        actions.onLaunch();
        break;
      case 'edit':
        actions.onEdit();
        break;
    }
  }
}
