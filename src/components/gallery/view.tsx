/**
 * @file view.tsx
 * @description
 * Gallery view: a before/after Street View comparison for curated records.
 *
 * Imagery is served live from the Google Street View Static API. Google's Street
 * View Static API policy REQUIRES a visible Google attribution wherever this
 * imagery is displayed. The "© Google" mark rendered beneath the slider satisfies
 * that requirement and MUST NOT be removed while Street View imagery is shown.
 */

import { useEffect, useMemo, useState } from 'react';
import { useUiStore } from '../../state/ui-store';
import { useMapSelectionStore } from '../../state/selection-store';
import { useFilterStore } from '../../state/filter-store';
import type { MapPoint } from '../../state/data-store';
import { useDataStore } from '../../state/data-store';
import { formatTreeTypeList, UNKNOWN_DISPLAY_VALUE } from '../../utils/tree-type';
import { extractStreetLine, extractZipCode } from '../../utils/string';
import { GALLERY_RECORDS } from './gallery-records';
import { BeforeAfterSlider } from './before-after-slider';
import { buildStreetViewUrl } from './street-view';

const STREET_VIEW_API_KEY = import.meta.env.VITE_GOOGLE_STREET_VIEW_API_KEY;

const UNKNOWN_VALUE = UNKNOWN_DISPLAY_VALUE;
const feeFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function parseAddressDetails(address: string) {
  const normalizedAddress = address.trim();
  if (!normalizedAddress || normalizedAddress.toLowerCase() === 'unknown') {
    return { streetLine: UNKNOWN_VALUE, zipCode: UNKNOWN_VALUE };
  }

  const streetLine = extractStreetLine(normalizedAddress) ?? UNKNOWN_VALUE;
  const zipCode = extractZipCode(normalizedAddress) ?? UNKNOWN_VALUE;
  return { streetLine, zipCode };
}

function getPointDisplayData(point: MapPoint | null) {
  if (!point) {
    return {
      pointId: UNKNOWN_VALUE,
      date: UNKNOWN_VALUE,
      recordType: UNKNOWN_VALUE,
      treeTypeLabel: UNKNOWN_VALUE,
      streetLine: UNKNOWN_VALUE,
      zipCode: UNKNOWN_VALUE,
      feeLabel: feeFormatter.format(0),
    };
  }

  const { streetLine, zipCode } = parseAddressDetails(point.address);
  return {
    pointId: point.id,
    date: point.date,
    recordType: point.recordType,
    treeTypeLabel: formatTreeTypeList(point.treeTypes),
    streetLine,
    zipCode,
    feeLabel: feeFormatter.format(point.feeTotal),
  };
}

