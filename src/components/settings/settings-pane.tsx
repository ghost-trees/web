import { useUiStore } from '../../state/ui-store';
import { PaneHeader } from '../common/pane-header';

export function SettingsPane() {
  const showMapPane = useUiStore((state) => state.showMapPane);

  return (
    <section aria-label="Settings" className="flex h-full min-h-0 flex-col">
      <PaneHeader
        title="Settings"
        description={<>App preferences and map options.</>}
        onClose={showMapPane}
      />
    </section>
  );
}
