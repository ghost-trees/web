/**
 * @file controls.tsx
 * @description
 * Floating map control buttons for zoom in, zoom out, and reset-to-home view.
 */

type MapControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

const mapControlButtonClass =
  'pointer-events-auto flex h-9 w-9 items-center justify-center rounded-[var(--radius-round-four)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-highest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]';

export function MapControls({ onZoomIn, onZoomOut, onResetView }: MapControlsProps) {
  return (
    <div className="pointer-events-none absolute right-6 top-6 z-30 flex flex-col gap-2">
      <div className="pointer-events-auto rounded-[var(--radius-round-four)] bg-[var(--color-surface-container-high)] p-1 shadow-ambient backdrop-blur-[var(--blur-glass)]">
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={onZoomIn}
          className={mapControlButtonClass}
        >
          <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
            add
          </span>
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={onZoomOut}
          className={mapControlButtonClass}
        >
          <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
            remove
          </span>
        </button>
      </div>
      <button
        type="button"
        aria-label="Reset map view"
        title="Reset map view"
        onClick={onResetView}
        className={`${mapControlButtonClass} bg-[var(--color-surface-container-high)] shadow-ambient backdrop-blur-[var(--blur-glass)]`}
      >
        <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
          home
        </span>
      </button>
    </div>
  );
}
