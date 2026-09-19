import { describe, expect, it } from 'vitest';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { boundsOfFeatureCollection, viewStateForBounds } from './geo-bounds';

function collectionOf(
  ...geometries: (Geometry | null)[]
): FeatureCollection<Geometry, GeoJsonProperties> {
  return {
    type: 'FeatureCollection',
    features: geometries.map((geometry) => ({
      type: 'Feature',
      properties: null,
      geometry: geometry as Geometry,
    })),
  };
}

describe('boundsOfFeatureCollection', () => {
  it('walks every ring of a MultiPolygon', () => {
    const collection = collectionOf({
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-84.5, 33.6],
            [-84.3, 33.6],
            [-84.3, 33.8],
            [-84.5, 33.8],
            [-84.5, 33.6],
          ],
        ],
        [
          [
            [-84.2, 33.9],
            [-84.1, 33.9],
            [-84.1, 34.0],
            [-84.2, 34.0],
            [-84.2, 33.9],
          ],
        ],
      ],
    });

    expect(boundsOfFeatureCollection(collection)).toEqual([-84.5, 33.6, -84.1, 34.0]);
  });

  it('combines mixed geometry types across features', () => {
    const collection = collectionOf(
      { type: 'Point', coordinates: [-84.4, 33.75] },
      {
        type: 'LineString',
        coordinates: [
          [-84.6, 33.7],
          [-84.2, 33.9],
        ],
      },
      {
        type: 'GeometryCollection',
        geometries: [{ type: 'Point', coordinates: [-84.0, 33.5] }],
      },
    );

    expect(boundsOfFeatureCollection(collection)).toEqual([-84.6, 33.5, -84.0, 33.9]);
  });

  it('returns null when there is no usable geometry', () => {
    expect(boundsOfFeatureCollection(collectionOf())).toBeNull();
    expect(boundsOfFeatureCollection(collectionOf(null))).toBeNull();
  });
});

describe('viewStateForBounds', () => {
  const bounds = [-84.55, 33.64, -84.28, 33.89] as const;

  it('centers the camera on the bounds', () => {
    const viewState = viewStateForBounds({
      bounds: [...bounds],
      width: 800,
      height: 600,
      padding: 32,
    });

    expect(viewState).not.toBeNull();
    expect(viewState?.longitude).toBeCloseTo((bounds[0] + bounds[2]) / 2, 3);
    expect(viewState?.latitude).toBeCloseTo((bounds[1] + bounds[3]) / 2, 2);
    expect(viewState?.zoom).toBeGreaterThan(9);
  });

  it('zooms out for a smaller viewport', () => {
    const wide = viewStateForBounds({ bounds: [...bounds], width: 800, height: 600, padding: 32 });
    const narrow = viewStateForBounds({
      bounds: [...bounds],
      width: 320,
      height: 240,
      padding: 32,
    });

    expect(narrow?.zoom).toBeLessThan(wide?.zoom ?? 0);
  });

  it('clamps padding that would not leave room for the bounds', () => {
    const viewState = viewStateForBounds({
      bounds: [...bounds],
      width: 240,
      height: 120,
      padding: 200,
    });

    expect(viewState?.zoom).toBeGreaterThan(0);
  });

  it('returns null before the viewport has been measured', () => {
    expect(
      viewStateForBounds({ bounds: [...bounds], width: 0, height: 0, padding: 32 }),
    ).toBeNull();
  });
});
