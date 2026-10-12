/**
 * @file controls.tsx
 * @description
 * Playback controls overlaid on the Home map. The month readout and play button sit in the top
 * left corner; the scrubber runs along the bottom edge of the map like a video progress bar.
 * Rendered as absolutely positioned children, so the host element must be `relative`.
 */

import type { CSSProperties } from 'react';
import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';

const monthNameFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
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
  const activeMonthName = activeMonth
    ? monthNameFormatter.format(new Date(activeMonth.year, activeMonth.monthIndex, 1))
    : null;
  const activeYear = activeMonth ? String(activeMonth.year) : null;
  const progressPercent = maxMonthIndex > 0 ? (clampedProgressIndex / maxMonthIndex) * 100 : 0;

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
    <>
      <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-[var(--radius-round-four)] bg-[var(--color-surface-container-high)] p-1 pr-3 shadow-ambient backdrop-blur-[var(--blur-glass)]">
        <button
          type="button"
          onClick={handleTimelineControlClick}
          disabled={!hasTimelineData}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-round-four)] text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-highest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={timelineControlAriaLabel}
        >
          <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
            {timelineControlIcon}
          </span>
        </button>
        {activeMonthName && activeYear ? (
          <div
            className="grid shrink-0 leading-tight text-[var(--color-on-surface)]"
            aria-label={`${activeMonthName} ${activeYear}`}
          >
            {/* Invisible longest month locks column width so shorter names don't shrink the box. */}
            <span
              className="invisible col-start-1 row-start-1 text-base font-semibold"
              aria-hidden="true"
            >
              September
            </span>
            <span className="col-start-1 row-start-1 text-base font-semibold">{activeMonthName}</span>
            <span className="col-start-1 row-start-2 text-sm font-semibold tabular-nums text-[var(--color-on-surface-variant)]">
              {activeYear}
            </span>
          </div>
        ) : (
          <p className="shrink-0 text-sm font-semibold leading-tight text-[var(--color-on-surface)]">
            No dated records available
          </p>
        )}
      </div>

      {/* Scrim keeps the scrubber legible over lighter parts of the basemap. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-3 pb-0.5 pt-10">
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
          style={{ '--timeline-progress': `${progressPercent}%` } as CSSProperties}
          className="timeline-scrubber pointer-events-auto"
          aria-label="Timeline month slider"
        />
      </div>
    </>
  );
}
