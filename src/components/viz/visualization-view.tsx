import { useMapSelectionStore } from '../../state/selection-store';

export function VisualizationView() {
  const selectedCount = useMapSelectionStore((state) => state.selectedIds.size);

  return (
    <section
      aria-label="Visualization View"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-nav-border)] bg-[var(--color-surface-container)] p-4"
    >
      <h2 className="text-sm font-semibold text-[var(--color-nav-fg)]">Visualization</h2>
      <p className="mt-2 text-xs text-[var(--color-nav-fg)]/75">
        Placeholder ready. Selected points available: {selectedCount}
      </p>
    </section>
  );
}
