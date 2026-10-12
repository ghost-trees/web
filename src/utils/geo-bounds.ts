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

export type ViewportPadding =
  | number
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

type ViewStateForBoundsOptions = {
  bounds: BoundingBox;
  width: number;
  height: number;
  padding: ViewportPadding;
};

function clampFitPadding(padding: ViewportPadding, width: number, height: number): ViewportPadding {
  // fitBounds rejects padding that leaves no room for the content itself.
  if (typeof padding === 'number') {
    const maxPadding = Math.max(0, Math.floor(Math.min(width, height) / 2) - 1);
    return Math.min(padding, maxPadding);
  }

  const maxHorizontal = Math.max(0, Math.floor(width / 2) - 1);
  const maxVertical = Math.max(0, Math.floor(height / 2) - 1);
  return {
    top: Math.min(padding.top ?? 0, maxVertical),
    right: Math.min(padding.right ?? 0, maxHorizontal),
    bottom: Math.min(padding.bottom ?? 0, maxVertical),
    left: Math.min(padding.left ?? 0, maxHorizontal),
  };
}

/**
 * Camera that frames `bounds` inside a `width` x `height` viewport. Returns null when the
 * viewport has not been measured yet.
 */
export function viewStateForBounds({ bounds, width, height, padding }: ViewStateForBoundsOptions) {
  if (width <= 0 || height <= 0) {
    return null;
  }

  const [west, south, east, north] = bounds;
  const { longitude, latitude, zoom } = new WebMercatorViewport({ width, height }).fitBounds(
    [
      [west, south],
      [east, north],
    ],
    { padding: clampFitPadding(padding, width, height) },
  );

  return { longitude, latitude, zoom };
}
