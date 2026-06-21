import { useUiStore } from '../../state/ui-store';
import {
  selectTotalPointCount,
  selectVisiblePointCount,
  useFilterStore,
} from '../../state/filter-store';
import { PaneHeader } from '../common/pane-header';
import { Tree } from './tree';
import { Zip } from './zip';
import { Time } from './time';

export function FiltersPane() {
  const showMapPane = useUiStore((state) => state.showMapPane);
  const visiblePointCount = useFilterStore(selectVisiblePointCount);
  const totalPointCount = useFilterStore(selectTotalPointCount);

  return (
    <section aria-label="Filters" className="flex h-full min-h-0 flex-col">
      <PaneHeader
        title="Filters"
        description={
          <>
            Filtering {visiblePointCount} of {totalPointCount} points
          </>
        }
        onClose={showMapPane}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-2 pr-1">
        <Time />
        <Tree />
        <Zip />
      </div>
    </section>
  );
}
