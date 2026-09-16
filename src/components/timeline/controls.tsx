/**
 * @file controls.tsx
 * @description
 * Play/pause and month scrubbing for the Home playback map. Rendered inline beneath the map
 * rather than as an overlay, so it never covers the visualization it drives.
 */

import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';

const fullMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

export function TimelineControls() {
  const timelineMonthIndex = useUiStore((state) => state.timelineMonthIndex);
  const isTimelinePlaying = useUiStore((state) => state.isTimelinePlaying);
  const setTimelinePlaying = useUiStore((state) => state.setTimelinePlaying);
  const toggleTimelinePlaying = useUiStore((state) => state.toggleTimelinePlaying);
  const setTimelineMonthIndex = useUiStore((state) => state.setTimelineMonthIndex);
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
      : 'Play timeline';
  const timelineControlIcon = isTimelinePlaying
    ? 'pause'
    : isAtTimelineEnd
      ? 'replay'
      : 'play_arrow';

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={handleTimelineControlClick}
        disabled={!hasTimelineData}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-round-four)] bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-highest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={timelineControlAriaLabel}
      >
        <span className="material-symbols-outlined text-[24px] leading-none" aria-hidden="true">
          {timelineControlIcon}
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--color-on-surface)] tabular-nums">
          {activeMonthLabel}
        </p>
        <input
          type="range"
          min={0}
          max={maxMonthIndex}
          step={0.01}
          value={clampedProgressIndex}
          disabled={!hasTimelineData}
          onChange={(event) => {
            setTimelinePlaying(false);
            setTimelineMonthIndex(Number(event.target.value));
          }}
          className="mt-2 h-6 w-full accent-[var(--color-primary)] disabled:opacity-50"
          aria-label="Timeline month slider"
        />
      </div>
    </div>
  );
}
