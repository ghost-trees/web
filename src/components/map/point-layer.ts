/**
 * @file point-layer.ts
 * @description
 * Deck.gl point layer factory for rendering selectable map points.
 */

import { ScatterplotLayer } from '@deck.gl/layers';
import type { MapPoint } from '../../state/data-store';
import { POINT_LAYER_ID } from './constants';

export function createPointLayer(points: MapPoint[], selectedIds: Set<string>) {
  return new ScatterplotLayer<MapPoint>({
    id: POINT_LAYER_ID,
    data: points,
    pickable: true,
    radiusUnits: 'pixels',
    radiusMinPixels: 3,
    radiusMaxPixels: 18,
    getPosition: (point) => point.coordinates,
    getRadius: (point) => (selectedIds.has(point.id) ? 9 : 4),
    getFillColor: (point) =>
      selectedIds.has(point.id) ? [164, 211, 147, 255] : [164, 211, 147, 220],
    stroked: false,
  });
}
