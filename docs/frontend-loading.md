# Frontend Loading Strategy

## Problem Statement

The production build originally emitted a single JavaScript file of roughly 3.2 MB (about 938 kB gzipped). Everything the app could ever show (map, charts, gallery, about page) was downloaded, parsed, and compiled before the user could interact with the landing view.

Vite surfaced this as a "chunk larger than 500 kB" warning. That warning is a _symptom_. The goal of this strategy is not to silence the warning; it is to make the experience the client actually feels, time to a usable landing view, as fast as is reasonable. Raising Vite's chunk-size limit was rejected: it hides the signal without changing what the browser downloads.

## Guiding Principles

### Load by intent

Home is the landing experience, so the top nav and Home's playback map are on the critical path. That map is deliberately the cheap one: a standalone deck.gl canvas with a fixed camera and no picking, so the landing view never loads the interactive map engine. Everything the user has not asked for yet, Maps, Charts, and Gallery, is deferred so it never blocks first paint. Once the landing path is healthy (its point data has loaded), those surfaces are warmed in the background during idle time. The result is a Home-only first paint followed by surfaces that are usually already cached, so opening one is a cache hit rather than a loading placeholder.

The two heaviest offenders are handled the same way. The charting library sits behind the Charts panel, reduced to only the chart types the app actually renders. The map engine (`maplibre-gl`, plus the deck.gl MapboxOverlay that binds to it) sits behind the Maps view, which is only reachable through a lazy import; nothing on the Home path references it.

### "Hidden" is not "not downloaded"

The layout keeps inactive views in the DOM and toggles their visibility for a fast, state-preserving switch. That is a rendering choice, not a loading choice. A view that is merely hidden with CSS is still fully downloaded. Deferring a view's _code_ requires that its code not be referenced on the critical path at all, only pulled in when the view is genuinely needed.

### Preserve map session state, but keep one GL context

Switching away from Maps must not tear down and reinitialize the interactive map (and its WebGL context, sources, and layers). Once opened, Maps and Gallery stay mounted for the life of the session and are hidden with CSS, which keeps navigation cheap and avoids re-fetching map data.

Home is the deliberate exception: it unmounts when you leave it. Its deck.gl canvas has no style document to re-fetch and only a small, cached set of basemap tiles, so recreating it is cheap. Unmounting it means at most one heavy GL context is alive at a time, even though the app now has two maps.

### Prefer a smaller vendor surface over a quieter bundler

Two habits keep the payload honest over time:

- Depend only on the specific library modules the app uses, rather than pulling in a library's full umbrella package "just in case." A smaller surface means less code can accidentally end up in the bundle later.
- Keep large, slow-changing vendor code in its own cache-stable output, separate from application code. Day-to-day app edits should not force users to re-download the map engine.

## Trade-offs

Background warmup removes the first-open delay in the common case, but a short delay with a brief loading placeholder can still occur: if the user navigates to a surface before its warmup finishes, or if warmup was skipped. Warmup is deliberately skipped on constrained connections (Save-Data enabled, or a 2g / slow-2g link), where we stay strictly on-demand so the prefetch never competes with map tiles. In every skipped case the surface still loads normally when opened.

This is a reordering of work, not a deletion of it. A user who eventually visits every surface downloads a similar total amount of code as before, just spread across the session and prioritized by what they actually look at first. One accepted cost of warmup is that lingering on Home may download Maps, Charts, and Gallery even if the user never opens them; the constrained-connection skip keeps that from harming the people it would hurt most.

A second accepted cost is that Home's basemap is raster rather than the vector style used on Maps, so the two are not pixel-identical. Home's camera never moves, which makes the difference easy to miss and avoids shipping a second style document on the landing path.

## The Remaining Chunk-Size Warning

After the split, Vite still prints its "chunk larger than 500 kB" warning. This is expected, and it now means something different: it flags a few individually large vendor libraries rather than the single combined mega-bundle it used to describe.

deck.gl is now the dominant first-load offender: it renders Home's playback map, so it is on the critical path and cannot be removed or meaningfully subdivided. The map engine (`maplibre-gl`) is larger still, but it no longer loads on first paint; it is deliberately kept out of the manual vendor split so it stays inside the lazy Maps chunk. The charting library is treated the same way and stays in its own lazy Charts chunk.

Neither of those chunks is on the first-load path. Once Home's point data has loaded they are typically warmed in the background alongside Gallery; if warmup was skipped (for example on a constrained connection), each simply loads when its surface is first opened. Either way their size never delays the landing view.

This is the expected, healthy end state, not a regression. The chunk-size threshold is deliberately left at its default so genuinely new bloat still trips it, consistent with treating the warning as a symptom rather than something to silence. To make this obvious to anyone reading a CI log or terminal, the production build prints a short synopsis immediately after the warning explaining that it is intentional.

## Keeping This Durable

The durable rule: **new heavy UI should be introduced as its own deferred surface, not as another eager import on the startup path.** When adding a feature that pulls in a sizable dependency, treat "when is this actually needed?" as a first-class design question, and default to loading it on demand. When you add such a surface, also add it to the background warmup list alongside the other deferred surfaces so the prefetch stays in lockstep with the code split.

If a build warning about chunk size reappears, the correct response is to look at what newly landed on the critical path, not to raise the warning threshold.
