import { create } from 'zustand';
import { useDataStore } from './data-store';
import type { MapPoint } from './data-store';
import {
  formatYearMonthLabel,
  parsePointMonthKey,
  parseYearMonth,
  toYearMonthKey,
} from '../utils/date';

const FALLBACK_MONTH_KEY = new Date().getFullYear() * 12;

export type TimeFilterMode = 'range' | 'through';

export type FilterStoreState = {
  allPoints: MapPoint[];
  visiblePoints: MapPoint[];
  timelinePoints: MapPoint[];
  timelineMonths: {
    key: number;
    year: number;
    monthIndex: number;
    label: string;
    count: number;
    cumulativeCount: number;
  }[];
  hasAvailableMonths: boolean;
  minAvailableMonthKey: number;
  maxAvailableMonthKey: number;
  minMonthKey: number;
  maxMonthKey: number;
  timeFilterMode: TimeFilterMode;
  availableTreeTypes: string[];
  enabledTreeTypes: string[];
  availableZipCodes: string[];
  enabledZipCodes: string[];
  setSourcePoints: (points: MapPoint[]) => void;
  setMinMonthKey: (monthKey: number) => void;
  setMaxMonthKey: (monthKey: number) => void;
  setTimeFilterMode: (mode: TimeFilterMode) => void;
  setTreeTypeEnabled: (treeType: string, enabled: boolean) => void;
  setAllTreeTypesEnabled: (enabled: boolean) => void;
  setZipCodeEnabled: (zipCode: string, enabled: boolean) => void;
  setAllZipCodesEnabled: (enabled: boolean) => void;
};

function clampToBounds(value: number, minValue: number, maxValue: number): number {
  return Math.max(minValue, Math.min(maxValue, value));
}

function deriveAvailableMonths(points: MapPoint[]): {
  hasAvailableMonths: boolean;
  minAvailableMonthKey: number;
  maxAvailableMonthKey: number;
} {
  const monthKeys = points
    .map((point) => parsePointMonthKey(point.date))
    .filter((monthKey): monthKey is number => monthKey !== null);

  if (monthKeys.length === 0) {
    return {
      hasAvailableMonths: false,
      minAvailableMonthKey: FALLBACK_MONTH_KEY,
      maxAvailableMonthKey: FALLBACK_MONTH_KEY,
    };
  }

  return {
    hasAvailableMonths: true,
    minAvailableMonthKey: Math.min(...monthKeys),
    maxAvailableMonthKey: Math.max(...monthKeys),
  };
}

function normalizeRange({
  proposedMinMonthKey,
  proposedMaxMonthKey,
  minAvailableMonthKey,
  maxAvailableMonthKey,
}: {
  proposedMinMonthKey: number;
  proposedMaxMonthKey: number;
  minAvailableMonthKey: number;
  maxAvailableMonthKey: number;
}): { minMonthKey: number; maxMonthKey: number } {
  if (minAvailableMonthKey === maxAvailableMonthKey) {
    return { minMonthKey: minAvailableMonthKey, maxMonthKey: maxAvailableMonthKey };
  }

  const boundedMin = clampToBounds(proposedMinMonthKey, minAvailableMonthKey, maxAvailableMonthKey);
  const boundedMax = clampToBounds(proposedMaxMonthKey, minAvailableMonthKey, maxAvailableMonthKey);
  if (boundedMin <= boundedMax - 1) {
    return { minMonthKey: boundedMin, maxMonthKey: boundedMax };
  }

  if (proposedMinMonthKey <= boundedMin) {
    return {
      minMonthKey: boundedMin,
      maxMonthKey: Math.min(maxAvailableMonthKey, boundedMin + 1),
    };
  }

  return {
    minMonthKey: Math.max(minAvailableMonthKey, boundedMax - 1),
    maxMonthKey: boundedMax,
  };
}

function deriveAvailableTreeTypes(points: MapPoint[]): string[] {
  const treeTypeSet = new Set<string>();

  for (const point of points) {
    for (const treeType of point.treeTypes) {
      treeTypeSet.add(treeType);
    }
  }

  return [...treeTypeSet].sort((a, b) => a.localeCompare(b));
}

