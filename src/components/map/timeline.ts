import type { MapPoint } from '../../state/data-store';
import { parseYearMonth, toYearMonthKey } from '../../utils/date';

type TimelineMonth = {
  key: number;
};

export function deriveTimelineMonthKey(
  timelineMonths: TimelineMonth[],
  timelineMonthIndex: number,
): number | null {
  if (timelineMonths.length === 0) {
    return null;
  }

  const maxTimelineMonthIndex = Math.max(0, timelineMonths.length - 1);
  const clampedTimelineProgress = Math.min(Math.max(timelineMonthIndex, 0), maxTimelineMonthIndex);
  const timelineMonthBaseIndex = Math.floor(clampedTimelineProgress);
  const timelineMonthNextIndex = Math.min(timelineMonthBaseIndex + 1, maxTimelineMonthIndex);
  const timelineInterpolation = clampedTimelineProgress - timelineMonthBaseIndex;
  const timelineMonth = timelineMonths[timelineMonthBaseIndex] ?? null;
  const timelineNextMonth = timelineMonths[timelineMonthNextIndex] ?? null;

  if (!timelineMonth || !timelineNextMonth) {
    return timelineMonth?.key ?? null;
  }

  return timelineMonth.key + (timelineNextMonth.key - timelineMonth.key) * timelineInterpolation;
}

export function selectPointsForLayer({
  appMode,
  filteredPoints,
  timelinePoints,
  timelineMonthKey,
}: {
  appMode: 'explore' | 'timeline';
  filteredPoints: MapPoint[];
  timelinePoints: MapPoint[];
  timelineMonthKey: number | null;
}): MapPoint[] {
  if (appMode !== 'timeline' || timelineMonthKey === null) {
    return filteredPoints;
  }

  return timelinePoints.filter((point) => {
    const yearMonth = parseYearMonth(point.date);
    if (!yearMonth) {
      return false;
    }
    return toYearMonthKey(yearMonth) <= timelineMonthKey + 1;
  });
}

export function filterIdsByVisibility(ids: Set<string>, visiblePointIds: Set<string>): Set<string> {
  return new Set([...ids].filter((id) => visiblePointIds.has(id)));
}
