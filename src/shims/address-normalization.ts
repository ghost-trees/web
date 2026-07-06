/**
 * @file address-normalization.ts
 * @description
 * TEMP SHIM (data-ingestion): abbreviates verbose address tokens for display
 * (e.g. `Southwest` -> `SW`, `Street` -> `St`) as source records arrive from
 * `public/data.geojson`.
 *
 * Why this exists now:
 * Upstream GeoJSON currently stores fully spelled-out directional and street
 * suffix tokens, which make tooltip/address labels needlessly long. This module
 * is a stopgap normalization layer applied at ingest so the UI stays concise.
 *
 * Intended scope limits:
 * This only rewrites a fixed, known set of directional and street-suffix tokens
 * on word boundaries, including coercing already-abbreviated tokens (e.g. `DR`)
 * to their canonical casing (`Dr`). It deliberately does NOT geocode, reorder,
 * or otherwise semantically rewrite addresses.
 *
 * Removal condition:
 * Delete this shim (and its usage in `src/state/data-store.ts`) once the
 * upstream pipeline emits standardized/abbreviated address tokens directly in
 * the source data. See `docs/data-normalization.md` for the removal checklist.
 */

/**
 * Fixed map of lower-cased source tokens to their abbreviated display form.
 * Keys are matched case-insensitively on whole-word boundaries.
 */
const ADDRESS_TOKEN_ABBREVIATIONS: Readonly<Record<string, string>> = {
  north: 'N',
  south: 'S',
  east: 'E',
  west: 'W',
  northeast: 'NE',
  northwest: 'NW',
  southeast: 'SE',
  southwest: 'SW',
  street: 'St',
  avenue: 'Ave',
  boulevard: 'Blvd',
  drive: 'Dr',
  road: 'Rd',
  lane: 'Ln',
  court: 'Ct',
  circle: 'Cir',
  place: 'Pl',
  parkway: 'Pkwy',
};

/**
 * Full lookup used at replace time: the spelled-out map above, plus canonical
 * self-mappings for each abbreviation value so pre-abbreviated source tokens
 * (e.g. `DR`, `st`) are coerced to their canonical casing (`Dr`, `St`). The
 * lower-cased abbreviation keys do not collide with any spelled-out key.
 */
const ADDRESS_TOKEN_LOOKUP: Readonly<Record<string, string>> = {
  ...ADDRESS_TOKEN_ABBREVIATIONS,
  ...Object.fromEntries(
    Object.values(ADDRESS_TOKEN_ABBREVIATIONS).map((abbrev) => [abbrev.toLowerCase(), abbrev]),
  ),
};

const TOKEN_PATTERN = new RegExp(`\\b(${Object.keys(ADDRESS_TOKEN_LOOKUP).join('|')})\\b`, 'gi');

/**
 * Normalizes a raw source address into a shorter display form by abbreviating a
 * known set of directional and street-suffix tokens.
 *
 * Non-matching tokens (house numbers, POI names, etc.) are preserved as-is.
 * Surrounding whitespace and comma spacing are tidied so the result reads
 * cleanly in the UI.
 *
 * @param rawAddress The original address string from the source data.
 * @returns The abbreviated, whitespace-normalized display address.
 */
export function normalizeAddressForDisplay(rawAddress: string): string {
  const trimmed = rawAddress.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed
    .replace(TOKEN_PATTERN, (token) => ADDRESS_TOKEN_LOOKUP[token.toLowerCase()])
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
