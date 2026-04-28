import { useUiStore } from '../../state/ui-store';

export function ChartsPane() {
  const showMapPane = useUiStore((state) => state.showMapPane);

  return (
    <section aria-label="Charts" className="flex h-full min-h-0 flex-col">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Charts</h2>
          <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
            {/* TODO: Update this description. */}
            Chart views.
          </p>
        </div>
        <button
          type="button"
          onClick={showMapPane}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-outline-variant)] px-3 py-1.5 text-xs font-medium text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]"
        >
          <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
            close
          </span>
          Close
        </button>
      </header>
    </section>
  );
}
