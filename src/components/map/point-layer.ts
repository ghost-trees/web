/**
 * @file point-layer.ts
 * @description
 * Deck.gl point layer factory for rendering selectable map points.
 */

import { ScatterplotLayer } from '@deck.gl/layers';
import type { MapPoint } from '../../state/data-store';
import { parseYearMonth, toYearMonthKey } from '../../utils/date';
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

const TIMELINE_FADE_MONTH_WINDOW = 8;
const TIMELINE_MIN_FILL_ALPHA = 18;
const TIMELINE_MIN_LINE_ALPHA = 28;

type TimelineLayerOptions = {
  enabled: boolean;
  currentMonthKey: number | null;
};

function withAlpha(
  color: [number, number, number, number],
  alpha: number,
): [number, number, number, number] {
  return [color[0], color[1], color[2], alpha];
}

function getTimelineAlpha(
  point: MapPoint,
  currentMonthKey: number | null,
  fullAlpha: number,
  minAlpha: number,
): number {
  if (currentMonthKey === null) {
    return fullAlpha;
  }

  const pointYearMonth = parseYearMonth(point.date);
  if (!pointYearMonth) {
    return 0;
  }

  const ageInMonths = currentMonthKey - toYearMonthKey(pointYearMonth);
  if (ageInMonths < -1) {
    return 0;
  }
  if (ageInMonths < 0) {
    return Math.round(fullAlpha * (ageInMonths + 1));
  }
  if (ageInMonths === 0) {
    return fullAlpha;
  }
  if (ageInMonths >= TIMELINE_FADE_MONTH_WINDOW) {
    return minAlpha;
  }

  const fadeProgress = ageInMonths / TIMELINE_FADE_MONTH_WINDOW;
  return Math.round(fullAlpha - (fullAlpha - minAlpha) * fadeProgress);
}

export function createPointLayer(
  points: MapPoint[],
  selectedIds: Set<string>,
  hoveredIds: Set<string>,
  scalePointsByFee: boolean,
  timelineOptions?: TimelineLayerOptions,
) {
  const isTimelineMode = timelineOptions?.enabled ?? false;
  const timelineMonthKey = timelineOptions?.currentMonthKey ?? null;
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
      const baseColor =
        isHoverFocusEnabled && hoveredIds.has(point.id)
          ? POINT_FILL_COLOR_SELECTED
          : POINT_FILL_COLOR_DEFAULT;
      if (!isTimelineMode) {
        return baseColor;
      }
      return withAlpha(
        baseColor,
        getTimelineAlpha(point, timelineMonthKey, baseColor[3], TIMELINE_MIN_FILL_ALPHA),
      );
    },
    stroked: true,
    getLineColor: (point) => {
      if (selectedIds.has(point.id)) {
        return POINT_LINE_COLOR_SELECTED;
      }
      const baseColor =
        isHoverFocusEnabled && hoveredIds.has(point.id)
          ? POINT_LINE_COLOR_SELECTED
          : POINT_LINE_COLOR_DEFAULT;
      if (!isTimelineMode) {
        return baseColor;
      }
      return withAlpha(
        baseColor,
        getTimelineAlpha(point, timelineMonthKey, baseColor[3], TIMELINE_MIN_LINE_ALPHA),
      );
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
      getFillColor: [selectedIds, hoveredIds, isTimelineMode, timelineMonthKey],
      getLineColor: [selectedIds, hoveredIds, isTimelineMode, timelineMonthKey],
      getLineWidth: [selectedIds, hoveredIds],
    },
  });
}
