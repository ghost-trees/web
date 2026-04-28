import { create } from 'zustand';
import { useDataStore } from './data-store';
import type { MapPoint } from './data-store';

const FALLBACK_YEAR = new Date().getFullYear();

export type FilterStoreState = {
  allPoints: MapPoint[];
  visiblePoints: MapPoint[];
  hasAvailableYears: boolean;
  minAvailableYear: number;
  maxAvailableYear: number;
  minYear: number;
  maxYear: number;
  setSourcePoints: (points: MapPoint[]) => void;
  setMinYear: (year: number) => void;
  setMaxYear: (year: number) => void;
};

function parsePointYear(date: string): number | null {
  const dateYearMatch = date.match(/\b(\d{4})\b/);
  if (dateYearMatch) {
    const year = Number(dateYearMatch[1]);
    return Number.isFinite(year) ? year : null;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.getFullYear();
}

function clampToBounds(year: number, minYear: number, maxYear: number): number {
  return Math.max(minYear, Math.min(maxYear, year));
}

function deriveAvailableYears(points: MapPoint[]): {
  hasAvailableYears: boolean;
  minAvailableYear: number;
  maxAvailableYear: number;
} {
  const years = points
    .map((point) => parsePointYear(point.date))
    .filter((year): year is number => year !== null);

  if (years.length === 0) {
    return {
      hasAvailableYears: false,
      minAvailableYear: FALLBACK_YEAR,
      maxAvailableYear: FALLBACK_YEAR,
    };
  }

  return {
    hasAvailableYears: true,
    minAvailableYear: Math.min(...years),
    maxAvailableYear: Math.max(...years),
  };
}

function normalizeRange({
  proposedMinYear,
  proposedMaxYear,
  minAvailableYear,
  maxAvailableYear,
}: {
  proposedMinYear: number;
  proposedMaxYear: number;
  minAvailableYear: number;
  maxAvailableYear: number;
}): { minYear: number; maxYear: number } {
  if (minAvailableYear === maxAvailableYear) {
    return { minYear: minAvailableYear, maxYear: maxAvailableYear };
  }

  const boundedMin = clampToBounds(proposedMinYear, minAvailableYear, maxAvailableYear);
  const boundedMax = clampToBounds(proposedMaxYear, minAvailableYear, maxAvailableYear);
  if (boundedMin <= boundedMax - 1) {
    return { minYear: boundedMin, maxYear: boundedMax };
  }

  if (proposedMinYear <= boundedMin) {
    return { minYear: boundedMin, maxYear: Math.min(maxAvailableYear, boundedMin + 1) };
  }

  return { minYear: Math.max(minAvailableYear, boundedMax - 1), maxYear: boundedMax };
}

function buildVisiblePoints(points: MapPoint[], minYear: number, maxYear: number): MapPoint[] {
  return points.filter((point) => {
    const year = parsePointYear(point.date);
    return year !== null && year >= minYear && year <= maxYear;
  });
}

export const useFilterStore = create<FilterStoreState>((set, get) => ({
  allPoints: [],
  visiblePoints: [],
  hasAvailableYears: false,
  minAvailableYear: FALLBACK_YEAR,
  maxAvailableYear: FALLBACK_YEAR,
  minYear: FALLBACK_YEAR,
  maxYear: FALLBACK_YEAR,
  setSourcePoints: (points) => {
    const { hasAvailableYears, minAvailableYear, maxAvailableYear } = deriveAvailableYears(points);
    const state = get();

    const nextRange = hasAvailableYears
      ? normalizeRange({
          proposedMinYear: state.hasAvailableYears ? state.minYear : minAvailableYear,
          proposedMaxYear: state.hasAvailableYears ? state.maxYear : maxAvailableYear,
          minAvailableYear,
          maxAvailableYear,
        })
      : { minYear: minAvailableYear, maxYear: maxAvailableYear };

    set({
      allPoints: points,
      visiblePoints: buildVisiblePoints(points, nextRange.minYear, nextRange.maxYear),
      hasAvailableYears,
      minAvailableYear,
      maxAvailableYear,
      minYear: nextRange.minYear,
      maxYear: nextRange.maxYear,
    });
  },
  setMinYear: (year) => {
    const state = get();
    if (!state.hasAvailableYears) {
      return;
    }

    const nextRange = normalizeRange({
      proposedMinYear: year,
      proposedMaxYear: state.maxYear,
      minAvailableYear: state.minAvailableYear,
      maxAvailableYear: state.maxAvailableYear,
    });

    set({
      minYear: nextRange.minYear,
      maxYear: nextRange.maxYear,
      visiblePoints: buildVisiblePoints(state.allPoints, nextRange.minYear, nextRange.maxYear),
    });
  },
  setMaxYear: (year) => {
    const state = get();
    if (!state.hasAvailableYears) {
      return;
    }

    const nextRange = normalizeRange({
      proposedMinYear: state.minYear,
      proposedMaxYear: year,
      minAvailableYear: state.minAvailableYear,
      maxAvailableYear: state.maxAvailableYear,
    });

    set({
      minYear: nextRange.minYear,
      maxYear: nextRange.maxYear,
      visiblePoints: buildVisiblePoints(state.allPoints, nextRange.minYear, nextRange.maxYear),
    });
  },
}));

export const selectVisiblePointCount = (state: FilterStoreState) => state.visiblePoints.length;
export const selectTotalPointCount = (state: FilterStoreState) => state.allPoints.length;

useFilterStore.getState().setSourcePoints(useDataStore.getState().points);
useDataStore.subscribe((state, previousState) => {
  if (state.points !== previousState.points) {
    useFilterStore.getState().setSourcePoints(state.points);
  }
});
