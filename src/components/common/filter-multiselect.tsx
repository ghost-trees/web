type FilterMultiselectProps = {
  label: string;
  options: string[];
  enabledOptions: Set<string>;
  optionCounts?: ReadonlyMap<string, number>;
  formatOptionLabel?: (option: string) => string;
  emptyMessage: string;
  onOptionEnabledChange: (option: string, enabled: boolean) => void;
  onSetAllEnabled: (enabled: boolean) => void;
};

export function FilterMultiselect({
  label,
  options,
  enabledOptions,
  optionCounts,
  formatOptionLabel,
  emptyMessage,
  onOptionEnabledChange,
  onSetAllEnabled,
}: FilterMultiselectProps) {
  const totalOptions = options.length;
  const enabledCount = options.filter((option) => enabledOptions.has(option)).length;
  const summaryLabel =
    totalOptions === 0
      ? `No ${label.toLowerCase()} available`
      : `${enabledCount} of ${totalOptions} selected`;

  return (
    <div className="mt-3 rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4">
      <p className="text-xs uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
        {label}
      </p>
      <details className="mt-3 group">
        <summary className="cursor-pointer list-none rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-on-surface)]">
          <span className="flex items-center justify-between gap-3">
            <span>{summaryLabel}</span>
            <span className="text-xs text-[var(--color-on-surface-variant)] group-open:hidden">
              Open
            </span>
            <span className="hidden text-xs text-[var(--color-on-surface-variant)] group-open:inline">
              Close
            </span>
          </span>
        </summary>
        <div className="mt-2 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
          {totalOptions === 0 ? (
            <p className="text-xs text-[var(--color-on-surface-variant)]">{emptyMessage}</p>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSetAllEnabled(true);
                  }}
                  className="rounded border border-[var(--color-outline-variant)] px-2 py-1 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetAllEnabled(false);
                  }}
                  className="rounded border border-[var(--color-outline-variant)] px-2 py-1 text-xs text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-on-surface)]"
                  >
                    <input
                      type="checkbox"
                      style={{ accentColor: 'var(--color-primary)' }}
                      checked={enabledOptions.has(option)}
                      onChange={(event) => {
                        onOptionEnabledChange(option, event.target.checked);
                      }}
                    />
                    {formatOptionLabel ? formatOptionLabel(option) : option} (
                    {optionCounts?.get(option) ?? 0})
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
