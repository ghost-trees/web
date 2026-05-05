import { useMemo } from 'react';
import { UNKNOWN_TREE_TYPE } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { formatTreeTypeLabel } from '../../utils/tree-type';

export function Tree() {
  const allPoints = useFilterStore((state) => state.allPoints);
  const availableTreeTypes = useFilterStore((state) => state.availableTreeTypes);
  const enabledTreeTypes = useFilterStore((state) => state.enabledTreeTypes);
  const setTreeTypeEnabled = useFilterStore((state) => state.setTreeTypeEnabled);
  const setAllTreeTypesEnabled = useFilterStore((state) => state.setAllTreeTypesEnabled);

  const enabledTreeTypeSet = useMemo(() => new Set(enabledTreeTypes), [enabledTreeTypes]);
  const treeTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const point of allPoints) {
      const uniqueTreeTypes = new Set(point.treeTypes);
      for (const treeType of uniqueTreeTypes) {
        counts.set(treeType, (counts.get(treeType) ?? 0) + 1);
      }
    }

    return counts;
  }, [allPoints]);
  const sortedTreeTypes = useMemo(
    () =>
      [...availableTreeTypes].sort((leftTreeType, rightTreeType) => {
        if (leftTreeType === UNKNOWN_TREE_TYPE) {
          return 1;
        }
        if (rightTreeType === UNKNOWN_TREE_TYPE) {
          return -1;
        }
        return leftTreeType.localeCompare(rightTreeType);
      }),
    [availableTreeTypes],
  );
  const totalOptions = sortedTreeTypes.length;
  const enabledOptions = enabledTreeTypes.length;
  const summaryLabel =
    totalOptions === 0
      ? 'No tree types available'
      : `${enabledOptions} of ${totalOptions} selected`;

  return (
    <div className="mt-3 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4">
      <p className="text-xs uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
        Tree Type
      </p>
      <details className="mt-3 group">
        <summary className="cursor-pointer list-none rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)]">
          <span className="flex items-center justify-between gap-3">
            <span>{summaryLabel}</span>
            <span className="text-xs text-[var(--color-on-surface-variant)] group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs text-[var(--color-on-surface-variant)] group-open:inline">
              Close
            </span>
          </span>
        </summary>
        <div className="mt-2 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
          {totalOptions === 0 ? (
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Tree types will appear here once records are loaded.
            </p>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAllTreeTypesEnabled(true);
                  }}
                  className="rounded border border-[var(--color-outline-variant)] px-2 py-1 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAllTreeTypesEnabled(false);
                  }}
                  className="rounded border border-[var(--color-outline-variant)] px-2 py-1 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {sortedTreeTypes.map((treeType) => (
                  <label
                    key={treeType}
                    className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-on-surface)]"
                  >
                    <input
                      type="checkbox"
                      style={{ accentColor: 'var(--color-primary)' }}
                      checked={enabledTreeTypeSet.has(treeType)}
                      onChange={(event) => {
                        setTreeTypeEnabled(treeType, event.target.checked);
                      }}
                    />
                    {formatTreeTypeLabel(treeType)} ({treeTypeCounts.get(treeType) ?? 0})
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
