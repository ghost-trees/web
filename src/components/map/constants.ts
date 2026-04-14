/**
 * @file constants.ts
 * @description
 * Shared constants for map view defaults and interaction thresholds.
 */

export const DEFAULT_STADIA_STYLE_URL =
  'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';
export const POINT_LAYER_ID = 'tree-points-layer';
export const BRUSH_MIN_PIXELS = 4;
export const POINT_RADIUS_DEFAULT = 4;
export const POINT_RADIUS_SELECTED = 6;
export const POINT_FILL_COLOR_DEFAULT: [number, number, number, number] = [164, 211, 147, 220];
export const POINT_FILL_COLOR_SELECTED: [number, number, number, number] = [255, 220, 64, 255];
export const POINT_LINE_COLOR_DEFAULT: [number, number, number, number] = [104, 155, 90, 255];
export const POINT_LINE_COLOR_SELECTED: [number, number, number, number] = [255, 244, 153, 255];
export const POINT_LINE_WIDTH_DEFAULT = 1;
export const POINT_LINE_WIDTH_SELECTED = 2;
export const INITIAL_CENTER: [number, number] = [-84.388, 33.749];
export const INITIAL_ZOOM = 10;