function deriveAvailableZipCodes(points: MapPoint[]): string[] {
  const zipCodeSet = new Set<string>();

  for (const point of points) {
    zipCodeSet.add(point.zipCode);
  }

  return [...zipCodeSet].sort((a, b) => a.localeCompare(b));
}

function pointMatchesTreeTypeAndZip(
  point: MapPoint,
  enabledTreeTypes: Set<string>,
  enabledZipCodes: Set<string>,
): boolean {
  const matchesTreeType = point.treeTypes.some((treeType) => enabledTreeTypes.has(treeType));
  if (!matchesTreeType) {
    return false;
  }

  return enabledZipCodes.has(point.zipCode);
}

function pointMatchesMonthFilter(
  monthKey: number | null,
  minMonthKey: number,
  maxMonthKey: number,
  timeFilterMode: TimeFilterMode,
): boolean {
  if (monthKey === null) {
    return false;
  }

  if (timeFilterMode === 'through') {
    return monthKey <= maxMonthKey;
  }

  return monthKey >= minMonthKey && monthKey <= maxMonthKey;
}

function buildVisiblePoints(
  points: MapPoint[],
  minMonthKey: number,
  maxMonthKey: number,
  timeFilterMode: TimeFilterMode,
  enabledTreeTypes: Set<string>,
  enabledZipCodes: Set<string>,
): MapPoint[] {
  return points.filter((point) => {
    const monthKey = parsePointMonthKey(point.date);
    if (!pointMatchesMonthFilter(monthKey, minMonthKey, maxMonthKey, timeFilterMode)) {
      return false;
    }

    return pointMatchesTreeTypeAndZip(point, enabledTreeTypes, enabledZipCodes);
  });
}

function buildTimelinePoints(
  points: MapPoint[],
  enabledTreeTypes: Set<string>,
  enabledZipCodes: Set<string>,
): MapPoint[] {
  return points.filter((point) => {
    if (!pointMatchesTreeTypeAndZip(point, enabledTreeTypes, enabledZipCodes)) {
      return false;
    }

    return parseYearMonth(point.date) !== null;
  });
}

function buildTimelineMonths(points: MapPoint[]): FilterStoreState['timelineMonths'] {
  const countsByMonth = new Map<number, number>();

  for (const point of points) {
    const yearMonth = parseYearMonth(point.date);
    if (!yearMonth) {
      continue;
    }

    const monthKey = toYearMonthKey(yearMonth);
    countsByMonth.set(monthKey, (countsByMonth.get(monthKey) ?? 0) + 1);
  }

  const orderedMonthKeys = [...countsByMonth.keys()].sort((left, right) => left - right);
  let runningTotal = 0;
  return orderedMonthKeys.map((monthKey) => {
    const count = countsByMonth.get(monthKey) ?? 0;
    const year = Math.floor(monthKey / 12);
    const monthIndex = monthKey - year * 12;
    runningTotal += count;
    return {
      key: monthKey,
      year,
      monthIndex,
      label: formatYearMonthLabel({ year, monthIndex }),
      count,
      cumulativeCount: runningTotal,
    };
  });
}

function deriveFilteredState(
  points: MapPoint[],
  minMonthKey: number,
  maxMonthKey: number,
  timeFilterMode: TimeFilterMode,
  enabledTreeTypes: string[],
  enabledZipCodes: string[],
): Pick<FilterStoreState, 'visiblePoints' | 'timelinePoints' | 'timelineMonths'> {
  const enabledTreeTypeSet = new Set(enabledTreeTypes);
  const enabledZipCodeSet = new Set(enabledZipCodes);
  const timelinePoints = buildTimelinePoints(points, enabledTreeTypeSet, enabledZipCodeSet);
  return {
    visiblePoints: buildVisiblePoints(
      points,
      minMonthKey,
      maxMonthKey,
      timeFilterMode,
      enabledTreeTypeSet,
      enabledZipCodeSet,
    ),
    timelinePoints,
    timelineMonths: buildTimelineMonths(timelinePoints),
  };
}

