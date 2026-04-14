/**
 * @file asset.ts
 * @description
 * Utility for building correct URLs to static assets under the project's `public/` directory.
 *
 * This function ensures assets resolve properly in both:
 * - Development, where assets are served from the root "/"
 * - Static builds / production, where assets may be served from a subpath
 *   defined by Vite's base config (exposed via import.meta.env.BASE_URL)
 */
export const asset = (path: string): string => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const cleanPath = String(path).replace(/^\//, '');
  return `${base}/${cleanPath}`;
};
