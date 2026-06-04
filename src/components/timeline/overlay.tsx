import { useEffect } from 'react';
import { useDataStore } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';

const fullMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

export function TimelineOverlay() {
  const hasLoaded = useDataStore((state) => state.hasLoaded);
  const appMode = useUiStore((state) => state.appMode);
  const timelineMonthIndex = useUiStore((state) => state.timelineMonthIndex);
  const isTimelinePlaying = useUiStore((state) => state.isTimelinePlaying);
  const timelineStepMs = useUiStore((state) => state.timelineStepMs);
  const hasTimelineAutoStarted = useUiStore((state) => state.hasTimelineAutoStarted);
  const enterTimeline = useUiStore((state) => state.enterTimeline);
  const exitTimeline = useUiStore((state) => state.exitTimeline);
  const setTimelinePlaying = useUiStore((state) => state.setTimelinePlaying);
  const toggleTimelinePlaying = useUiStore((state) => state.toggleTimelinePlaying);
  const setTimelineMonthIndex = useUiStore((state) => state.setTimelineMonthIndex);
  const markTimelineAutoStarted = useUiStore((state) => state.markTimelineAutoStarted);
  const timelineMonths = useFilterStore((state) => state.timelineMonths);

  const monthCount = timelineMonths.length;
  const hasTimelineData = monthCount > 0;
  const maxMonthIndex = Math.max(0, monthCount - 1);
  const clampedProgressIndex = Math.min(Math.max(timelineMonthIndex, 0), maxMonthIndex);
  const isAtTimelineEnd =
    hasTimelineData && !isTimelinePlaying && clampedProgressIndex >= maxMonthIndex;
  const activeMonth = hasTimelineData ? timelineMonths[Math.floor(clampedProgressIndex)] : null;
  const activeMonthLabel = activeMonth
    ? fullMonthFormatter.format(new Date(activeMonth.year, activeMonth.monthIndex, 1))
    : 'No dated records available';

  useEffect(() => {
    if (timelineMonthIndex !== clampedProgressIndex) {
      setTimelineMonthIndex(clampedProgressIndex);
    }
  }, [clampedProgressIndex, timelineMonthIndex, setTimelineMonthIndex]);

  useEffect(() => {
    if (!hasLoaded || hasTimelineAutoStarted) {
      return;
    }

    markTimelineAutoStarted();
    if (!hasTimelineData) {
      return;
    }
    setTimelineMonthIndex(0);
    enterTimeline();
  }, [
    enterTimeline,
    hasLoaded,
    hasTimelineAutoStarted,
    hasTimelineData,
    markTimelineAutoStarted,
    setTimelineMonthIndex,
  ]);

  useEffect(() => {
    if (appMode !== 'timeline' || !hasTimelineData || !isTimelinePlaying) {
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
      const tickMs = 50;
      const monthProgressPerTick = tickMs / Math.max(state.timelineStepMs, 1);
      const nextProgress = Math.min(
        maxLatestMonthIndex,
        state.timelineMonthIndex + monthProgressPerTick,
      );
      state.setTimelineMonthIndex(nextProgress);
    }, 50);

    return () => {
      window.clearInterval(timerId);
    };
  }, [
    appMode,
    clampedProgressIndex,
    hasTimelineData,
    isTimelinePlaying,
    monthCount,
    timelineStepMs,
    setTimelinePlaying,
  ]);

  useEffect(() => {
    if (appMode !== 'timeline') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      exitTimeline();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [appMode, exitTimeline]);

  if (appMode !== 'timeline') {
    return null;
  }

  const handleTimelineControlClick = () => {
    if (isAtTimelineEnd) {
      setTimelineMonthIndex(0);
      setTimelinePlaying(true);
      return;
    }
    toggleTimelinePlaying();
  };

  const timelineControlAriaLabel = isTimelinePlaying
    ? 'Pause timeline'
    : isAtTimelineEnd
      ? 'Replay timeline'
      : 'Resume timeline';
  const timelineControlIcon = isTimelinePlaying
    ? 'pause'
    : isAtTimelineEnd
      ? 'replay'
      : 'play_arrow';

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div className="pointer-events-auto absolute left-1/2 top-6 w-[min(680px,calc(100%-4rem))] -translate-x-1/2 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[color-mix(in_oklab,var(--color-surface-container-high)_75%,transparent)] p-4 shadow-ambient">
        <button
          type="button"
          onClick={exitTimeline}
          aria-label="Exit timeline"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-highest)]"
        >
          <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
            close
          </span>
        </button>
        <p className="text-center text-[11px] uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
          Timeline
        </p>
        <p className="mt-1 text-center text-lg font-semibold text-[var(--color-on-surface)]">
          {activeMonthLabel}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={handleTimelineControlClick}
            disabled={!hasTimelineData}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-highest)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={timelineControlAriaLabel}
          >
            <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
              {timelineControlIcon}
            </span>
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(0, monthCount - 1)}
            step={0.01}
            value={clampedProgressIndex}
            disabled={!hasTimelineData}
            onChange={(event) => {
              setTimelinePlaying(false);
              setTimelineMonthIndex(Number(event.target.value));
            }}
            className="h-2 flex-1 accent-[var(--color-primary)] disabled:opacity-50"
            aria-label="Timeline month slider"
          />
        </div>
      </div>
    </div>
  );
}
