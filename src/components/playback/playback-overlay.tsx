import { useEffect } from 'react';
import { useDataStore } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';

const fullMonthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

export function PlaybackOverlay() {
  const hasLoaded = useDataStore((state) => state.hasLoaded);
  const appMode = useUiStore((state) => state.appMode);
  const playbackMonthIndex = useUiStore((state) => state.playbackMonthIndex);
  const isPlaybackPlaying = useUiStore((state) => state.isPlaybackPlaying);
  const playbackStepMs = useUiStore((state) => state.playbackStepMs);
  const hasPlaybackAutoStarted = useUiStore((state) => state.hasPlaybackAutoStarted);
  const enterPlayback = useUiStore((state) => state.enterPlayback);
  const exitPlayback = useUiStore((state) => state.exitPlayback);
  const setPlaybackPlaying = useUiStore((state) => state.setPlaybackPlaying);
  const togglePlaybackPlaying = useUiStore((state) => state.togglePlaybackPlaying);
  const setPlaybackMonthIndex = useUiStore((state) => state.setPlaybackMonthIndex);
  const markPlaybackAutoStarted = useUiStore((state) => state.markPlaybackAutoStarted);
  const playbackMonths = useFilterStore((state) => state.playbackMonths);

  const monthCount = playbackMonths.length;
  const hasPlaybackData = monthCount > 0;
  const maxMonthIndex = Math.max(0, monthCount - 1);
  const clampedProgressIndex = Math.min(Math.max(playbackMonthIndex, 0), maxMonthIndex);
  const isAtPlaybackEnd = hasPlaybackData && !isPlaybackPlaying && clampedProgressIndex >= maxMonthIndex;
  const activeMonth = hasPlaybackData ? playbackMonths[Math.floor(clampedProgressIndex)] : null;
  const activeMonthLabel = activeMonth
    ? fullMonthFormatter.format(new Date(activeMonth.year, activeMonth.monthIndex, 1))
    : 'No dated records available';

  useEffect(() => {
    if (playbackMonthIndex !== clampedProgressIndex) {
      setPlaybackMonthIndex(clampedProgressIndex);
    }
  }, [clampedProgressIndex, playbackMonthIndex, setPlaybackMonthIndex]);

  useEffect(() => {
    if (!hasLoaded || hasPlaybackAutoStarted) {
      return;
    }

    markPlaybackAutoStarted();
    if (!hasPlaybackData) {
      return;
    }
    setPlaybackMonthIndex(0);
    enterPlayback();
  }, [
    enterPlayback,
    hasLoaded,
    hasPlaybackAutoStarted,
    hasPlaybackData,
    markPlaybackAutoStarted,
    setPlaybackMonthIndex,
  ]);

  useEffect(() => {
    if (appMode !== 'playback' || !hasPlaybackData || !isPlaybackPlaying) {
      return;
    }

    if (clampedProgressIndex >= monthCount - 1) {
      setPlaybackPlaying(false);
      return;
    }

    const timerId = window.setInterval(() => {
      const state = useUiStore.getState();
      const latestMonthCount = useFilterStore.getState().playbackMonths.length;
      const maxLatestMonthIndex = Math.max(0, latestMonthCount - 1);
      if (latestMonthCount === 0) {
        state.setPlaybackPlaying(false);
        return;
      }
      if (state.playbackMonthIndex >= maxLatestMonthIndex) {
        state.setPlaybackPlaying(false);
        return;
      }
      const tickMs = 50;
      const monthProgressPerTick = tickMs / Math.max(state.playbackStepMs, 1);
      const nextProgress = Math.min(maxLatestMonthIndex, state.playbackMonthIndex + monthProgressPerTick);
      state.setPlaybackMonthIndex(nextProgress);
    }, 50);

    return () => {
      window.clearInterval(timerId);
    };
  }, [
    appMode,
    clampedProgressIndex,
    hasPlaybackData,
    isPlaybackPlaying,
    monthCount,
    playbackStepMs,
    setPlaybackPlaying,
  ]);

  useEffect(() => {
    if (appMode !== 'playback') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      exitPlayback();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [appMode, exitPlayback]);

  if (appMode !== 'playback') {
    return null;
  }

  const handlePlaybackControlClick = () => {
    if (isAtPlaybackEnd) {
      setPlaybackMonthIndex(0);
      setPlaybackPlaying(true);
      return;
    }
    togglePlaybackPlaying();
  };

  const playbackControlAriaLabel = isPlaybackPlaying
    ? 'Pause playback'
    : isAtPlaybackEnd
      ? 'Replay timeline'
      : 'Resume playback';
  const playbackControlIcon = isPlaybackPlaying ? 'pause' : isAtPlaybackEnd ? 'replay' : 'play_arrow';

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div className="pointer-events-auto absolute left-1/2 top-6 w-[min(680px,calc(100%-4rem))] -translate-x-1/2 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4 shadow-ambient backdrop-blur-[var(--blur-glass)]">
        <button
          type="button"
          onClick={exitPlayback}
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
            onClick={handlePlaybackControlClick}
            disabled={!hasPlaybackData}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-highest)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={playbackControlAriaLabel}
          >
            <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
              {playbackControlIcon}
            </span>
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(0, monthCount - 1)}
            step={0.01}
            value={clampedProgressIndex}
            disabled={!hasPlaybackData}
            onChange={(event) => {
              setPlaybackPlaying(false);
              setPlaybackMonthIndex(Number(event.target.value));
            }}
            className="h-2 flex-1 accent-[var(--color-primary)] disabled:opacity-50"
            aria-label="Timeline month slider"
          />
        </div>
      </div>
    </div>
  );
}
