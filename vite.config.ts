/**
 * @file vite.config.ts
 * @description
 * Vite configuration for the frontend build.
 *
 * - Uses SWC for fast React + TypeScript compilation
 * - Supports `@/` path alias for clean imports
 * - Allows deployment under a custom base path via `VITE_BASE_PATH`
 */

import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const basePath = process.env.VITE_BASE_PATH ?? '/';
const enableSourceMaps = process.env.VITE_SOURCEMAP === 'true';

// Build-only note printed right after Vite's chunk-size warning so a reader who sees it in a
// terminal or CI log knows the warning is intentional, not a regression. `closeBundle` runs
// after the bundle is written (after the warning), and `apply: 'build'` keeps it out of dev.
// See docs/frontend-loading.md.
function chunkSizeNotePlugin(): Plugin {
  return {
    name: 'ghosttrees:chunk-size-note',
    apply: 'build',
    closeBundle() {
      console.log(
        [
          '',
          'Note: the 500 kB chunk-size warning above is expected after intentional code-splitting.',
          'It reflects individually large vendor chunks (maplibre-gl is the dominant first-load',
          'one, plus deck.gl, and the lazy ECharts Charts chunk), not one combined bundle.',
          'ECharts is off the first-load path (warmed after the map is healthy, or loaded on demand',
          "if warmup was skipped); maplibre-gl / deck.gl are the map's critical path and cannot be",
          'split further. chunkSizeWarningLimit is intentionally left untouched. See',
          'docs/frontend-loading.md.',
          '',
        ].join('\n'),
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,

  plugins: [react(), tailwindcss(), chunkSizeNotePlugin()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Enables clean "@/..." imports
      // Force Node child_process imports to a browser shim so transitive deps
      // (for example loaders.gl worker process helpers) cannot pull Node-only APIs
      // into the client bundle.
      child_process: path.resolve(__dirname, 'src/shims/child-process-browser.ts'),
      'node:child_process': path.resolve(__dirname, 'src/shims/child-process-browser.ts'),
    },
  },

  build: {
    outDir: 'dist',
    // Keep source maps opt-in for production; enable with VITE_SOURCEMAP=true.
    sourcemap: enableSourceMaps,
    rollupOptions: {
      output: {
        // Split heavy, cache-stable vendors out of the app chunk so first-load JS is
        // several parallel files instead of one megabyte-plus bundle, and app edits do
        // not bust the map-library cache. ECharts is intentionally omitted here so it
        // stays in its own lazy Charts chunk. See docs/frontend-loading.md.
        manualChunks: {
          maplibre: ['maplibre-gl'],
          deck: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/mapbox'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },

  test: {
    globals: true,
    environment: 'node',
  },
});
