import { formatYearMonthLabel, fromYearMonthKey, toYearMonthKey } from '../../utils/date';
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
  const minAvailableMonthKey = useFilterStore((state) => state.minAvailableMonthKey);
  const maxAvailableMonthKey = useFilterStore((state) => state.maxAvailableMonthKey);
  const minMonthKey = useFilterStore((state) => state.minMonthKey);
  const maxMonthKey = useFilterStore((state) => state.maxMonthKey);
  const yearFilterMode = useFilterStore((state) => state.yearFilterMode);
  const hasAvailableMonths = useFilterStore((state) => state.hasAvailableMonths);
  const setMinMonthKey = useFilterStore((state) => state.setMinMonthKey);
  const setMaxMonthKey = useFilterStore((state) => state.setMaxMonthKey);
  const setYearFilterMode = useFilterStore((state) => state.setYearFilterMode);
  // The timeline is drawn one tick past the real data so we can show a
  // decorative year marker at the very end. It is rendered through the same
  // tick/label path as every other year, but the slider cannot select it.
  const SPOTLIGHT_YEAR = 2026;
  const spotlightMonthKey = toYearMonthKey({ year: SPOTLIGHT_YEAR, monthIndex: 0 });
  const displayMaxMonthKey = Math.max(maxAvailableMonthKey, spotlightMonthKey);
  const rangeSpan = Math.max(displayMaxMonthKey - minAvailableMonthKey, 1);
  const percentForMonthKey = (monthKey: number) =>
    ((monthKey - minAvailableMonthKey) / rangeSpan) * 100;
  // Native range thumbs are inset by half their width at each end, so their
  // center only travels from THUMB_SIZE/2 to (width - THUMB_SIZE/2). Map tick
  // and label positions onto that same travel so they align with the thumbs.
  const THUMB_SIZE = 16;
  const leftForMonthKey = (monthKey: number) =>
    `calc(${THUMB_SIZE / 2}px + ${percentForMonthKey(monthKey) / 100} * (100% - ${THUMB_SIZE}px))`;
  const isSliderDisabled = !hasAvailableMonths || minAvailableMonthKey === maxAvailableMonthKey;
  const isRangeMode = yearFilterMode === 'range';
  const liveRangeLabel = hasAvailableMonths
    ? isRangeMode
      ? `${formatYearMonthLabel(fromYearMonthKey(minMonthKey))} - ${formatYearMonthLabel(
          fromYearMonthKey(maxMonthKey),
        )}`
      : `Through ${formatYearMonthLabel(fromYearMonthKey(maxMonthKey))}`
    : '--';

  const monthKeys: number[] = [];
  for (let monthKey = minAvailableMonthKey; monthKey <= displayMaxMonthKey; monthKey += 1) {
    monthKeys.push(monthKey);
  }

  const minAvailableYear = Math.floor(minAvailableMonthKey / 12);
  const displayMaxYear = Math.floor(displayMaxMonthKey / 12);
  const totalYears = Math.max(displayMaxYear - minAvailableYear + 1, 1);
  const yearLabelInterval = totalYears <= 8 ? 1 : totalYears <= 16 ? 2 : totalYears <= 40 ? 5 : 10;

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
      <div className="mt-4">
        <p className="text-center text-sm font-semibold text-[var(--color-on-surface)]">
          {liveRangeLabel}
        </p>
        <div className="year-range relative mt-3 h-10">
          <div
            className="absolute top-1/2 h-px -translate-y-1/2 bg-[var(--color-outline-variant)]"
            style={{ left: `${THUMB_SIZE / 2}px`, right: `${THUMB_SIZE / 2}px` }}
          />
          {monthKeys.map((monthKey) => {
            const { year, monthIndex } = fromYearMonthKey(monthKey);
            const isYearTicker = monthIndex === 0;
            const isActive = isRangeMode
              ? monthKey >= minMonthKey && monthKey <= maxMonthKey
              : monthKey <= maxMonthKey;
            return (
              <span
                key={monthKey}
                aria-hidden="true"
                className={[
                  'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                  isYearTicker ? 'w-1.5 h-7' : 'h-4 w-px',
                  isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-outline-variant)]',
                ].join(' ')}
                style={{ left: leftForMonthKey(monthKey) }}
                title={isYearTicker ? String(year) : undefined}
              />
            );
          })}
          {isRangeMode ? (
            <>
              <input
                type="range"
                min={minAvailableMonthKey}
                max={displayMaxMonthKey}
                step={1}
                value={minMonthKey}
                disabled={isSliderDisabled}
                onChange={(event) => {
                  const nextMinMonthKey = Math.min(Number(event.target.value), maxMonthKey - 1);
                  setMinMonthKey(nextMinMonthKey);
                }}
                className="year-range-input absolute left-0 top-1/2 h-10 w-full -translate-y-1/2"
              />
              <input
                type="range"
                min={minAvailableMonthKey}
                max={displayMaxMonthKey}
                step={1}
                value={maxMonthKey}
                disabled={isSliderDisabled}
                onChange={(event) => {
                  const nextMaxMonthKey = Math.min(
                    Math.max(Number(event.target.value), minMonthKey + 1),
                    maxAvailableMonthKey,
                  );
                  setMaxMonthKey(nextMaxMonthKey);
                }}
                className="year-range-input absolute left-0 top-1/2 h-10 w-full -translate-y-1/2"
              />
            </>
          ) : (
            <input
              type="range"
              min={minAvailableMonthKey}
              max={displayMaxMonthKey}
              step={1}
              value={maxMonthKey}
              disabled={isSliderDisabled}
              onChange={(event) => {
                setMaxMonthKey(Math.min(Number(event.target.value), maxAvailableMonthKey));
              }}
              className="year-range-input absolute left-0 top-1/2 h-10 w-full -translate-y-1/2"
            />
          )}
        </div>
        <div className="relative mt-1 h-4">
          {monthKeys.map((monthKey) => {
            const { year, monthIndex } = fromYearMonthKey(monthKey);
            const shouldShowYearLabel =
              monthIndex === 0 &&
              (year === minAvailableYear ||
                year === displayMaxYear ||
                (year - minAvailableYear) % yearLabelInterval === 0);
            if (!shouldShowYearLabel) {
              return null;
            }
            return (
              <span
                key={`year-label-${monthKey}`}
                className="absolute -translate-x-1/2 text-[10px] text-[var(--color-on-surface-variant)]"
                style={{ left: leftForMonthKey(monthKey) }}
              >
                {year}
              </span>
            );
          })}
        </div>
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
