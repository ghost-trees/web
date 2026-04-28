import { useUiStore } from '../../state/ui-store';
import { PaneHeader } from '../common/pane-header';

export function ChartsPane() {
  const showMapPane = useUiStore((state) => state.showMapPane);

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
    </section>
  );
}
