import './styles/index.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createRoot } from 'react-dom/client';
import { Shell } from './layout/shell';
import { MapView } from './components/map/view';
import { SidePanel } from './components/nav/side-panel';
import { FiltersPane } from './components/filters/pane';
import { SettingsPane } from './components/settings/settings-pane';
import {
  AboutView,
  ChartsPane,
  GalleryView,
  scheduleDeferredSurfacePrefetch,
} from './deferred-surfaces';
import { useDataStore } from './state/data-store';
import { applyUrlToStores, startUrlSync } from './state/url-state';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

applyUrlToStores();
startUrlSync();

// Warm the deferred surfaces only after the map's point data has loaded, so the prefetch
// never competes with the critical map GeoJSON/tiles. If the data never loads, we stay out
// of the way and let retries proceed. See docs/frontend-loading.md.
if (useDataStore.getState().hasLoaded) {
  scheduleDeferredSurfacePrefetch();
} else {
  const unsubscribe = useDataStore.subscribe((state, previousState) => {
    if (!previousState.hasLoaded && state.hasLoaded) {
      unsubscribe();
      scheduleDeferredSurfacePrefetch();
    }
  });
}

createRoot(rootElement).render(
  <Shell
    sidebar={<SidePanel />}
    filtersPane={<FiltersPane />}
    chartsPane={<ChartsPane />}
    settingsPane={<SettingsPane />}
    mapContent={<MapView />}
    galleryContent={<GalleryView />}
    aboutContent={<AboutView />}
  />,
);
