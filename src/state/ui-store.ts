import { create } from 'zustand';

export type UiPane = 'map' | 'filters' | 'charts' | 'settings';

type UiStoreState = {
  activePane: UiPane;
  setActivePane: (pane: UiPane) => void;
  togglePane: (pane: Exclude<UiPane, 'map'>) => void;
  showMapPane: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  activePane: 'map',
  setActivePane: (pane) => set({ activePane: pane }),
  togglePane: (pane) =>
    set((state) => ({
      activePane: state.activePane === pane ? 'map' : pane,
    })),
  showMapPane: () => set({ activePane: 'map' }),
}));
