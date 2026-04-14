import { SidePanelButton } from './side-panel-button';
import { useMapSelectionStore } from '../../state/selection-store';
import {
  selectDataError,
  selectDataLoading,
  selectPointCount,
  useDataStore,
} from '../../state/data-store';
import { asset } from '../../utils/asset';

const panelActions = [
  { label: 'Map', icon: 'map', isActive: true },
  { label: 'Filters', icon: 'filter_alt', isActive: false },
] as const;

export function SidePanel() {
  const selectedCount = useMapSelectionStore((state) => state.selectedIds.size);
  const hoveredId = useMapSelectionStore((state) => state.hoveredId);
  const clearSelection = useMapSelectionStore((state) => state.clearSelection);
  const pointCount = useDataStore(selectPointCount);
  const isDataLoading = useDataStore(selectDataLoading);
  const dataError = useDataStore(selectDataError);

  return (
    <div className="flex h-full flex-col gap-6">
      <header>
        <div className="flex items-center gap-2">
          <img src={asset('logo.svg')} alt="Ghost Trees logo" className="h-6 w-6" />
          <h1 className="text-lg font-semibold tracking-[var(--tracking-display-tight)] text-[var(--color-primary)]">
            Ghost Trees
          </h1>
        </div>
      </header>

      <nav aria-label="Primary">
        <ul className="space-y-[var(--spacing-list-item-gap)]">
          {panelActions.map((action) => (
            <li key={action.label}>
              <SidePanelButton label={action.label} icon={action.icon} isActive={action.isActive} />
            </li>
          ))}
        </ul>
      </nav>

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
        {dataError ? <p className="mt-2 text-xs text-red-300">Data status: {dataError}</p> : null}
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
    </div>
  );
}
