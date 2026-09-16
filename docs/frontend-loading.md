# Frontend Loading Strategy

Goal: get the user to a usable Home view as quickly as possible. Code they have not asked for yet must not block first paint.

## Critical path

Home (nav + playback map) is eager. That map is a standalone deck.gl canvas with a fixed camera and no picking, so the landing view never loads the interactive map engine.

Maps, Charts, and Gallery are lazy. ECharts is only reachable from Charts (and only the chart types we render). `maplibre-gl` and the deck.gl MapboxOverlay are only reachable from Maps; they are omitted from `manualChunks` so they stay in that lazy chunk.

Once Home's point data has loaded, deferred surfaces warm in the background. On Save-Data or 2g they stay on-demand so prefetch never competes with map tiles.

Vite's default 500 kB chunk warning is left in place so new bloat still surfaces. deck.gl is large because Home needs it; maplibre-gl and ECharts are large but not on first load. If the warning grows, look at what newly landed on the critical path; do not raise `chunkSizeWarningLimit`.

## Mounting

CSS-hiding a mounted view does not defer its code. A surface is deferred only if it is not imported on the critical path.

Maps and Gallery stay mounted after first open (hidden with CSS) so WebGL, sources, and layers survive navigation. Home unmounts when you leave: recreating its canvas is cheap, and at most one heavy GL context is alive.

## Vendors

Import only the library modules we use. Put large, slow-changing vendors in their own cache-stable chunks so app edits do not bust them.

## Trade-offs

- Warmup can lose a race (placeholder until the chunk arrives) or download Maps/Charts/Gallery even if the user never opens them.
- Home uses raster tiles so the landing view does not load MapLibre or its vector style. The camera never moves, so pre-drawn tiles are enough.

## Adding a surface

New heavy UI is its own deferred surface, not an eager startup import. Add it to the background warmup list so prefetch matches the split.
