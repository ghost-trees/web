/**
 * @file view.tsx
 * @description
 * Landing surface: the timeline plays across a fixed map of Atlanta.
 */

import { TimelineControls } from '../timeline/controls';
import { useTimelinePlayback } from '../timeline/use-timeline-playback';
import { HomePlaybackMap } from './playback-map';

export function HomeView() {
  useTimelinePlayback();

  return (
    <section
      aria-label="Home"
      className="h-full min-h-0 w-full overflow-y-auto bg-[var(--color-surface-container-low)]"
    >
      <div className="relative h-[58dvh] min-h-[300px] w-full md:h-[76dvh]">
        <HomePlaybackMap />
      </div>
      <div className="bg-[var(--color-surface-container-high)] px-4 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto w-full max-w-2xl">
          <TimelineControls />
        </div>
      </div>
    </section>
  );
}
