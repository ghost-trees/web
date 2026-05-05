import { useUiStore } from '../../state/ui-store';
import { PaneHeader } from '../common/pane-header';
import { ChartSelector } from './chart-selector';
import { ChartViewport } from './chart-viewport';

export function ChartsPane() {
  const showMapPane = useUiStore((state) => state.showMapPane);
  const selectedChart = useUiStore((state) => state.selectedChart);
  const setSelectedChart = useUiStore((state) => state.setSelectedChart);

  return (
    <section aria-label="Charts" className="flex h-full min-h-0 flex-col">
      <PaneHeader
        title="Charts"
        description={
          <>
            {/* TODO: Update this description. */}
            Chart views.
          </>
        }
        onClose={showMapPane}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-2 pr-1">
        <ChartSelector value={selectedChart} onChange={setSelectedChart} />
        <ChartViewport chartId={selectedChart} />
      </div>
    </section>
  );
}
