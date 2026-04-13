/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STADIA_STYLE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
