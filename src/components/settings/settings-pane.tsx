/**
 * @file settings-pane.tsx
 * @description
 * Settings: point-size mode, fee size multiplier, and the city-limits overlay.
 * Changes write straight to the map store.
 */

import { useState } from 'react';
import {
  formatSizeMultiplier,
  parseCommittedSizeMultiplier,
  parseLiveSizeMultiplier,
  SIZE_MULTIPLIER_MAX,
  SIZE_MULTIPLIER_MIN,
  stepSizeMultiplier,
} from '../map/point-radius';
import { useUiStore } from '../../state/ui-store';
import { PaneHeader } from '../common/pane-header';
import { AtlantaBoundaryIcon } from './atlanta-boundary-icon';

type PointSizeMode = 'uniform' | 'fee';

const POINT_SIZE_OPTIONS: { id: PointSizeMode; label: string }[] = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'fee', label: 'By fee amount' },
];

function PointSizeMark({ mode }: { mode: PointSizeMode }) {
  const radii = mode === 'uniform' ? [4.5, 4.5, 4.5] : [3, 5.5, 9];
  const width = 72;
  const height = 28;
  const gap = 9;
  const contentWidth =
    radii.reduce((sum, radius) => sum + radius * 2, 0) + gap * (radii.length - 1);
  let edge = (width - contentWidth) / 2;
  const circles = radii.map((radius) => {
    const cx = edge + radius;
    edge += radius * 2 + gap;
    return { cx, radius };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-7 w-16 text-[var(--color-primary)]"
      aria-hidden="true"
    >
      {circles.map((circle) => (
        <circle
          key={circle.cx}
          cx={circle.cx}
          cy={height / 2}
          r={circle.radius}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function SizeMultiplierControl() {
  const pointSizeMultiplier = useUiStore((state) => state.pointSizeMultiplier);
  const setPointSizeMultiplier = useUiStore((state) => state.setPointSizeMultiplier);
  const [draft, setDraft] = useState<string | null>(null);
  const parsedDraft = draft === null ? null : parseCommittedSizeMultiplier(draft);
  const activeMultiplier = parsedDraft ?? pointSizeMultiplier;
  const atMin = activeMultiplier <= SIZE_MULTIPLIER_MIN;
  const atMax = activeMultiplier >= SIZE_MULTIPLIER_MAX;

  const commitDraft = () => {
    if (draft === null) {
      return;
    }
    const committed = parseCommittedSizeMultiplier(draft);
    if (committed !== null) {
      setPointSizeMultiplier(committed);
    }
    setDraft(null);
  };

  const stepMultiplier = (direction: -1 | 1) => {
    setPointSizeMultiplier(stepSizeMultiplier(activeMultiplier, direction));
    setDraft(null);
  };

  return (
    <div className="mt-3 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--color-on-surface)]">Size multiplier</span>
        <div className="flex h-8 shrink-0 items-stretch overflow-hidden rounded-md border border-[var(--color-outline-variant)]">
          <button
            type="button"
            aria-label="Decrease size multiplier"
            disabled={atMin}
            onClick={() => stepMultiplier(-1)}
            className="w-8 border-r border-[var(--color-outline-variant)] text-sm text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-highest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            aria-label="Size multiplier"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={draft ?? formatSizeMultiplier(pointSizeMultiplier)}
            onChange={(event) => {
              const next = event.target.value;
              setDraft(next);
              const live = parseLiveSizeMultiplier(next);
              if (live !== null) {
                setPointSizeMultiplier(live);
              }
            }}
            onBlur={commitDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitDraft();
              }
            }}
            className="w-12 border-0 bg-transparent text-center text-sm text-[var(--color-on-surface)] outline-none"
          />
          <span
            aria-hidden="true"
            className="flex items-center pr-2 text-sm text-[var(--color-on-surface-variant)]"
          >
            ×
          </span>
          <button
            type="button"
            aria-label="Increase size multiplier"
            disabled={atMax}
            onClick={() => stepMultiplier(1)}
            className="w-8 border-l border-[var(--color-outline-variant)] text-sm text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-highest)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsPane() {
  const scalePointsByFee = useUiStore((state) => state.scalePointsByFee);
  const showAtlantaBoundary = useUiStore((state) => state.showAtlantaBoundary);
  const setScalePointsByFee = useUiStore((state) => state.setScalePointsByFee);
  const setShowAtlantaBoundary = useUiStore((state) => state.setShowAtlantaBoundary);
  const pointSizeMode: PointSizeMode = scalePointsByFee ? 'fee' : 'uniform';

  return (
    <section aria-label="Settings" className="flex h-full min-h-0 flex-col">
      <PaneHeader title="Settings" />
      <div className="min-h-0 overflow-y-auto pr-1">
        <h3
          id="point-size-heading"
          className="text-[11px] font-medium tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)] uppercase"
        >
          Point size
        </h3>
        <div
          role="radiogroup"
          aria-labelledby="point-size-heading"
          className="mt-2 grid grid-cols-2 gap-2"
        >
          {POINT_SIZE_OPTIONS.map((option) => {
            const selected = option.id === pointSizeMode;
            return (
              <label
                key={option.id}
                className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-round-four)] border px-2 py-4 text-center has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-primary)] ${
                  selected
                    ? 'border-[var(--color-primary)] bg-[var(--color-nav-active-bg)]'
                    : 'border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)]'
                }`}
              >
                <input
                  type="radio"
                  name="point-size-mode"
                  value={option.id}
                  checked={selected}
                  onChange={() => setScalePointsByFee(option.id === 'fee')}
                  className="sr-only"
                />
                <PointSizeMark mode={option.id} />
                <span className="text-sm font-medium text-[var(--color-on-surface)]">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
        {scalePointsByFee ? <SizeMultiplierControl /> : null}
        <h3 className="mt-5 text-[11px] font-medium tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)] uppercase">
          Map overlay
        </h3>
        <div className="mt-2 flex items-center gap-3 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] px-3 py-2.5">
          <AtlantaBoundaryIcon className="h-8 w-7 shrink-0 text-[var(--color-primary)]" />
          <div className="min-w-0">
            <p
              id="atlanta-city-limits-label"
              className="text-sm font-medium text-[var(--color-on-surface)]"
            >
              Atlanta city limits
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showAtlantaBoundary}
            aria-labelledby="atlanta-city-limits-label"
            onClick={() => setShowAtlantaBoundary(!showAtlantaBoundary)}
            className={`relative ml-auto h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
              showAtlantaBoundary
                ? 'bg-[var(--color-primary)]'
                : 'bg-[var(--color-surface-container-highest)]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                showAtlantaBoundary ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      <p className="mt-3 flex shrink-0 items-center gap-2 border-t border-[var(--color-outline-variant)] pt-3 text-xs text-[var(--color-on-surface-variant)]">
        <span
          className="material-symbols-outlined text-[16px] text-[var(--color-primary)]"
          aria-hidden="true"
        >
          check
        </span>
        Changes apply as you go
      </p>
    </section>
  );
}
