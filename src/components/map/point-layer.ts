/**
 * @file point-layer.ts
 * @description
 * Deck.gl point layer factory for rendering selectable map points.
 */

import { ScatterplotLayer } from '@deck.gl/layers';
import type { MapPoint } from '../../state/data-store';
import {
  POINT_FILL_COLOR_DEFAULT,
  POINT_FILL_COLOR_SELECTED,
  POINT_LAYER_ID,
  POINT_LINE_COLOR_DEFAULT,
  POINT_LINE_COLOR_SELECTED,
  POINT_LINE_WIDTH_DEFAULT,
  POINT_LINE_WIDTH_SELECTED,
  POINT_RADIUS_DEFAULT,
  POINT_RADIUS_SELECTED,
} from './constants';

export function createPointLayer(points: MapPoint[], selectedIds: Set<string>) {
  return new ScatterplotLayer<MapPoint>({
    id: POINT_LAYER_ID,
    data: points,
    pickable: true,
    radiusUnits: 'pixels',
    radiusMinPixels: 3,
    radiusMaxPixels: 18,
    getPosition: (point) => point.coordinates,
    getRadius: (point) =>
      selectedIds.has(point.id) ? POINT_RADIUS_SELECTED : POINT_RADIUS_DEFAULT,
    getFillColor: (point) =>
      selectedIds.has(point.id) ? POINT_FILL_COLOR_SELECTED : POINT_FILL_COLOR_DEFAULT,
    stroked: true,
    getLineColor: (point) =>
      selectedIds.has(point.id) ? POINT_LINE_COLOR_SELECTED : POINT_LINE_COLOR_DEFAULT,
    getLineWidth: (point) =>
      selectedIds.has(point.id) ? POINT_LINE_WIDTH_SELECTED : POINT_LINE_WIDTH_DEFAULT,
    lineWidthUnits: 'pixels',
    updateTriggers: {
      getRadius: [selectedIds],
      getFillColor: [selectedIds],
      getLineColor: [selectedIds],
      getLineWidth: [selectedIds],
    },
  });
}
