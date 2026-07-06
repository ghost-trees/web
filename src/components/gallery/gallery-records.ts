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
  'BA-202506279',
  'BA-202506364',
  'BA-202506357',
  'BA-202506355',
  'BA-202506344',
  'BA-202506329',
  'BA-202506310',
  'BA-202506307',
  'BA-202506303',
  'BA-202506300',
];

export const GALLERY_RECORDS: GalleryRecord[] = FEATURED_RECORD_IDS.map((recordId) => ({
  recordId,
  beforeImage: asset(`gallery/${recordId}-before.jpg`),
  afterImage: asset(`gallery/${recordId}-after.jpg`),
}));
