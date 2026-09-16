/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STADIA_STYLE_URL?: string;
  readonly VITE_STADIA_RASTER_TILE_URL?: string;
  readonly VITE_GOOGLE_STREET_VIEW_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
