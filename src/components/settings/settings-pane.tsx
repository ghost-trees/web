import { useUiStore } from '../../state/ui-store';
import { PaneHeader } from '../common/pane-header';

export function SettingsPane() {
  const showMapPane = useUiStore((state) => state.showMapPane);
  const scalePointsByFee = useUiStore((state) => state.scalePointsByFee);
  const showAtlantaBoundary = useUiStore((state) => state.showAtlantaBoundary);
  const setScalePointsByFee = useUiStore((state) => state.setScalePointsByFee);
  const setShowAtlantaBoundary = useUiStore((state) => state.setShowAtlantaBoundary);

  return (
    <section aria-label="Settings" className="flex h-full min-h-0 flex-col">
      <PaneHeader
        title="Settings"
        description={<>App preferences and map options.</>}
        onClose={showMapPane}
      />
      <div className="px-5 pb-5 pt-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4">
          <input
            type="checkbox"
            checked={scalePointsByFee}
            onChange={(event) => setScalePointsByFee(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[var(--color-on-surface)]">
              Scale points by fee amount
            </span>
          </span>
        </label>
        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4">
          <input
            type="checkbox"
            checked={showAtlantaBoundary}
            onChange={(event) => setShowAtlantaBoundary(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[var(--color-on-surface)]">
              Show Atlanta city limit outline
            </span>
          </span>
        </label>
      </div>
    </section>
  );
}
