# Styles Conventions

Global styles in this folder are loaded by `src/main.tsx` via `src/styles/index.css`.

## Structure

- `tokens.css`: Tailwind import plus design tokens (`@theme`).
- `globals.css`: base layer defaults (`@layer base`).
- Optional later: `utilities.css`, `breakpoints.css`.

## Import Order (`index.css`)

1. `tokens.css`
2. `globals.css`
3. Any additional global style files

Keep this order so later files can intentionally override earlier rules.

## Rules

- Keep component and feature-specific styles next to components, not in `src/styles`.
- Use semantic `--color-*` tokens instead of raw Tailwind palette classes for component colors.
- Prefer tonal surface tiers over decorative borders and dividers.
- Keep focus states token-based (for example, `--color-primary` or a dedicated focus token).
