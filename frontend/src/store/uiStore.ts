import { create } from 'zustand';

/** Local UI state for the game screen (selection, attack flow). Server state stays in gameStore. */
interface UiStoreState {
  selectedTerritory: string | null;
  attackSource: string | null;
  /** Source territory for naval fleet move/attack actions (set when player clicks 'Select as Fleet Source'). */
  navalSource: string | null;
  /** Units to move in fortify phase (set when user clicks Move on source territory). */
  fortifyUnits: number;
  setSelectedTerritory: (id: string | null) => void;
  setAttackSource: (id: string | null) => void;
  setNavalSource: (id: string | null) => void;
  setFortifyUnits: (n: number) => void;
  reset: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  selectedTerritory: null,
  attackSource: null,
  navalSource: null,
  fortifyUnits: 1,
  setSelectedTerritory: (id) => set({ selectedTerritory: id }),
  setAttackSource: (id) => set({ attackSource: id }),
  setNavalSource: (id) => set({ navalSource: id }),
  setFortifyUnits: (n) => set({ fortifyUnits: Math.max(1, Math.floor(n)) }),
  reset: () => set({ selectedTerritory: null, attackSource: null, navalSource: null, fortifyUnits: 1 }),
}));
