/**
 * @file geo-bounds.ts
 * @description
 * Bounding box helpers for framing a camera on a GeoJSON feature. `atlanta.geojson` carries no
 * `bbox` member, so the Home playback map derives one from the city limit geometry and fits its
 * camera to it.
 */

import { WebMercatorViewport } from '@deck.gl/core';
import type { FeatureCollection, GeoJsonProperties, Geometry, Position } from 'geojson';

/** `[west, south, east, north]`, matching the GeoJSON `bbox` member order. */
export type BoundingBox = [number, number, number, number];

type CoordinateTree = Position | CoordinateTree[];

function extendWithCoordinates(bounds: BoundingBox, coordinates: CoordinateTree): void {
  if (typeof coordinates[0] === 'number') {
    const [longitude, latitude] = coordinates as Position;
    bounds[0] = Math.min(bounds[0], longitude);
    bounds[1] = Math.min(bounds[1], latitude);
    bounds[2] = Math.max(bounds[2], longitude);
    bounds[3] = Math.max(bounds[3], latitude);
    return;
  }

  for (const branch of coordinates as CoordinateTree[]) {
    extendWithCoordinates(bounds, branch);
  }
}

function extendWithGeometry(bounds: BoundingBox, geometry: Geometry | null): void {
  if (!geometry) {
    return;
  }

  if (geometry.type === 'GeometryCollection') {
    for (const member of geometry.geometries) {
      extendWithGeometry(bounds, member);
    }
    return;
  }

  extendWithCoordinates(bounds, geometry.coordinates);
}

/**
 * Bounding box covering every coordinate in the collection, or null when it holds no geometry.
 */
export function boundsOfFeatureCollection(
  collection: FeatureCollection<Geometry, GeoJsonProperties>,
): BoundingBox | null {
  const bounds: BoundingBox = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ];

  for (const feature of collection.features) {
    extendWithGeometry(bounds, feature.geometry);
  }

  return bounds.every(Number.isFinite) ? bounds : null;
}

type ViewStateForBoundsOptions = {
  bounds: BoundingBox;
  width: number;
  height: number;
  padding: number;
};

/**
 * Camera that frames `bounds` inside a `width` x `height` viewport. Returns null when the
 * viewport has not been measured yet.
 */
export function viewStateForBounds({ bounds, width, height, padding }: ViewStateForBoundsOptions) {
  if (width <= 0 || height <= 0) {
    return null;
  }

  // fitBounds rejects padding that leaves no room for the content itself.
  const maxPadding = Math.max(0, Math.floor(Math.min(width, height) / 2) - 1);
  const [west, south, east, north] = bounds;
  const { longitude, latitude, zoom } = new WebMercatorViewport({ width, height }).fitBounds(
    [
      [west, south],
      [east, north],
    ],
    { padding: Math.min(padding, maxPadding) },
  );

  return { longitude, latitude, zoom };
}
