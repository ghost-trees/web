import { useUiStore } from '../../state/ui-store';
import { PaneHeader } from '../common/pane-header';
import { ChartSelector } from './selector';
import { ChartViewport } from './viewport';

export function ChartsPane() {
  const showMapPane = useUiStore((state) => state.showMapPane);
  const selectedChart = useUiStore((state) => state.selectedChart);
  const setSelectedChart = useUiStore((state) => state.setSelectedChart);

  return (
    <section aria-label="Charts" className="flex h-full min-h-0 flex-col">
      <PaneHeader
        title="Charts"
        description=""
        onClose={showMapPane}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-2 pr-1">
        <ChartSelector value={selectedChart} onChange={setSelectedChart} />
        <ChartViewport chartId={selectedChart} />
      </div>
    </section>
  );
}
