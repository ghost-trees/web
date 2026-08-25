import './styles/index.css';
import { createRoot } from 'react-dom/client';
import { Shell } from './layout/shell';
import { HomeView } from './components/home/view';
import { TopNav } from './components/nav/top-nav';
import { GalleryView, MapsView, scheduleDeferredSurfacePrefetch } from './deferred-surfaces';
import { useDataStore } from './state/data-store';
import { applyUrlToStores, startUrlSync } from './state/url-state';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

applyUrlToStores();
startUrlSync();

// Warm the deferred surfaces only after the landing view's point data has loaded, so the
// prefetch never competes with the critical GeoJSON/tiles. If the data never loads, we stay
// out of the way and let retries proceed. See docs/frontend-loading.md.
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
    topNav={<TopNav />}
    homeContent={<HomeView />}
    mapsContent={<MapsView />}
    galleryContent={<GalleryView />}
  />,
);
