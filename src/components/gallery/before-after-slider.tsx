/**
 * @file before-after-slider.tsx
 * @description
 * Draggable before/after image comparison slider. The "after" image is clipped
 * and revealed by dragging a vertical divider left/right. Supports mouse, touch
 * (via pointer events), and keyboard (arrow keys) interaction.
 */

import { useCallback, useRef, useState } from 'react';

type BeforeAfterSliderProps = {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
};

const MIN_POSITION = 0;
const MAX_POSITION = 100;
const KEYBOARD_STEP = 2;
const KEYBOARD_STEP_LARGE = 10;

function clampPosition(value: number): number {
  return Math.min(MAX_POSITION, Math.max(MIN_POSITION, value));
}

type SliderImageProps = {
  src: string;
  fallbackLabel: string;
  alt: string;
};

function SliderImage({ src, fallbackLabel, alt }: SliderImageProps) {
  const [hasError, setHasError] = useState(false);

  // Treat a missing src (e.g. no API key or an un-curated panorama ID) the same
  // as a load error so the fallback label renders instead of a broken image.
  if (hasError || !src) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-surface-container-highest"
        aria-hidden="true"
      >
        <span className="text-xs font-bold uppercase tracking-label-meta text-on-surface-variant">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setHasError(true)}
      className="pointer-events-none h-full w-full select-none object-cover"
    />
  );
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  alt = 'Comparison image',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clampPosition(ratio));
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      updateFromClientX(event.clientX);
    },
    [updateFromClientX],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) {
        return;
      }
      updateFromClientX(event.clientX);
    },
    [isDragging, updateFromClientX],
  );

  const stopDragging = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setPosition((current) => clampPosition(current - KEYBOARD_STEP));
        break;
      case 'ArrowRight':
        event.preventDefault();
        setPosition((current) => clampPosition(current + KEYBOARD_STEP));
        break;
      case 'PageDown':
        event.preventDefault();
        setPosition((current) => clampPosition(current - KEYBOARD_STEP_LARGE));
        break;
      case 'PageUp':
        event.preventDefault();
        setPosition((current) => clampPosition(current + KEYBOARD_STEP_LARGE));
        break;
      case 'Home':
        event.preventDefault();
        setPosition(MIN_POSITION);
        break;
      case 'End':
        event.preventDefault();
        setPosition(MAX_POSITION);
        break;
      default:
        break;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      className={`relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-round-four bg-surface-container-highest ${
        isDragging ? 'cursor-grabbing' : 'cursor-ew-resize'
      }`}
    >
      {/* Base layer: before image (full width). The label lives inside this layer
          so it is covered (hidden) whenever the after layer clips over it. */}
      <div className="absolute inset-0">
        <SliderImage
          src={beforeImage}
          fallbackLabel={beforeLabel}
          alt={`${alt} (${beforeLabel})`}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-round-four bg-surface-container-highest/85 px-2 py-1 text-[10px] font-bold uppercase tracking-label-meta text-on-surface">
          {beforeLabel}
        </span>
      </div>

      {/* Top layer: after image, clipped from the left edge to the divider. The
          label lives inside this layer so it is clipped away with the after image. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        aria-hidden="true"
      >
        <SliderImage src={afterImage} fallbackLabel={afterLabel} alt={`${alt} (${afterLabel})`} />
        <span className="pointer-events-none absolute right-3 top-3 rounded-round-four bg-surface-container-highest/85 px-2 py-1 text-[10px] font-bold uppercase tracking-label-meta text-on-surface">
          {afterLabel}
        </span>
      </div>

      {/* Divider line + draggable handle. */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-surface"
        style={{ left: `${position}%` }}
      >
        <button
          type="button"
          role="slider"
          aria-label="Reveal before and after images"
          aria-valuemin={MIN_POSITION}
          aria-valuemax={MAX_POSITION}
          aria-valuenow={Math.round(position)}
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown}
          className="pointer-events-auto absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-surface text-on-surface shadow-ambient focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-lg leading-none" aria-hidden="true">
            code
          </span>
        </button>
      </div>
    </div>
  );
}
