/**
 * @file gallery-records.ts
 * @description
 * Curated list of records featured in the Gallery view.
 *
 * Image paths follow a fixed convention so that real assets can be dropped into
 * `public/gallery/` later with no code changes:
 *   - `gallery/{recordId}-before.jpg`
 *   - `gallery/{recordId}-after.jpg`
 */

import { asset } from '../../utils/asset';

export type GalleryRecord = {
  recordId: string;
  beforeImage: string;
  afterImage: string;
};

// Hardcoded curated selection of record numbers (sourced from public/data.geojson).
const FEATURED_RECORD_IDS: string[] = [
  'BA-202302575',
  'BA-202405401',
  'BA-202405292',
  'BA-202304455',
  'BA-202306150',
  'BA-202500386',
  'BA-202402117',
  'BA-202304747',
  'BA-202406194',
  'BA-202406336',
];

export const GALLERY_RECORDS: GalleryRecord[] = FEATURED_RECORD_IDS.map((recordId) => ({
  recordId,
  beforeImage: asset(`gallery/${recordId}-before.jpg`),
  afterImage: asset(`gallery/${recordId}-after.jpg`),
}));
