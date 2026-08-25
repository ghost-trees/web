import { lazy } from 'react';

// Hybrid loading for non-landing surfaces.
//
// Home is the landing view and renders a lightweight deck.gl canvas, so Maps (MapLibre +
// the deck.gl MapboxOverlay), Charts (ECharts), and Gallery are split into their own async
// chunks and loaded lazily. That keeps the map engine and the charting library off the
// first-load critical path. To avoid a visible Suspense wait the first time a user opens one
// of these surfaces, we ALSO warm the same chunks in the background once Home's point data
// has loaded (see scheduleDeferredSurfacePrefetch, invoked from main.tsx).
//
// The lazy wrappers and the prefetch below intentionally reference the exact same dynamic
// import specifiers. Rollup dedupes by resolved module id, so both share one chunk and the
// browser never downloads a surface twice. See docs/frontend-loading.md.
export const MapsView = lazy(() =>
  import('./components/maps/view').then((module) => ({ default: module.MapsView })),
);

export const ChartsPane = lazy(() =>
  import('./components/charts/pane').then((module) => ({ default: module.ChartsPane })),
);

export const GalleryView = lazy(() =>
  import('./components/gallery/view').then((module) => ({ default: module.GalleryView })),
);

// Minimal shape of the (optional, non-standard) Network Information API. Typed locally so we
// do not need an extra @types dependency; every field is best-effort and may be absent.
type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
};

/**
 * Whether to skip the background warmup of deferred surfaces.
 *
 * Why: on constrained links the prefetch would compete with map tiles and any remaining
 * network work, hurting the experience it is meant to improve. We therefore stay strictly
 * on-demand when the user has opted into Save-Data, or when the browser reports a 2g /
 * slow-2g effective connection.
 *
 * What still works when skipped: opening a surface continues to load it via React.lazy +
 * Suspense, exactly as if no prefetch existed.
 *
 * The Network Information API is best-effort and not available in every browser; when
 * `navigator.connection` is absent we do NOT skip (default to warming).
 */
function shouldSkipIdlePrefetch(): boolean {
  const connection = (navigator as NavigatorWithConnection).connection;
  if (!connection) {
    return false;
  }
  if (connection.saveData) {
    return true;
  }
  return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
}

/**
 * Kick off the deferred-surface chunk downloads. Safe to call more than once: repeated
 * dynamic imports of an already-loaded module resolve from cache without re-fetching.
 */
export function prefetchDeferredSurfaces(): void {
  void import('./components/maps/view');
  void import('./components/charts/pane');
  void import('./components/gallery/view');
}

/**
 * Schedule the warmup during browser idle time (with a timeout so it still runs on a busy
 * main thread), unless the connection is constrained. This is a best-effort optimization,
 * not a correctness requirement.
 */
export function scheduleDeferredSurfacePrefetch(): void {
  if (shouldSkipIdlePrefetch()) {
    return;
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => prefetchDeferredSurfaces(), { timeout: 3000 });
  } else {
    window.setTimeout(() => prefetchDeferredSurfaces(), 3000);
  }
}
