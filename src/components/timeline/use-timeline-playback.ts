/**
 * @file use-timeline-playback.ts
 * @description
 * Drives the month-by-month timeline animation. Playback only exists on Home, so the hook
 * is a no-op on any other view and stops its timer as soon as Home is left.
 */

import { useEffect } from 'react';
import { useDataStore } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';
import { hasInitialUrlState } from '../../state/url-state';

const TICK_MS = 50;

export function useTimelinePlayback(): void {
  const hasLoaded = useDataStore((state) => state.hasLoaded);
  const mainView = useUiStore((state) => state.mainView);
  const timelineMonthIndex = useUiStore((state) => state.timelineMonthIndex);
  const isTimelinePlaying = useUiStore((state) => state.isTimelinePlaying);
  const timelineStepMs = useUiStore((state) => state.timelineStepMs);
  const hasTimelineAutoStarted = useUiStore((state) => state.hasTimelineAutoStarted);
  const setTimelinePlaying = useUiStore((state) => state.setTimelinePlaying);
  const setTimelineMonthIndex = useUiStore((state) => state.setTimelineMonthIndex);
  const markTimelineAutoStarted = useUiStore((state) => state.markTimelineAutoStarted);
  const timelineMonths = useFilterStore((state) => state.timelineMonths);

  const isHomeView = mainView === 'home';
  const monthCount = timelineMonths.length;
  const hasTimelineData = monthCount > 0;
  const maxMonthIndex = Math.max(0, monthCount - 1);
  const clampedProgressIndex = Math.min(Math.max(timelineMonthIndex, 0), maxMonthIndex);

  useEffect(() => {
    if (timelineMonthIndex !== clampedProgressIndex) {
      setTimelineMonthIndex(clampedProgressIndex);
    }
  }, [clampedProgressIndex, timelineMonthIndex, setTimelineMonthIndex]);

  useEffect(() => {
    if (!isHomeView || !hasLoaded || hasTimelineAutoStarted) {
      return;
    }

    markTimelineAutoStarted();
    // A link that already describes a view or filter selection is an intentional destination;
    // hijacking it with playback would fight the state the visitor arrived with.
    if (hasInitialUrlState()) {
      return;
    }
    if (!hasTimelineData) {
      return;
    }
    setTimelineMonthIndex(0);
    setTimelinePlaying(true);
  }, [
    hasLoaded,
    hasTimelineAutoStarted,
    hasTimelineData,
    isHomeView,
    markTimelineAutoStarted,
    setTimelineMonthIndex,
    setTimelinePlaying,
  ]);

  useEffect(() => {
    if (!isHomeView || !hasTimelineData || !isTimelinePlaying) {
      return;
    }

    if (clampedProgressIndex >= monthCount - 1) {
      setTimelinePlaying(false);
      return;
    }

    const timerId = window.setInterval(() => {
      const state = useUiStore.getState();
      const latestMonthCount = useFilterStore.getState().timelineMonths.length;
      const maxLatestMonthIndex = Math.max(0, latestMonthCount - 1);
      if (latestMonthCount === 0) {
        state.setTimelinePlaying(false);
        return;
      }
      if (state.timelineMonthIndex >= maxLatestMonthIndex) {
        state.setTimelinePlaying(false);
        return;
      }
      const monthProgressPerTick = TICK_MS / Math.max(state.timelineStepMs, 1);
      const nextProgress = Math.min(
        maxLatestMonthIndex,
        state.timelineMonthIndex + monthProgressPerTick,
      );
      state.setTimelineMonthIndex(nextProgress);
    }, TICK_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [
    clampedProgressIndex,
    hasTimelineData,
    isHomeView,
    isTimelinePlaying,
    monthCount,
    timelineStepMs,
    setTimelinePlaying,
  ]);
}
