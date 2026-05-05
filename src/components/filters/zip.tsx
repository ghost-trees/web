import { useMemo } from 'react';
import { FilterMultiselect } from '../common/filter-multiselect';
import { UNKNOWN_ZIP_CODE } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { UNKNOWN_DISPLAY_VALUE } from '../../utils/tree-type';

function formatZipCodeLabel(zipCode: string): string {
  return zipCode === UNKNOWN_ZIP_CODE ? UNKNOWN_DISPLAY_VALUE : zipCode;
}

export function Zip() {
  const allPoints = useFilterStore((state) => state.allPoints);
  const availableZipCodes = useFilterStore((state) => state.availableZipCodes);
  const enabledZipCodes = useFilterStore((state) => state.enabledZipCodes);
  const setZipCodeEnabled = useFilterStore((state) => state.setZipCodeEnabled);
  const setAllZipCodesEnabled = useFilterStore((state) => state.setAllZipCodesEnabled);

  const enabledZipCodeSet = useMemo(() => new Set(enabledZipCodes), [enabledZipCodes]);
  const zipCodeCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const point of allPoints) {
      counts.set(point.zipCode, (counts.get(point.zipCode) ?? 0) + 1);
    }

    return counts;
  }, [allPoints]);
  const sortedZipCodes = useMemo(
    () =>
      [...availableZipCodes].sort((leftZipCode, rightZipCode) => {
        if (leftZipCode === UNKNOWN_ZIP_CODE) {
          return 1;
        }
        if (rightZipCode === UNKNOWN_ZIP_CODE) {
          return -1;
        }
        return leftZipCode.localeCompare(rightZipCode, undefined, { numeric: true });
      }),
    [availableZipCodes],
  );

  return (
    <FilterMultiselect
      label="Zip Code"
      options={sortedZipCodes}
      enabledOptions={enabledZipCodeSet}
      optionCounts={zipCodeCounts}
      formatOptionLabel={formatZipCodeLabel}
      emptyMessage="Zip codes will appear here once records are loaded."
      onOptionEnabledChange={setZipCodeEnabled}
      onSetAllEnabled={setAllZipCodesEnabled}
    />
  );
}
