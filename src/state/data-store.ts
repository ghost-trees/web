import { create } from 'zustand';
import { asset } from '../utils/asset';

// Internal sentinel for missing/empty tree type values from source data.
export const UNKNOWN_TREE_TYPE = '__unknown__';

type PointFeatureProperties = {
  record_number?: string;
  date?: string;
  record_type?: string;
  address?: string;
  tree_types?: string[];
  paid?: number | string;
  outstanding?: number | string;
};

type PointFeature = {
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties?: PointFeatureProperties;
};

type DataGeoJson = {
  type: 'FeatureCollection';
  features: PointFeature[];
};

export type MapPoint = {
  id: string;
  coordinates: [number, number];
  date: string;
  recordType: string;
  address: string;
  treeTypes: string[];
  feeTotal: number;
};

type DataStoreState = {
  points: MapPoint[];
  pointsById: Map<string, MapPoint>;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  loadPoints: () => Promise<void>;
  reloadPoints: () => Promise<void>;
};

function toMapPoints(data: DataGeoJson): MapPoint[] {
  const toSafeNumber = (value: number | string | undefined): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) && value > 0 ? value : 0;
    }
    if (typeof value === 'string') {
      const parsedValue = Number(value);
      return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    }
    return 0;
  };

  return data.features
    .filter((feature): feature is PointFeature => {
      return (
        feature.geometry?.type === 'Point' &&
        Array.isArray(feature.geometry.coordinates) &&
        feature.geometry.coordinates.length === 2
      );
    })
    .map((feature, index) => {
      const id = feature.properties?.record_number?.trim();
      const paid = toSafeNumber(feature.properties?.paid);
      const outstanding = toSafeNumber(feature.properties?.outstanding);
      const normalizedTreeTypes = Array.isArray(feature.properties?.tree_types)
        ? feature.properties.tree_types
            .filter((treeType): treeType is string => typeof treeType === 'string')
            .map((treeType) => treeType.trim().toLowerCase())
            .filter((treeType) => treeType.length > 0)
        : [];
      const uniqueTreeTypes = [...new Set(normalizedTreeTypes)];
      // Keep treeTypes non-empty so downstream filter/chart logic can treat unknown as a regular type.
      const treeTypes = uniqueTreeTypes.length > 0 ? uniqueTreeTypes : [UNKNOWN_TREE_TYPE];
      return {
        id: id && id.length > 0 ? id : `point-${index}`,
        coordinates: feature.geometry.coordinates,
        date: feature.properties?.date?.trim() || 'Unknown',
        recordType: feature.properties?.record_type?.trim() || 'Unknown',
        address: feature.properties?.address?.trim() || 'Unknown',
        treeTypes,
        feeTotal: paid + outstanding,
      };
    });
}

async function fetchPoints(): Promise<MapPoint[]> {
  const dataGeoJsonUrl = asset('data.geojson');
  const response = await fetch(dataGeoJsonUrl);
  if (!response.ok) {
    throw new Error(`Unable to load ${dataGeoJsonUrl}: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as DataGeoJson;
  return toMapPoints(data);
}

let activeLoadPromise: Promise<void> | null = null;

export const useDataStore = create<DataStoreState>((set, get) => ({
  points: [],
  pointsById: new Map<string, MapPoint>(),
  isLoading: false,
  error: null,
  hasLoaded: false,
  loadPoints: async () => {
    if (get().hasLoaded) {
      return;
    }
    if (activeLoadPromise) {
      return activeLoadPromise;
    }

    set({ isLoading: true, error: null });
    activeLoadPromise = (async () => {
      try {
        const points = await fetchPoints();
        set({
          points,
          pointsById: new Map(points.map((point) => [point.id, point])),
          isLoading: false,
          error: null,
          hasLoaded: true,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load points.',
        });
      } finally {
        activeLoadPromise = null;
      }
    })();

    return activeLoadPromise;
  },
  reloadPoints: async () => {
    if (activeLoadPromise) {
      return activeLoadPromise;
    }

    set({ isLoading: true, error: null, hasLoaded: false });
    activeLoadPromise = (async () => {
      try {
        const points = await fetchPoints();
        set({
          points,
          pointsById: new Map(points.map((point) => [point.id, point])),
          isLoading: false,
          error: null,
          hasLoaded: true,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load points.',
        });
      } finally {
        activeLoadPromise = null;
      }
    })();

    return activeLoadPromise;
  },
}));

export const selectPoints = (state: DataStoreState) => state.points;
export const selectPointCount = (state: DataStoreState) => state.points.length;
export const selectDataLoading = (state: DataStoreState) => state.isLoading;
export const selectDataError = (state: DataStoreState) => state.error;
export const makeSelectPointById =
  (pointId: string) =>
  (state: DataStoreState): MapPoint | null =>
    state.pointsById.get(pointId) ?? null;
