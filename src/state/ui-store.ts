import { create } from 'zustand';

type UiStoreState = {
  isFiltersOpen: boolean;
  openFilters: () => void;
  closeFilters: () => void;
  toggleFilters: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  isFiltersOpen: false,
  openFilters: () => set({ isFiltersOpen: true }),
  closeFilters: () => set({ isFiltersOpen: false }),
  toggleFilters: () => set((state) => ({ isFiltersOpen: !state.isFiltersOpen })),
}));
