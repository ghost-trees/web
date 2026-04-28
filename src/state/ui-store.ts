import { create } from 'zustand';
import type { ChartId } from '../components/charts/chart-definitions';

export type UiPane = 'map' | 'filters' | 'charts' | 'settings';

type UiStoreState = {
  activePane: UiPane;
  selectedChart: ChartId;
  setActivePane: (pane: UiPane) => void;
  setSelectedChart: (chartId: ChartId) => void;
  togglePane: (pane: Exclude<UiPane, 'map'>) => void;
  showMapPane: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  activePane: 'map',
  selectedChart: 'records-by-month',
  setActivePane: (pane) => set({ activePane: pane }),
  setSelectedChart: (chartId) => set({ selectedChart: chartId }),
  togglePane: (pane) =>
    set((state) => ({
      activePane: state.activePane === pane ? 'map' : pane,
    })),
  showMapPane: () => set({ activePane: 'map' }),
}));
