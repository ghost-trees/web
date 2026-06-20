/**
 * @file selection-counter.tsx
 * @description
 * Compact map overlay showing the number of selected points.
 */

import { useMapSelectionStore } from '../../state/selection-store';
import { CloseButton } from '../common/close-button';

export function MapSelectionCounter() {
  const selectedCount = useMapSelectionStore((state) => state.selectedIds.size);
  const clearSelection = useMapSelectionStore((state) => state.clearSelection);

  if (selectedCount === 0) {
    return null;
  }

  const label = selectedCount === 1 ? '1 point selected' : `${selectedCount} points selected`;

  return (
    <div className="pointer-events-auto" aria-live="polite" aria-label={label}>
      <div className="relative rounded-[var(--radius-round-four)] bg-[var(--color-surface-container-high)] py-2 pl-3 pr-8 shadow-ambient backdrop-blur-[var(--blur-glass)]">
        <CloseButton
          onClick={clearSelection}
          ariaLabel="Clear selection"
          size="compact"
          className="absolute right-1 top-1"
        />
        <p className="text-[11px] uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
          Selected
        </p>
        <p className="text-sm font-semibold tabular-nums text-[var(--color-on-surface)]">
          {selectedCount}
        </p>
      </div>
    </div>
  );
}
