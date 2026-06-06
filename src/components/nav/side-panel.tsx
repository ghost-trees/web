import { SidePanelButton } from './side-panel-button';
// import { MapSelectionPanel } from './map-selection-panel';
import { useUiStore } from '../../state/ui-store';
import { useFilterStore } from '../../state/filter-store';
import { asset } from '../../utils/asset';

export function SidePanel() {
  const mainView = useUiStore((state) => state.mainView);
  const activePane = useUiStore((state) => state.activePane);
  const showMapPane = useUiStore((state) => state.showMapPane);
  const showGalleryView = useUiStore((state) => state.showGalleryView);
  const showAboutView = useUiStore((state) => state.showAboutView);
  const togglePane = useUiStore((state) => state.togglePane);
  const enterTimeline = useUiStore((state) => state.enterTimeline);
  const setTimelineMonthIndex = useUiStore((state) => state.setTimelineMonthIndex);
  const setTimelinePlaying = useUiStore((state) => state.setTimelinePlaying);
  const timelineMonthCount = useFilterStore((state) => state.timelineMonths.length);

  const handleStartTimeline = () => {
    if (timelineMonthCount > 0) {
      setTimelineMonthIndex(0);
    }
    setTimelinePlaying(true);
    enterTimeline();
  };
  const isMapView = mainView === 'map';

  return (
    <div className="flex h-full flex-col gap-6">
      <header>
        <div className="flex items-center gap-2">
          <img src={asset('logo.svg')} alt="Ghost Trees logo" className="h-6 w-6" />
          <h1 className="text-lg font-semibold tracking-[var(--tracking-display-tight)] text-[var(--color-primary)]">
            Ghost Trees
          </h1>
        </div>
      </header>

      <nav aria-label="Primary">
        <ul className="space-y-[var(--spacing-list-item-gap)]">
          <li>
            <SidePanelButton
              label="Map"
              icon="map"
              isActive={isMapView && activePane === 'map'}
              onClick={showMapPane}
            />
          </li>
          <li>
            <SidePanelButton
              label="Filters"
              icon="filter_alt"
              isActive={isMapView && activePane === 'filters'}
              onClick={() => togglePane('filters')}
              aria-pressed={isMapView && activePane === 'filters'}
            />
          </li>
          <li>
            <SidePanelButton
              label="Charts"
              icon="bar_chart"
              isActive={isMapView && activePane === 'charts'}
              onClick={() => togglePane('charts')}
              aria-pressed={isMapView && activePane === 'charts'}
            />
          </li>
          <li>
            <SidePanelButton
              label="Gallery"
              icon="photo_library"
              isActive={mainView === 'gallery'}
              onClick={showGalleryView}
            />
          </li>
          <li>
            <SidePanelButton
              label="Timeline"
              icon="movie"
              onClick={handleStartTimeline}
              disabled={timelineMonthCount === 0}
            />
          </li>
          <li>
            <SidePanelButton
              label="Settings"
              icon="settings"
              isActive={isMapView && activePane === 'settings'}
              onClick={() => togglePane('settings')}
              aria-pressed={isMapView && activePane === 'settings'}
            />
          </li>
          <li>
            <SidePanelButton
              label="About"
              icon="info"
              isActive={mainView === 'about'}
              onClick={showAboutView}
            />
          </li>
        </ul>
      </nav>

      {/* <MapSelectionPanel /> */}
    </div>
  );
}
