/**
 * @file tooltip.tsx
 * @description
 * Floating tooltip shown for the currently selected map point.
 */

type MapTooltipProps = {
  pointId: string;
  date: string;
  recordType: string;
  address: string;
  x: number;
  y: number;
};

const UNKNOWN_VALUE = 'Unknown';

function parseAddressDetails(address: string) {
  const normalizedAddress = address.trim();

  if (!normalizedAddress || normalizedAddress.toLowerCase() === 'unknown') {
    return { streetLine: UNKNOWN_VALUE, zipCode: UNKNOWN_VALUE };
  }

  const [firstLineCandidate] = normalizedAddress.split(',');
  const streetLine = firstLineCandidate?.trim() || UNKNOWN_VALUE;
  const zipMatch = normalizedAddress.match(/\b(\d{5}(?:-\d{4})?)\b(?!.*\b\d{5}(?:-\d{4})?\b)/);
  const zipCode = zipMatch?.[1] ?? UNKNOWN_VALUE;

  return { streetLine, zipCode };
}

export function MapTooltip({ pointId, date, recordType, address, x, y }: MapTooltipProps) {
  const { streetLine, zipCode } = parseAddressDetails(address);

  return (
    <div
      className="pointer-events-none absolute z-30 w-72 translate-x-4 -translate-y-4"
      style={{ left: `${x}px`, top: `${y}px` }}
      role="status"
      aria-live="polite"
    >
      <div className="overflow-hidden rounded-round-four bg-surface-container-highest shadow-ambient">
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-label-meta text-primary">
                Record Details
              </p>
              <h3 className="text-lg font-bold leading-tight text-on-surface">{pointId}</h3>
            </div>
            <span
              className="material-symbols-outlined text-lg text-secondary-container"
              aria-hidden="true"
            >
              location_on
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Date</span>
              <span className="text-xs font-semibold text-on-surface tabular-nums">{date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Record Type</span>
              <span className="text-right text-xs font-semibold text-on-surface">{recordType}</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-on-surface-variant">Address</span>
              <span className="max-w-44 text-right text-xs font-semibold text-on-surface">
                {streetLine}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-on-surface-variant">ZIP</span>
              <span className="max-w-44 text-right text-xs font-semibold text-on-surface">
                {zipCode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
