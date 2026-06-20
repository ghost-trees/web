import { useFilterStore, type YearFilterMode } from '../../state/filter-store';

const yearModeOptions: { mode: YearFilterMode; label: string; title: string }[] = [
  {
    mode: 'range',
    label: 'Range',
    title: 'Filter between a start and end year',
  },
  {
    mode: 'through',
    label: 'Through',
    title: 'Show all data recorded through the selected year',
  },
];

export function Year() {
  const minAvailableYear = useFilterStore((state) => state.minAvailableYear);
  const maxAvailableYear = useFilterStore((state) => state.maxAvailableYear);
  const minYear = useFilterStore((state) => state.minYear);
  const maxYear = useFilterStore((state) => state.maxYear);
  const yearFilterMode = useFilterStore((state) => state.yearFilterMode);
  const hasAvailableYears = useFilterStore((state) => state.hasAvailableYears);
  const setMinYear = useFilterStore((state) => state.setMinYear);
  const setMaxYear = useFilterStore((state) => state.setMaxYear);
  const setYearFilterMode = useFilterStore((state) => state.setYearFilterMode);
  const rangeSpan = Math.max(maxAvailableYear - minAvailableYear, 1);
  const minPercent = ((minYear - minAvailableYear) / rangeSpan) * 100;
  const maxPercent = ((maxYear - minAvailableYear) / rangeSpan) * 100;
  const throughPercent = maxPercent;
  const isSliderDisabled = !hasAvailableYears || minAvailableYear === maxAvailableYear;
  const isRangeMode = yearFilterMode === 'range';

  return (
    <div className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
          Year
        </p>
        <div
          className="flex shrink-0 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-0.5"
          role="group"
          aria-label="Year filter mode"
        >
          {yearModeOptions.map(({ mode, label, title }) => {
            const isActive = yearFilterMode === mode;
            return (
              <button
                key={mode}
                type="button"
                title={title}
                aria-pressed={isActive}
                onClick={() => {
                  setYearFilterMode(mode);
                }}
                className={[
                  'rounded px-2 py-0.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                  isActive
                    ? 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]',
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        {isRangeMode ? (
          <>
            <span className="w-11 text-left text-sm font-semibold text-[var(--color-on-surface)]">
              {hasAvailableYears ? minYear : '--'}
            </span>
            <div className="year-range relative h-8 flex-1">
              <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-[var(--color-outline-variant)]/70" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]"
                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
              />
              <input
                type="range"
                min={minAvailableYear}
                max={maxAvailableYear}
                value={minYear}
                disabled={isSliderDisabled}
                onChange={(event) => {
                  const nextMinYear = Math.min(Number(event.target.value), maxYear - 1);
                  setMinYear(nextMinYear);
                }}
                className="year-range-input absolute left-0 top-1/2 h-8 w-full -translate-y-1/2"
              />
              <input
                type="range"
                min={minAvailableYear}
                max={maxAvailableYear}
                value={maxYear}
                disabled={isSliderDisabled}
                onChange={(event) => {
                  const nextMaxYear = Math.max(Number(event.target.value), minYear + 1);
                  setMaxYear(nextMaxYear);
                }}
                className="year-range-input absolute left-0 top-1/2 h-8 w-full -translate-y-1/2"
              />
            </div>
            <span className="w-11 text-right text-sm font-semibold text-[var(--color-on-surface)]">
              {hasAvailableYears ? maxYear : '--'}
            </span>
          </>
        ) : (
          <>
            <span className="w-11 text-left text-xs text-[var(--color-on-surface-variant)]">
              {hasAvailableYears ? minAvailableYear : '--'}
            </span>
            <div className="year-range relative h-8 flex-1">
              <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-[var(--color-outline-variant)]/70" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]"
                style={{ left: '0%', width: `${throughPercent}%` }}
              />
              <input
                type="range"
                min={minAvailableYear}
                max={maxAvailableYear}
                value={maxYear}
                disabled={isSliderDisabled}
                onChange={(event) => {
                  setMaxYear(Number(event.target.value));
                }}
                className="year-range-input absolute left-0 top-1/2 h-8 w-full -translate-y-1/2"
              />
            </div>
            <span className="w-11 text-right text-sm font-semibold text-[var(--color-on-surface)]">
              {hasAvailableYears ? maxYear : '--'}
            </span>
          </>
        )}
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
