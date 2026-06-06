import { useMapSelectionStore } from '../../state/selection-store';
import {
  selectDataError,
  selectDataLoading,
  selectPointCount,
  useDataStore,
} from '../../state/data-store';

export function MapSelectionPanel() {
  const selectedCount = useMapSelectionStore((state) => state.selectedIds.size);
  const hoveredId = useMapSelectionStore((state) => state.hoveredId);
  const clearSelection = useMapSelectionStore((state) => state.clearSelection);
  const pointCount = useDataStore(selectPointCount);
  const isDataLoading = useDataStore(selectDataLoading);
  const dataError = useDataStore(selectDataError);

  return (
    <section
      aria-label="Map Selection"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-nav-border)] bg-[var(--color-surface-container)] p-4"
    >
      <p className="text-sm font-medium text-[var(--color-nav-fg)]">
        Selected points: {selectedCount}
      </p>
      <p className="mt-2 text-xs text-[var(--color-nav-fg)]/75">Loaded records: {pointCount}</p>
      {isDataLoading ? (
        <p className="mt-2 text-xs text-[var(--color-nav-fg)]/75">Data status: Loading...</p>
      ) : null}
      {dataError ? (
        <p className="mt-2 text-xs text-[var(--color-feedback-error)]">Data status: {dataError}</p>
      ) : null}
      <p className="mt-2 text-xs text-[var(--color-nav-fg)]/75">
        Hovered record: {hoveredId ?? 'None'}
      </p>
      <p className="mt-2 text-xs text-[var(--color-nav-fg)]/75">
        Brush: right-click + drag, hold Shift to add.
      </p>
      <button
        type="button"
        onClick={clearSelection}
        disabled={selectedCount === 0}
        className="mt-3 inline-flex rounded-[var(--radius-round-four)] border border-[var(--color-nav-border)] px-3 py-2 text-xs font-semibold text-[var(--color-nav-fg)] transition hover:bg-[var(--color-nav-hover-bg)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear selection
      </button>
    </section>
  );
}
