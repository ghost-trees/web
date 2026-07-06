# Data Normalization (Temporary Shims)

## Problem Statement

Source records in [`public/data.geojson`](../public/data.geojson) store verbose
address strings that spell out directional and street-suffix tokens in full
(for example, `Southwest` instead of `SW`, or `Street` instead of `St`). These
long forms make map tooltips and address labels harder to scan.

Until the upstream data pipeline standardizes these tokens, the application
applies a temporary normalization shim at data-ingestion time so the UI stays
concise while the raw source value is preserved.

## Shim Classification

The repository uses two distinct kinds of shims. Keep them mentally separate:

| Kind                            | Purpose                                      | Example                                                                       |
| ------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| Browser/runtime (polyfill) shim | Replace a Node-only module in browser builds | [`src/shims/child-process-browser.ts`](../src/shims/child-process-browser.ts) |
| Data shim (this doc)            | Normalize source data as it enters the app   | [`src/shims/address-normalization.ts`](../src/shims/address-normalization.ts) |

## Where It Is Applied

- Normalization function: [`src/shims/address-normalization.ts`](../src/shims/address-normalization.ts)
- Applied during map-point creation in [`src/state/data-store.ts`](../src/state/data-store.ts):
  - `addressRaw` keeps the original trimmed source string.
  - `address` holds the normalized display value.
  - ZIP extraction runs against `addressRaw` to avoid parsing regressions.

## Current Token Mapping

Matching is case-insensitive and applied on whole-word boundaries. Both the
spelled-out source form and any pre-abbreviated form are normalized to the
canonical abbreviation casing (for example, `Drive`, `DR`, and `dr` all become
`Dr`; `SE` and `se` become `SE`).

| Source token | Abbreviation |
| ------------ | ------------ |
| North        | N            |
| South        | S            |
| East         | E            |
| West         | W            |
| Northeast    | NE           |
| Northwest    | NW           |
| Southeast    | SE           |
| Southwest    | SW           |
| Street       | St           |
| Avenue       | Ave          |
| Boulevard    | Blvd         |
| Drive        | Dr           |
| Road         | Rd           |
| Lane         | Ln           |
| Court        | Ct           |
| Circle       | Cir          |
| Place        | Pl           |
| Parkway      | Pkwy         |

## Known Limitations

- The shim cannot distinguish a mapped word used as a street name from the same
  word used as a suffix. For example, a street literally named `Boulevard` will
  be abbreviated to `Blvd`.
- Only the fixed token set above is normalized. Already-abbreviated tokens
  (`DR`, `se`, etc.) have their casing coerced to the canonical form (`Dr`,
  `SE`) but are otherwise left as-is.
- No geocoding, reordering, or semantic rewriting is performed.

## Removal Checklist

Remove this shim once the upstream pipeline emits standardized/abbreviated
address tokens directly in `public/data.geojson`.

- [ ] Confirm source `address` values are already abbreviated/standardized.
- [ ] Delete `normalizeAddressForDisplay` usage in [`src/state/data-store.ts`](../src/state/data-store.ts).
- [ ] Delete [`src/shims/address-normalization.ts`](../src/shims/address-normalization.ts) and its test file.
- [ ] Remove this document (or its temporary sections) and the README pointer.
- [ ] Optionally remove `addressRaw` from `MapPoint` if no longer needed for diagnostics.
