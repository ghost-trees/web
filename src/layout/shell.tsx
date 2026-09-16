import { Suspense, type ReactNode } from 'react';
import { useUiStore } from '../state/ui-store';

function LoadingFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center p-6">
      <span className="text-xs text-[var(--color-on-surface-variant)]">{label}</span>
    </div>
  );
}

type ShellProps = {
  topNav: ReactNode;
  homeContent: ReactNode;
  mapsContent?: ReactNode;
  galleryContent?: ReactNode;
  aboutContent?: ReactNode;
};

export function Shell({
  topNav,
  homeContent,
  mapsContent,
  galleryContent,
  aboutContent,
}: ShellProps) {
  const mainView = useUiStore((state) => state.mainView);
  // Maps and Gallery are kept in the DOM once opened so the MapLibre session and scroll
  // positions survive navigation. Home and About are not: Home's deck.gl canvas is cheap to
  // recreate, and unmounting it guarantees only one map is holding a GL context at a time.
  const visitedViews = useUiStore((state) => state.visitedViews);

  return (
    <div className="flex h-dvh flex-col bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]">
      {topNav}
      <main className="relative min-h-0 min-w-0 flex-1 bg-[var(--color-surface-container-lowest)]">
        {mainView === 'home' ? <div className="absolute inset-0 flex">{homeContent}</div> : null}
        <div
          className={`absolute inset-0 min-h-0 min-w-0 ${
            mainView === 'maps' ? 'flex' : 'pointer-events-none hidden'
          }`}
          aria-hidden={mainView !== 'maps'}
        >
          {visitedViews.has('maps') ? (
            <Suspense fallback={<LoadingFallback label="Loading map..." />}>{mapsContent}</Suspense>
          ) : null}
        </div>
        <div
          className={`absolute inset-0 min-h-0 min-w-0 ${
            mainView === 'gallery' ? 'flex' : 'pointer-events-none hidden'
          }`}
          aria-hidden={mainView !== 'gallery'}
        >
          {visitedViews.has('gallery') ? (
            <Suspense fallback={<LoadingFallback label="Loading gallery..." />}>
              {galleryContent}
            </Suspense>
          ) : null}
        </div>
        {mainView === 'about' ? (
          <div className="absolute inset-0 flex">
            <Suspense fallback={<LoadingFallback label="Loading..." />}>{aboutContent}</Suspense>
          </div>
        ) : null}
      </main>
    </div>
  );
}
