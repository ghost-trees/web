import { useMemo } from 'react';
import { FilterMultiselect } from '../common/filter-multiselect';
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

  return (
    <FilterMultiselect
      label="Tree Type"
      options={sortedTreeTypes}
      enabledOptions={enabledTreeTypeSet}
      optionCounts={treeTypeCounts}
      formatOptionLabel={formatTreeTypeLabel}
      emptyMessage="Tree types will appear here once records are loaded."
      onOptionEnabledChange={setTreeTypeEnabled}
      onSetAllEnabled={setAllTreeTypesEnabled}
    />
  );
}
