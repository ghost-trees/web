/**
 * @file view.tsx
 * @description
 * Landing surface: a hero that pairs the project headline with the timeline playing across
 * Atlanta, followed by hooks into the Maps, Gallery, and About surfaces. The playback controls
 * are overlaid on the map, so the map panel owns the positioning context for them.
 */

import { useUiStore } from '../../state/ui-store';
import { TimelineControls } from '../timeline/controls';
import { useTimelinePlayback } from '../timeline/use-timeline-playback';
import { DestinationCard } from './destination-card';
import { HomePlaybackMap } from './playback-map';

export function HomeView() {
  useTimelinePlayback();
  const showMaps = useUiStore((state) => state.showMaps);
  const showGallery = useUiStore((state) => state.showGallery);
  const showAbout = useUiStore((state) => state.showAbout);

  return (
    <section
      aria-label="Home"
      className="h-full min-h-0 w-full overflow-y-auto bg-[var(--color-surface-container-low)]"
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center gap-8 px-6 py-8 sm:px-8 md:flex-row md:items-center md:gap-12 md:py-12">
        <header className="w-full shrink-0 md:w-[42%]">
          <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-[var(--tracking-display-tight)] text-[var(--color-primary)] md:text-6xl">
            Visualizing Loss
          </h2>
          <p className="mt-5 max-w-prose text-justify text-2xl leading-[1.25] hyphens-auto text-[var(--color-on-surface-variant)] md:text-4xl md:leading-[1.2]">
            Atlanta is often described as the city in the forest. Its tree canopy is one of the
            defining characteristics of the city. Every year, trees are cut down without permission.
            When these cases are discovered, they become part of the public record. We call them
            Ghost Trees.
          </p>
        </header>

        <div className="relative h-[56dvh] min-h-[340px] w-full min-w-0 overflow-hidden rounded-[var(--radius-round-four)] bg-[var(--color-surface-container-lowest)] shadow-ambient md:h-[76dvh] md:flex-1">
          <HomePlaybackMap />
          <TimelineControls />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-8 md:pb-24">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <li>
            <DestinationCard
              label="Maps"
              title="Where Trees Stood"
              description="Filter the records and inspect individual points on the interactive map."
              icon="map"
              actionLabel="Explore the map"
              onSelect={showMaps}
            />
          </li>
          <li>
            <DestinationCard
              label="Gallery"
              title="Before &amp; After Loss"
              description="Street View comparisons of the same addresses, years apart."
              icon="photo_library"
              actionLabel="See before and after"
              onSelect={showGallery}
            />
          </li>
          <li>
            <DestinationCard
              label="About"
              title="The Story"
              description="Why these records exist, and what makes a removed tree a ghost tree."
              icon="info"
              actionLabel="Read about Ghost Trees"
              onSelect={showAbout}
            />
          </li>
        </ul>
      </div>
    </section>
  );
}
