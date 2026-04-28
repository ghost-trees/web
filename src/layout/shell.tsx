import type { ReactNode } from 'react';
import { useUiStore } from '../state/ui-store';

type ShellProps = {
  sidebar: ReactNode;
  filtersPane?: ReactNode;
  chartsPane?: ReactNode;
  settingsPane?: ReactNode;
  content: ReactNode;
};

export function Shell({ sidebar, filtersPane, chartsPane, settingsPane, content }: ShellProps) {
  const activePane = useUiStore((state) => state.activePane);
  const isAuxiliaryPaneOpen = activePane !== 'map';
  const auxiliaryPane =
    activePane === 'filters'
      ? filtersPane
      : activePane === 'charts'
        ? chartsPane
        : activePane === 'settings'
          ? settingsPane
          : null;

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]">
      <aside className="w-72 shrink-0 bg-[var(--color-surface-container-high)] p-4">
        {sidebar}
      </aside>
      {filtersPane || chartsPane || settingsPane ? (
        <section
          aria-label="Inline detail panel"
          className={`min-h-0 shrink-0 overflow-hidden bg-[var(--color-surface-container-low)] transition-[width,padding,border-color] duration-200 ease-out ${
            isAuxiliaryPaneOpen
              ? 'w-80 border-r border-[var(--color-outline-variant)] p-4'
              : 'w-0 border-r border-transparent p-0'
          }`}
        >
          <div
            className={`h-full min-h-0 transition-opacity duration-150 ${
              isAuxiliaryPaneOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {auxiliaryPane}
          </div>
        </section>
      ) : null}
      <main className="min-w-0 flex min-h-0 flex-1 flex-col bg-[var(--color-surface-container-lowest)] p-0">
        {content}
      </main>
    </div>
  );
}
