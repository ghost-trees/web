import { useState } from 'react';

export function Year() {
  const floorYear = 2010;
  const ceilingYear = 2026;
  const [minYear, setMinYear] = useState(2018);
  const [maxYear, setMaxYear] = useState(2024);
  const rangeSpan = ceilingYear - floorYear;
  const minPercent = ((minYear - floorYear) / rangeSpan) * 100;
  const maxPercent = ((maxYear - floorYear) / rangeSpan) * 100;

  return (
    <div className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4">
      <p className="text-xs uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
        Year
      </p>
      <div className="mt-4 flex items-center gap-3">
        <span className="w-11 text-left text-sm font-semibold text-[var(--color-on-surface)]">
          {minYear}
        </span>
        <div className="year-range relative h-8 flex-1">
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-[var(--color-outline-variant)]/70" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]"
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          />
          <input
            type="range"
            min={floorYear}
            max={ceilingYear}
            value={minYear}
            onChange={(event) => {
              const nextMinYear = Math.min(Number(event.target.value), maxYear - 1);
              setMinYear(nextMinYear);
            }}
            className="year-range-input absolute left-0 top-1/2 h-8 w-full -translate-y-1/2"
          />
          <input
            type="range"
            min={floorYear}
            max={ceilingYear}
            value={maxYear}
            onChange={(event) => {
              const nextMaxYear = Math.max(Number(event.target.value), minYear + 1);
              setMaxYear(nextMaxYear);
            }}
            className="year-range-input absolute left-0 top-1/2 h-8 w-full -translate-y-1/2"
          />
        </div>
        <span className="w-11 text-right text-sm font-semibold text-[var(--color-on-surface)]">
          {maxYear}
        </span>
      </div>
      <style>{`
        .year-range-input {
          appearance: none;
          background: transparent;
          pointer-events: none;
        }

        .year-range-input::-webkit-slider-thumb {
          appearance: none;
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 2px solid var(--color-primary);
          background: var(--color-on-surface);
          box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 22%, transparent);
          cursor: pointer;
        }

        .year-range-input::-moz-range-track {
          background: transparent;
        }

        .year-range-input::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 2px solid var(--color-primary);
          background: var(--color-on-surface);
          box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 22%, transparent);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
