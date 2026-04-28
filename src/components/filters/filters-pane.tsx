import { useUiStore } from '../../state/ui-store';
import {
  selectTotalPointCount,
  selectVisiblePointCount,
  useFilterStore,
} from '../../state/filter-store';
import { PaneHeader } from '../common/pane-header';
import { Year } from './year';

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
      <Year />
    </section>
  );
}
