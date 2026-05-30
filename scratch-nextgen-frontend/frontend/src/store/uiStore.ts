import { create } from 'zustand';

type UiState = {
  isCodeBuddyOpen: boolean;
  selectedBlockType?: string;
  setCodeBuddyOpen: (open: boolean) => void;
  setSelectedBlockType: (blockType?: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isCodeBuddyOpen: true,
  selectedBlockType: undefined,
  setCodeBuddyOpen: (open) => set({ isCodeBuddyOpen: open }),
  setSelectedBlockType: (blockType) => set({ selectedBlockType: blockType }),
}));
