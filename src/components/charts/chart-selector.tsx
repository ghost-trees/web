import { CHART_DEFINITIONS, type ChartId } from './chart-definitions';

type ChartSelectorProps = {
  value: ChartId;
  onChange: (chartId: ChartId) => void;
};

export function ChartSelector({ value, onChange }: ChartSelectorProps) {
  return (
    <div className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4">
      <label
        htmlFor="chart-selector"
        className="text-xs uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]"
      >
        Chart
      </label>
      <div className="relative mt-3">
        <select
          id="chart-selector"
          value={value}
          onChange={(event) => onChange(event.target.value as ChartId)}
          className="w-full appearance-none rounded-[var(--radius-round-three)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 pr-10 text-sm text-[var(--color-on-surface)] outline-none transition focus:border-[var(--color-primary)]"
        >
          {CHART_DEFINITIONS.map((chart) => (
            <option key={chart.id} value={chart.id}>
              {chart.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-on-surface-variant)]"
        >
          expand_more
        </span>
      </div>
    </div>
  );
}