type FilterDerivationInputState = Pick<
  FilterStoreState,
  | 'allPoints'
  | 'minMonthKey'
  | 'maxMonthKey'
  | 'timeFilterMode'
  | 'enabledTreeTypes'
  | 'enabledZipCodes'
>;

function deriveFilteredSlicesFromState(
  state: FilterDerivationInputState,
): Pick<FilterStoreState, 'visiblePoints' | 'timelinePoints' | 'timelineMonths'> {
  return deriveFilteredState(
    state.allPoints,
    state.minMonthKey,
    state.maxMonthKey,
    state.timeFilterMode,
    state.enabledTreeTypes,
    state.enabledZipCodes,
  );
}

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  allPoints: [],
  visiblePoints: [],
  timelinePoints: [],
  timelineMonths: [],
  hasAvailableMonths: false,
  minAvailableMonthKey: FALLBACK_MONTH_KEY,
  maxAvailableMonthKey: FALLBACK_MONTH_KEY,
  minMonthKey: FALLBACK_MONTH_KEY,
  maxMonthKey: FALLBACK_MONTH_KEY,
  timeFilterMode: 'range',
  availableTreeTypes: [],
  enabledTreeTypes: [],
  availableZipCodes: [],
  enabledZipCodes: [],
  setSourcePoints: (points) => {
    const { hasAvailableMonths, minAvailableMonthKey, maxAvailableMonthKey } =
      deriveAvailableMonths(points);
    const availableTreeTypes = deriveAvailableTreeTypes(points);
    const availableZipCodes = deriveAvailableZipCodes(points);
    const state = get();
    const previousAvailableTreeTypes = new Set(state.availableTreeTypes);
    const previousEnabledTreeTypes = new Set(state.enabledTreeTypes);
    const previousAvailableZipCodes = new Set(state.availableZipCodes);
    const previousEnabledZipCodes = new Set(state.enabledZipCodes);
    const isFirstSourceLoad =
      state.allPoints.length === 0 &&
      state.availableTreeTypes.length === 0 &&
      state.availableZipCodes.length === 0;
    const nextEnabledTreeTypes = isFirstSourceLoad
      ? availableTreeTypes
      : availableTreeTypes.filter(
          (treeType) =>
            previousEnabledTreeTypes.has(treeType) || !previousAvailableTreeTypes.has(treeType),
        );
    const nextEnabledZipCodes = isFirstSourceLoad
      ? availableZipCodes
      : availableZipCodes.filter(
          (zipCode) =>
            previousEnabledZipCodes.has(zipCode) || !previousAvailableZipCodes.has(zipCode),
        );

    const nextRange = hasAvailableMonths
      ? normalizeRange({
          proposedMinMonthKey: state.hasAvailableMonths ? state.minMonthKey : minAvailableMonthKey,
          proposedMaxMonthKey: state.hasAvailableMonths ? state.maxMonthKey : maxAvailableMonthKey,
          minAvailableMonthKey,
          maxAvailableMonthKey,
        })
      : { minMonthKey: minAvailableMonthKey, maxMonthKey: maxAvailableMonthKey };

    const nextFilterState: FilterDerivationInputState = {
      allPoints: points,
      minMonthKey: nextRange.minMonthKey,
      maxMonthKey: nextRange.maxMonthKey,
      timeFilterMode: state.timeFilterMode,
      enabledTreeTypes: nextEnabledTreeTypes,
      enabledZipCodes: nextEnabledZipCodes,
    };
    const derivedState = deriveFilteredSlicesFromState(nextFilterState);

    set({
      allPoints: points,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
      hasAvailableMonths,
      minAvailableMonthKey,
      maxAvailableMonthKey,
      minMonthKey: nextRange.minMonthKey,
      maxMonthKey: nextRange.maxMonthKey,
      availableTreeTypes,
      enabledTreeTypes: nextEnabledTreeTypes,
      availableZipCodes,
      enabledZipCodes: nextEnabledZipCodes,
    });
  },
  setMinMonthKey: (monthKey) => {
    const state = get();
    if (!state.hasAvailableMonths || state.timeFilterMode === 'through') {
      return;
    }

    const nextRange = normalizeRange({
      proposedMinMonthKey: monthKey,
      proposedMaxMonthKey: state.maxMonthKey,
      minAvailableMonthKey: state.minAvailableMonthKey,
      maxAvailableMonthKey: state.maxAvailableMonthKey,
    });

    const derivedState = deriveFilteredSlicesFromState({
      allPoints: state.allPoints,
      minMonthKey: nextRange.minMonthKey,
      maxMonthKey: nextRange.maxMonthKey,
      timeFilterMode: state.timeFilterMode,
      enabledTreeTypes: state.enabledTreeTypes,
      enabledZipCodes: state.enabledZipCodes,
    });
    set({
      minMonthKey: nextRange.minMonthKey,
      maxMonthKey: nextRange.maxMonthKey,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
    });
  },
  setMaxMonthKey: (monthKey) => {
    const state = get();
    if (!state.hasAvailableMonths) {
      return;
    }

    if (state.timeFilterMode === 'through') {
      const nextMaxMonthKey = clampToBounds(
        monthKey,
        state.minAvailableMonthKey,
        state.maxAvailableMonthKey,
      );
      const derivedState = deriveFilteredSlicesFromState({
        allPoints: state.allPoints,
        minMonthKey: state.minMonthKey,
        maxMonthKey: nextMaxMonthKey,
        timeFilterMode: state.timeFilterMode,
        enabledTreeTypes: state.enabledTreeTypes,
        enabledZipCodes: state.enabledZipCodes,
      });
      set({
        maxMonthKey: nextMaxMonthKey,
        visiblePoints: derivedState.visiblePoints,
        timelinePoints: derivedState.timelinePoints,
        timelineMonths: derivedState.timelineMonths,
      });
      return;
    }

    const nextRange = normalizeRange({
      proposedMinMonthKey: state.minMonthKey,
      proposedMaxMonthKey: monthKey,
      minAvailableMonthKey: state.minAvailableMonthKey,
      maxAvailableMonthKey: state.maxAvailableMonthKey,
    });

    const derivedState = deriveFilteredSlicesFromState({
      allPoints: state.allPoints,
      minMonthKey: nextRange.minMonthKey,
      maxMonthKey: nextRange.maxMonthKey,
      timeFilterMode: state.timeFilterMode,
      enabledTreeTypes: state.enabledTreeTypes,
      enabledZipCodes: state.enabledZipCodes,
    });
    set({
      minMonthKey: nextRange.minMonthKey,
      maxMonthKey: nextRange.maxMonthKey,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
    });
  },
  setTimeFilterMode: (mode) => {
    const state = get();
    if (state.timeFilterMode === mode) {
      return;
    }

    const nextMinMonthKey =
      mode === 'through'
        ? state.minAvailableMonthKey
        : normalizeRange({
            proposedMinMonthKey: state.minMonthKey,
            proposedMaxMonthKey: state.maxMonthKey,
            minAvailableMonthKey: state.minAvailableMonthKey,
            maxAvailableMonthKey: state.maxAvailableMonthKey,
          }).minMonthKey;

    const derivedState = deriveFilteredSlicesFromState({
      allPoints: state.allPoints,
      minMonthKey: nextMinMonthKey,
      maxMonthKey: state.maxMonthKey,
      timeFilterMode: mode,
      enabledTreeTypes: state.enabledTreeTypes,
      enabledZipCodes: state.enabledZipCodes,
    });
    set({
      timeFilterMode: mode,
      minMonthKey: nextMinMonthKey,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
    });
  },
  setTreeTypeEnabled: (treeType, enabled) => {
    const state = get();
    const enabledTreeTypeSet = new Set(state.enabledTreeTypes);
    if (enabled) {
      enabledTreeTypeSet.add(treeType);
    } else {
      enabledTreeTypeSet.delete(treeType);
    }

    const nextEnabledTreeTypes = state.availableTreeTypes.filter((type) =>
      enabledTreeTypeSet.has(type),
    );
    const derivedState = deriveFilteredSlicesFromState({
      allPoints: state.allPoints,
      minMonthKey: state.minMonthKey,
      maxMonthKey: state.maxMonthKey,
      timeFilterMode: state.timeFilterMode,
      enabledTreeTypes: nextEnabledTreeTypes,
      enabledZipCodes: state.enabledZipCodes,
    });
    set({
      enabledTreeTypes: nextEnabledTreeTypes,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
    });
  },
  setAllTreeTypesEnabled: (enabled) => {
    const state = get();
    const nextEnabledTreeTypes = enabled ? state.availableTreeTypes : [];
    const derivedState = deriveFilteredSlicesFromState({
      allPoints: state.allPoints,
      minMonthKey: state.minMonthKey,
      maxMonthKey: state.maxMonthKey,
      timeFilterMode: state.timeFilterMode,
      enabledTreeTypes: nextEnabledTreeTypes,
      enabledZipCodes: state.enabledZipCodes,
    });
    set({
      enabledTreeTypes: nextEnabledTreeTypes,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
    });
  },
  setZipCodeEnabled: (zipCode, enabled) => {
    const state = get();
    const enabledZipCodeSet = new Set(state.enabledZipCodes);
    if (enabled) {
      enabledZipCodeSet.add(zipCode);
    } else {
      enabledZipCodeSet.delete(zipCode);
    }

    const nextEnabledZipCodes = state.availableZipCodes.filter((value) =>
      enabledZipCodeSet.has(value),
    );
    const derivedState = deriveFilteredSlicesFromState({
      allPoints: state.allPoints,
      minMonthKey: state.minMonthKey,
      maxMonthKey: state.maxMonthKey,
      timeFilterMode: state.timeFilterMode,
      enabledTreeTypes: state.enabledTreeTypes,
      enabledZipCodes: nextEnabledZipCodes,
    });
    set({
      enabledZipCodes: nextEnabledZipCodes,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
    });
  },
  setAllZipCodesEnabled: (enabled) => {
    const state = get();
    const nextEnabledZipCodes = enabled ? state.availableZipCodes : [];
    const derivedState = deriveFilteredSlicesFromState({
      allPoints: state.allPoints,
      minMonthKey: state.minMonthKey,
      maxMonthKey: state.maxMonthKey,
      timeFilterMode: state.timeFilterMode,
      enabledTreeTypes: state.enabledTreeTypes,
      enabledZipCodes: nextEnabledZipCodes,
    });
    set({
      enabledZipCodes: nextEnabledZipCodes,
      visiblePoints: derivedState.visiblePoints,
      timelinePoints: derivedState.timelinePoints,
      timelineMonths: derivedState.timelineMonths,
    });
  },
}));

export const selectVisiblePointCount = (state: FilterStoreState) => state.visiblePoints.length;
export const selectTotalPointCount = (state: FilterStoreState) => state.allPoints.length;
export const selectHasActiveFilters = (state: FilterStoreState) => {
  const hasTreeTypeFilter = state.enabledTreeTypes.length < state.availableTreeTypes.length;
  const hasZipCodeFilter = state.enabledZipCodes.length < state.availableZipCodes.length;
  const hasTimeFilter = state.hasAvailableMonths
    ? state.timeFilterMode === 'through'
      ? state.maxMonthKey < state.maxAvailableMonthKey
      : state.minMonthKey > state.minAvailableMonthKey ||
        state.maxMonthKey < state.maxAvailableMonthKey
    : false;

  return hasTreeTypeFilter || hasZipCodeFilter || hasTimeFilter;
};

useFilterStore.getState().setSourcePoints(useDataStore.getState().points);
useDataStore.subscribe((state, previousState) => {
  if (state.points !== previousState.points) {
    useFilterStore.getState().setSourcePoints(state.points);
  }
});
