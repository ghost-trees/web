/**
 * @file street-view.ts
 * @description
 * Builds Google Street View Static API image URLs for the Gallery's before/after
 * slider.
 *
 * Each URL targets a specific panorama via its `pano` ID (curated in
 * `gallery-records.ts`) so before/after captures resolve to distinct imagery.
 * `return_error_code=true` makes missing imagery return an HTTP error instead of
 * the generic gray "no imagery" placeholder, which lets the slider's `onError`
 * fallback take over cleanly.
 */

const STREET_VIEW_ENDPOINT = 'https://maps.googleapis.com/maps/api/streetview';
const DEFAULT_SIZE = '800x600';

export type StreetViewShot = {
  panoId: string;
  heading?: number;
  pitch?: number;
  fov?: number;
  /** Google Street View capture month (YYYY-MM). Curation note only; unused by the Static API. */
  date?: string;
};

type BuildStreetViewUrlOptions = StreetViewShot & {
  apiKey: string | undefined;
  size?: string;
};

/**
 * Builds a Street View Static API URL for a single panorama.
 *
 * Returns `null` when the API key or panorama ID is missing so callers can render
 * the slider fallback instead of issuing a request that is guaranteed to fail.
 */
export function buildStreetViewUrl({
  panoId,
  heading,
  pitch,
  fov,
  apiKey,
  size = DEFAULT_SIZE,
}: BuildStreetViewUrlOptions): string | null {
  if (!apiKey || !panoId) {
    return null;
  }

  const params = new URLSearchParams({
    pano: panoId,
    size,
    key: apiKey,
    return_error_code: 'true',
  });

  if (heading !== undefined) {
    params.set('heading', String(heading));
  }
  if (pitch !== undefined) {
    params.set('pitch', String(pitch));
  }
  if (fov !== undefined) {
    params.set('fov', String(fov));
  }

  return `${STREET_VIEW_ENDPOINT}?${params.toString()}`;
}
