import type { ReactNode } from 'react';
import { useUiStore } from '../state/ui-store';
import { TimelineOverlay } from '../components/timeline/overlay';

type ShellProps = {
  sidebar: ReactNode;
  filtersPane?: ReactNode;
  chartsPane?: ReactNode;
  settingsPane?: ReactNode;
  mapContent: ReactNode;
  galleryContent?: ReactNode;
  aboutContent?: ReactNode;
};

export function Shell({
  sidebar,
  filtersPane,
  chartsPane,
  settingsPane,
  mapContent,
  galleryContent,
  aboutContent,
}: ShellProps) {
  const mainView = useUiStore((state) => state.mainView);
  const activePane = useUiStore((state) => state.activePane);
  const appMode = useUiStore((state) => state.appMode);
  const isTimelineMode = appMode === 'timeline';
  const isMapMainView = mainView === 'map';
  const isAuxiliaryPaneOpen = isMapMainView && activePane !== 'map';
  const auxiliaryPane =
    activePane === 'filters'
      ? filtersPane
      : activePane === 'charts'
        ? chartsPane
        : activePane === 'settings'
          ? settingsPane
          : null;

  return (
    <div className="relative flex h-screen bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]">
      {!isTimelineMode ? (
        <aside className="w-72 shrink-0 bg-[var(--color-surface-container-high)] p-4">
          {sidebar}
        </aside>
      ) : null}
      {!isTimelineMode && isMapMainView && (filtersPane || chartsPane || settingsPane) ? (
        <section
          aria-label="Inline detail panel"
          className={`min-h-0 shrink-0 overflow-hidden bg-[var(--color-surface-container-low)] ${
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
      <main className="relative min-w-0 flex min-h-0 flex-1 bg-[var(--color-surface-container-lowest)] p-0">
        <div
          className={`absolute inset-0 min-h-0 min-w-0 ${
            mainView === 'map' ? 'flex' : 'pointer-events-none hidden'
          }`}
          aria-hidden={mainView !== 'map'}
        >
          {mapContent}
        </div>
        <div
          className={`absolute inset-0 min-h-0 min-w-0 ${
            mainView === 'gallery' ? 'flex' : 'pointer-events-none hidden'
          }`}
          aria-hidden={mainView !== 'gallery'}
        >
          {galleryContent}
        </div>
        <div
          className={`absolute inset-0 min-h-0 min-w-0 ${
            mainView === 'about' ? 'flex' : 'pointer-events-none hidden'
          }`}
          aria-hidden={mainView !== 'about'}
        >
          {aboutContent}
        </div>
      </main>
      <TimelineOverlay />
    </div>
  );
}
