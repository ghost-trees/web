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
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const basePath = process.env.VITE_BASE_PATH ?? '/';
const enableSourceMaps = process.env.VITE_SOURCEMAP === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Enables clean "@/..." imports
    },
  },

  build: {
    outDir: 'dist',
    // Keep source maps opt-in for production; enable with VITE_SOURCEMAP=true.
    sourcemap: enableSourceMaps,
  },

  test: {
    globals: true,
    environment: 'node',
  },
});
