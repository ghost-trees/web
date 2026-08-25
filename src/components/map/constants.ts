/**
 * @file constants.ts
 * @description
 * Shared constants for map view defaults and interaction thresholds.
 */

export const DEFAULT_STADIA_STYLE_URL =
  'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';
// Raster twin of the vector style above, for the Home playback map. Deck.gl renders that map
// without MapLibre, so it needs tile images rather than a style document.
export const DEFAULT_STADIA_RASTER_TILE_URL =
  'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png';
export const POINT_LAYER_ID = 'tree-points-layer';
export const ATLANTA_BOUNDARY_SOURCE_ID = 'atlanta-boundary-source';
export const ATLANTA_BOUNDARY_LAYER_ID = 'atlanta-boundary-layer';
export const BRUSH_MIN_PIXELS = 4;
export const POINT_RADIUS_DEFAULT = 3;
export const POINT_FILL_COLOR_DEFAULT: [number, number, number, number] = [164, 211, 147, 150];
export const POINT_FILL_COLOR_SELECTED: [number, number, number, number] = [255, 220, 64, 255];
export const POINT_LINE_COLOR_DEFAULT: [number, number, number, number] = [104, 155, 90, 255];
export const POINT_LINE_COLOR_SELECTED: [number, number, number, number] = [255, 244, 153, 255];
export const POINT_LINE_WIDTH_DEFAULT = 1;
export const POINT_LINE_WIDTH_SELECTED = 2;
export const INITIAL_CENTER: [number, number] = [-84.388, 33.8];
export const INITIAL_ZOOM = 10;
export const ATLANTA_BOUNDARY_LINE_WIDTH = 2;
// Matches --color-primary, used where a deck.gl layer cannot read a CSS custom property.
export const ATLANTA_BOUNDARY_LINE_COLOR: [number, number, number, number] = [164, 211, 147, 230];
