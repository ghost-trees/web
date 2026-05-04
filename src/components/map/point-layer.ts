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
} from './constants';

export function createPointLayer(
  points: MapPoint[],
  selectedIds: Set<string>,
  hoveredIds: Set<string>,
  scalePointsByFee: boolean,
) {
  const isHoverFocusEnabled = selectedIds.size === 0;
  const feeMax = scalePointsByFee
    ? points.reduce((maxFeeTotal, point) => Math.max(maxFeeTotal, point.feeTotal), 0)
    : 0;
  const getScaledRadius = (point: MapPoint) => {
    if (!scalePointsByFee || feeMax <= 0) {
      return POINT_RADIUS_DEFAULT;
    }
    const feeRatio = Math.min(Math.max(point.feeTotal / feeMax, 0), 1);
    return 3 + feeRatio * (18 - 3);
  };

  return new ScatterplotLayer<MapPoint>({
    id: POINT_LAYER_ID,
    data: points,
    pickable: true,
    radiusUnits: 'pixels',
    radiusMinPixels: 3,
    radiusMaxPixels: 18,
    getPosition: (point) => point.coordinates,
    getRadius: getScaledRadius,
    getFillColor: (point) => {
      if (selectedIds.has(point.id)) {
        return POINT_FILL_COLOR_SELECTED;
      }
      return isHoverFocusEnabled && hoveredIds.has(point.id)
        ? POINT_FILL_COLOR_SELECTED
        : POINT_FILL_COLOR_DEFAULT;
    },
    stroked: true,
    getLineColor: (point) => {
      if (selectedIds.has(point.id)) {
        return POINT_LINE_COLOR_SELECTED;
      }
      return isHoverFocusEnabled && hoveredIds.has(point.id)
        ? POINT_LINE_COLOR_SELECTED
        : POINT_LINE_COLOR_DEFAULT;
    },
    getLineWidth: (point) => {
      if (selectedIds.has(point.id)) {
        return POINT_LINE_WIDTH_SELECTED;
      }
      return isHoverFocusEnabled && hoveredIds.has(point.id)
        ? POINT_LINE_WIDTH_SELECTED
        : POINT_LINE_WIDTH_DEFAULT;
    },
    lineWidthUnits: 'pixels',
    updateTriggers: {
      getRadius: [scalePointsByFee, feeMax],
      getFillColor: [selectedIds, hoveredIds],
      getLineColor: [selectedIds, hoveredIds],
      getLineWidth: [selectedIds, hoveredIds],
    },
  });
}
