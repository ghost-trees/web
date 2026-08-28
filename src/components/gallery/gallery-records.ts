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
 * Google can retire panorama IDs when it refreshes Street View coverage. We
 * still store `location` ([lng, lat], matching the source GeoJSON) so a retired
 * ID can later be replaced with a nearby current panorama.
 *
 * Leave `panoId` empty until a real ID is curated. The slider then shows its
 * fallback label instead of requesting an image.
 *
 * Each shot also accepts an optional `date` (capture month, `YYYY-MM`) recorded for
 * human-readable curation notes only; it is not sent to the Street View Static API.
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
    before: {
      panoId: 'njOU8au3LEaE6G6p5pnC9g',
      heading: 238.28,
      pitch: -1.24,
      fov: 75,
      date: '2019-09',
    },
    after: {
      panoId: 'WmVF_-XLVvHcoiuVNjgKpg',
      heading: 238.28,
      pitch: -1.24,
      fov: 75,
      date: '2025-02',
    },
  },
  {
    recordId: 'BA-202405292',
    location: [-84.49286209, 33.75249711],
    before: {
      panoId: 'n9YbDJ99QXaotaO96BxHuw',
      heading: 187.62,
      pitch: -3.92,
      fov: 75,
      date: '2019-09',
    },
    after: {
      panoId: 'G0_Ea-9VP5V9g4wz7MQFvg',
      heading: 187.62,
      pitch: -3.92,
      fov: 75,
      date: '2025-02',
    },
  },
  {
    recordId: 'BA-202405283',
    location: [-84.4344795, 33.8683287],
    before: {
      panoId: 'AqyFVpEqYNaygDBQkE0tCA',
      heading: 356.84,
      pitch: -2.29,
      fov: 75,
      date: '2022-07',
    },
    after: {
      panoId: 'A0qaEL8A0YkDSEtZtnN8Kw',
      heading: 356.84,
      pitch: -2.29,
      fov: 75,
      date: '2024-06',
    },
  },
  {
    recordId: 'BA-202403784',
    location: [-84.3640199, 33.8578497],
    before: {
      panoId: 'x1KO0OvEU2jFvcKh_f8fcQ',
      heading: 359.95,
      pitch: -4.25,
      fov: 75,
      date: '2024-06',
    },
    after: {
      panoId: 'Ug5r1UjaOBAWhjMBCfAZOQ',
      heading: 359.95,
      pitch: -4.25,
      fov: 75,
      date: '2026-02',
    },
  },
  {
    recordId: 'BA-202401415',
    location: [-84.4602816, 33.7378262],
    before: {
      panoId: 'BAwfFwkGmlhvks_MQWKP2g',
      heading: 71.95,
      pitch: -5.49,
      fov: 75,
      date: '2012-04',
    },
    after: {
      panoId: 'fG2JbJhPZkIeGdXoCw8hFA',
      heading: 71.95,
      pitch: -5.49,
      fov: 75,
      date: '2025-02',
    },
  },
];