export function GalleryView() {
  const showMaps = useUiStore((state) => state.showMaps);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const requestFocus = useMapSelectionStore((state) => state.requestFocus);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const pointsById = useDataStore((state) => state.pointsById);
  const loadPoints = useDataStore((state) => state.loadPoints);

  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    GALLERY_RECORDS[0]?.recordId ?? '',
  );

  useEffect(() => {
    void loadPoints();
  }, [loadPoints]);

  const selectedRecord = useMemo(
    () => GALLERY_RECORDS.find((record) => record.recordId === selectedRecordId) ?? null,
    [selectedRecordId],
  );
  const selectedPoint = selectedRecord ? (pointsById.get(selectedRecord.recordId) ?? null) : null;
  const selectedPointDisplay = useMemo(() => getPointDisplayData(selectedPoint), [selectedPoint]);

  const streetViewUrls = useMemo(() => {
    if (!selectedRecord) {
      return { before: '', after: '' };
    }
    return {
      before: buildStreetViewUrl({ ...selectedRecord.before, apiKey: STREET_VIEW_API_KEY }) ?? '',
      after: buildStreetViewUrl({ ...selectedRecord.after, apiKey: STREET_VIEW_API_KEY }) ?? '',
    };
  }, [selectedRecord]);

  const handleShowOnMap = (point: MapPoint) => {
    resetFilters();
    replaceSelection([point.id]);
    requestFocus(point.coordinates);
    showMaps();
  };

  return (
    <section
      aria-label="Gallery View"
      className="relative h-full min-h-0 w-full overflow-y-auto bg-[var(--color-surface-container-low)]"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-8 pb-16 sm:px-8 md:pt-12">
        <header>
          <p className="text-[11px] uppercase tracking-label-meta text-on-surface-variant">
            Gallery
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[var(--tracking-display-tight)] text-on-surface md:text-3xl">
            Before &amp; After Loss
          </h2>
        </header>

        <div className="mt-8 flex flex-col gap-6 md:flex-row">
          <nav aria-label="Featured records" className="w-full shrink-0 md:w-72">
            <ul className="flex flex-col gap-[var(--spacing-list-item-gap)]">
              {GALLERY_RECORDS.map((record) => {
                const point = pointsById.get(record.recordId);
                const isActive = record.recordId === selectedRecordId;
                const { streetLine } = parseAddressDetails(point?.address ?? UNKNOWN_VALUE);
                const feeLabel = feeFormatter.format(point?.feeTotal ?? 0);

                return (
                  <li key={record.recordId}>
                    <div
                      className={`flex items-center gap-1 rounded-round-four transition-colors ${
                        isActive
                          ? 'bg-surface-container-highest'
                          : 'hover:bg-surface-container-high'
                      }`}
                    >
                      <button
                        type="button"
                        aria-current={isActive ? 'true' : undefined}
                        onClick={() => setSelectedRecordId(record.recordId)}
                        className={`min-w-0 flex-1 rounded-round-four px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isActive
                            ? 'text-on-surface'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="block truncate text-sm font-semibold text-on-surface">
                          {streetLine}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                          {(point?.date ?? UNKNOWN_VALUE) + ' · ' + feeLabel}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="Show on map"
                        title="Show on map"
                        disabled={!point}
                        onClick={() => point && handleShowOnMap(point)}
                        className="mr-1 inline-flex shrink-0 items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">
                          map
                        </span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">
            {selectedRecord ? (
              <figure className="flex flex-col gap-4">
                <BeforeAfterSlider
                  beforeImage={streetViewUrls.before}
                  afterImage={streetViewUrls.after}
                  alt={`Record ${selectedPointDisplay.pointId}`}
                />
                {/*
                  Required Google attribution for Street View Static imagery.
                  Google's policy mandates a visible attribution wherever this
                  imagery is shown; do not remove while Street View is displayed.
                */}
                <p className="-mt-2 text-right text-[10px] text-on-surface-variant">© Google</p>
                <figcaption className="overflow-hidden rounded-round-four bg-surface-container-highest shadow-ambient">
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-label-meta text-primary">
                          Record Details
                        </p>
                        <h3 className="text-lg font-bold leading-tight text-on-surface">
                          {selectedPointDisplay.pointId}
                        </h3>
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
                        <span className="text-xs font-semibold text-on-surface tabular-nums">
                          {selectedPointDisplay.date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant">Record Type</span>
                        <span className="text-right text-xs font-semibold text-on-surface">
                          {selectedPointDisplay.recordType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant">Fee</span>
                        <span className="text-right text-xs font-semibold text-on-surface tabular-nums">
                          {selectedPointDisplay.feeLabel}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs text-on-surface-variant">Tree Type</span>
                        <span className="max-w-44 text-right text-xs font-semibold text-on-surface">
                          {selectedPointDisplay.treeTypeLabel}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs text-on-surface-variant">Address</span>
                        <span className="max-w-44 text-right text-xs font-semibold text-on-surface">
                          {selectedPointDisplay.streetLine}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-on-surface-variant">ZIP</span>
                        <span className="max-w-44 text-right text-xs font-semibold text-on-surface">
                          {selectedPointDisplay.zipCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </figcaption>
              </figure>
            ) : (
              <p className="text-sm text-on-surface-variant">No record selected.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
