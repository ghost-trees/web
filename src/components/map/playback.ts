import type { MapPoint } from '../../state/data-store';
import { parseYearMonth, toYearMonthKey } from '../../utils/date';

type PlaybackMonth = {
  key: number;
};

export function derivePlaybackMonthKey(
  playbackMonths: PlaybackMonth[],
  playbackMonthIndex: number,
): number | null {
  if (playbackMonths.length === 0) {
    return null;
  }

  const maxPlaybackMonthIndex = Math.max(0, playbackMonths.length - 1);
  const clampedPlaybackProgress = Math.min(Math.max(playbackMonthIndex, 0), maxPlaybackMonthIndex);
  const playbackMonthBaseIndex = Math.floor(clampedPlaybackProgress);
  const playbackMonthNextIndex = Math.min(playbackMonthBaseIndex + 1, maxPlaybackMonthIndex);
  const playbackInterpolation = clampedPlaybackProgress - playbackMonthBaseIndex;
  const playbackMonth = playbackMonths[playbackMonthBaseIndex] ?? null;
  const playbackNextMonth = playbackMonths[playbackMonthNextIndex] ?? null;

  if (!playbackMonth || !playbackNextMonth) {
    return playbackMonth?.key ?? null;
  }

  return playbackMonth.key + (playbackNextMonth.key - playbackMonth.key) * playbackInterpolation;
}

export function selectPointsForLayer({
  appMode,
  filteredPoints,
  playbackPoints,
  playbackMonthKey,
}: {
  appMode: 'explore' | 'playback';
  filteredPoints: MapPoint[];
  playbackPoints: MapPoint[];
  playbackMonthKey: number | null;
}): MapPoint[] {
  if (appMode !== 'playback' || playbackMonthKey === null) {
    return filteredPoints;
  }

  return playbackPoints.filter((point) => {
    const yearMonth = parseYearMonth(point.date);
    if (!yearMonth) {
      return false;
    }
    return toYearMonthKey(yearMonth) <= playbackMonthKey + 1;
  });
}

export function filterIdsByVisibility(ids: Set<string>, visiblePointIds: Set<string>): Set<string> {
  return new Set([...ids].filter((id) => visiblePointIds.has(id)));
}
