/**
 * @file gallery-records.ts
 * @description
 * Curated list of records featured in the Gallery view.
 *
 * Each record pairs a source record number with two Google Street View panoramas
 * (before/after) that the Gallery renders through the Street View Static API. We
 * store panorama IDs (`panoId`) so the before/after captures resolve to distinct,
 * intentional imagery rather than "whatever Google currently shows nearest".
 *
 * Panorama IDs can be deleted when Google refreshes coverage. The `location`
 * ([lng, lat], matching the source GeoJSON) is retained so a dead panorama can be
 * re-resolved to the nearest current panorama later. Populate `panoId` values with
 * real IDs; until then they are left empty and the slider shows its fallback label.
 */

import type { StreetViewShot } from './street-view';

export type GalleryRecord = {
  recordId: string;
  /** Source coordinates as [lng, lat]; used to refresh deleted panorama IDs. */
  location: [number, number];
  before: StreetViewShot;
  after: StreetViewShot;
};

// Hardcoded curated selection of records (sourced from public/data.geojson).
// Fill in `panoId` (and optional heading/pitch/fov) per shot as they are curated.
export const GALLERY_RECORDS: GalleryRecord[] = [
  {
    recordId: 'BA-202302575',
    location: [-84.3581303, 33.6774319],
    before: { panoId: 'njOU8au3LEaE6G6p5pnC9g', heading: 238.28, pitch: -1.24, fov: 75 },
    after: { panoId: 'WmVF_-XLVvHcoiuVNjgKpg', heading: 238.28, pitch: -1.24, fov: 75 },
  },
  {
    recordId: 'BA-202405401',
    location: [-84.4885211, 33.7963412],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202405292',
    location: [-84.49286209, 33.75249711],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202304455',
    location: [-84.3519059, 33.8401648],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202306150',
    location: [-84.5204965, 33.7130199],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202500386',
    location: [-84.438393, 33.8141014],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202402117',
    location: [-84.3902351, 33.8228725],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202304747',
    location: [-84.3661502, 33.8565457],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202406194',
    location: [-84.5366466, 33.7292236],
    before: { panoId: '' },
    after: { panoId: '' },
  },
  {
    recordId: 'BA-202406336',
    location: [-84.3911401, 33.862507],
    before: { panoId: '' },
    after: { panoId: '' },
  },
];
