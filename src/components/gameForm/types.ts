// Shared types for game form components

export interface GameForm {
  title: string;
  coverFile: File | null;
  romPath: string;
  emuPath: string;
}

export interface GameFormModalProps {
  mode: "add" | "edit";
  initial?: Partial<GameForm> & { coverUrl?: string };
  onSubmit: (data: GameForm) => void;
  onDismiss: () => void;
  onDelete?: () => void;
}
