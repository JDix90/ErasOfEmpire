import { create } from 'zustand';

/** Local UI state for the game screen (selection, attack flow). Server state stays in gameStore. */
interface UiStoreState {
  selectedTerritory: string | null;
  attackSource: string | null;
  setSelectedTerritory: (id: string | null) => void;
  setAttackSource: (id: string | null) => void;
  reset: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  selectedTerritory: null,
  attackSource: null,
  setSelectedTerritory: (id) => set({ selectedTerritory: id }),
  setAttackSource: (id) => set({ attackSource: id }),
  reset: () => set({ selectedTerritory: null, attackSource: null }),
}));
