/**
 * @file view.tsx
 * @description
 * Explore surface: the interactive map plus one of the Filters / Charts / Map Settings panels.
 *
 * The panel is a single element in both layouts. From `md` up it is a persistent left column;
 * below `md` the same element becomes a bottom sheet over a full-bleed map, so the panes are
 * only ever mounted once (which matters most for the chart canvases).
 */

import { Suspense } from 'react';
import { useUiStore, type MapsSubTab } from '../../state/ui-store';
import { ChartsPane } from '../../deferred-surfaces';
import { CloseButton } from '../common/close-button';
import { FiltersPane } from '../filters/pane';
import { MapView } from '../map/view';
import { SettingsPane } from '../settings/settings-pane';

const SUB_TABS: { id: MapsSubTab; label: string; shortLabel: string; icon: string }[] = [
  { id: 'filters', label: 'Filters', shortLabel: 'Filters', icon: 'filter_alt' },
  { id: 'charts', label: 'Charts', shortLabel: 'Charts', icon: 'bar_chart' },
  { id: 'settings', label: 'Map Settings', shortLabel: 'Settings', icon: 'settings' },
];

const SUB_TAB_BUTTON_BASE =
  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]';
const SUB_TAB_ACTIVE = 'bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-fg)]';

function PaneLoadingFallback() {
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center p-6">
      <span className="text-xs text-[var(--color-on-surface-variant)]">Loading charts...</span>
    </div>
  );
}

export function MapsView() {
  const mapsSubTab = useUiStore((state) => state.mapsSubTab);
  const mapsPanelOpen = useUiStore((state) => state.mapsPanelOpen);
  const setMapsSubTab = useUiStore((state) => state.setMapsSubTab);
  const setMapsPanelOpen = useUiStore((state) => state.setMapsPanelOpen);

  // Below `md` the strip doubles as the sheet's open/close control, so tapping the tab that is
  // already showing dismisses it. From `md` up the panel is persistent and `mapsPanelOpen` is
  // ignored, which makes the same handler a plain tab switch there.
  const selectSubTab = (tab: MapsSubTab) => {
    if (mapsPanelOpen && tab === mapsSubTab) {
      setMapsPanelOpen(false);
      return;
    }
    setMapsSubTab(tab);
    setMapsPanelOpen(true);
  };

  const activePane =
    mapsSubTab === 'charts' ? (
      <Suspense fallback={<PaneLoadingFallback />}>
        <ChartsPane />
      </Suspense>
    ) : mapsSubTab === 'settings' ? (
      <SettingsPane />
    ) : (
      <FiltersPane />
    );

  return (
    <section aria-label="Maps" className="relative flex h-full min-h-0 w-full">
      {mapsPanelOpen ? (
        <button
          type="button"
          aria-label="Close panel"
          onClick={() => setMapsPanelOpen(false)}
          className="absolute inset-0 z-30 bg-[color-mix(in_oklab,var(--color-surface)_65%,transparent)] md:hidden"
        />
      ) : null}

      <div
        className={`absolute inset-x-0 bottom-[var(--maps-tool-strip-height)] z-40 h-[52dvh] flex-col rounded-t-[var(--radius-round-four)] bg-[var(--color-surface-container-low)] shadow-ambient md:static md:z-auto md:h-full md:w-80 md:shrink-0 md:rounded-none md:border-r md:border-[var(--color-outline-variant)] md:shadow-none ${
          mapsPanelOpen ? 'flex' : 'hidden'
        } md:flex`}
      >
        <div className="flex items-center gap-2 px-3 pt-3 md:px-4">
          <div role="group" aria-label="Map panels" className="hidden gap-1 md:flex">
            {SUB_TABS.map((tab) => {
              const isActive = tab.id === mapsSubTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectSubTab(tab.id)}
                  className={`rounded-[var(--radius-round-four)] px-3 py-2 text-xs font-medium ${SUB_TAB_BUTTON_BASE} ${
                    isActive
                      ? SUB_TAB_ACTIVE
                      : 'text-[var(--color-nav-fg)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-fg)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <CloseButton
            ariaLabel="Close panel"
            size="regular"
            onClick={() => setMapsPanelOpen(false)}
            className="ml-auto md:hidden"
          />
        </div>
        {/* Grid so the pane fills the remaining height without depending on a percentage. */}
        <div className="grid min-h-0 flex-1 overflow-hidden p-4">{activePane}</div>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1">
        <MapView />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 z-40 flex h-[var(--maps-tool-strip-height)] gap-1 bg-[var(--color-surface-container-high)] px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden"
        role="group"
        aria-label="Map panels"
      >
        {SUB_TABS.map((tab) => {
          const isActive = mapsPanelOpen && tab.id === mapsSubTab;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectSubTab(tab.id)}
              className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-round-four)] px-2 py-1 text-[11px] font-medium ${SUB_TAB_BUTTON_BASE} ${
                isActive ? SUB_TAB_ACTIVE : 'text-[var(--color-nav-fg)]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px] leading-none"
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              {tab.shortLabel}
            </button>
          );
        })}
      </div>
    </section>
  );
}
