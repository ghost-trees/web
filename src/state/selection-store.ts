import { create } from 'zustand';

type MapSelectionState = {
  selectedIds: Set<string>;
  hoveredId: string | null;
  replaceSelection: (ids: Iterable<string>) => void;
  addSelection: (ids: Iterable<string>) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
};

function toSet(ids: Iterable<string>): Set<string> {
  return new Set(ids);
}

export const useMapSelectionStore = create<MapSelectionState>((set) => ({
  selectedIds: new Set<string>(),
  hoveredId: null,
  replaceSelection: (ids) => {
    set({ selectedIds: toSet(ids) });
  },
  addSelection: (ids) => {
    set((state) => {
      const nextSelectedIds = new Set(state.selectedIds);
      for (const id of ids) {
        nextSelectedIds.add(id);
      }

      return { selectedIds: nextSelectedIds };
    });
  },
  toggleSelection: (id) => {
    set((state) => {
      const nextSelectedIds = new Set(state.selectedIds);
      if (nextSelectedIds.has(id)) {
        nextSelectedIds.delete(id);
      } else {
        nextSelectedIds.add(id);
      }

      return { selectedIds: nextSelectedIds };
    });
  },
  clearSelection: () => {
    set({ selectedIds: new Set<string>() });
  },
  setHovered: (id) => {
    set({ hoveredId: id });
  },
}));
