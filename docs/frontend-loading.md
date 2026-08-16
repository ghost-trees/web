# Frontend Loading Strategy

## Problem Statement

The production build originally emitted a single JavaScript file of roughly 3.2 MB (about 938 kB gzipped). Everything the app could ever show (map, charts, gallery, about page) was downloaded, parsed, and compiled before the user could interact with the landing view.

Vite surfaced this as a "chunk larger than 500 kB" warning. That warning is a _symptom_. The goal of this strategy is not to silence the warning; it is to make the experience the client actually feels, time to an interactive map, as fast as is reasonable. Raising Vite's chunk-size limit was rejected: it hides the signal without changing what the browser downloads.

## Guiding Principles

### Load by intent

The map is the landing experience, so the map and its immediate chrome are on the critical path. Everything the user has not asked for yet, Charts, Gallery, and About, is deferred so it never blocks first paint. Once the map path is healthy (its point data has loaded), those surfaces are warmed in the background during idle time. The result is a map-only first paint followed by surfaces that are usually already cached, so opening one is a cache hit rather than a loading placeholder.

The heaviest single offender was the charting library, which was loaded eagerly at startup even though most sessions never open a chart. Moving it behind the Charts surface, and reducing it to only the chart types the app actually renders, keeps it off the first-load path entirely.

### "Hidden" is not "not downloaded"

The layout keeps inactive views in the DOM and toggles their visibility for a fast, state-preserving switch. That is a rendering choice, not a loading choice. A view that is merely hidden with CSS is still fully downloaded. Deferring a view's _code_ requires that its code not be referenced on the critical path at all, only pulled in when the view is genuinely needed.

### Preserve map session state

Switching away from the map to another surface must not tear down and reinitialize the map (and its WebGL context, sources, and layers). The map stays mounted for the life of the session; other surfaces mount when opened. This keeps navigation cheap and avoids re-fetching map data.

### Prefer a smaller vendor surface over a quieter bundler

Two habits keep the payload honest over time:

- Depend only on the specific library modules the app uses, rather than pulling in a library's full umbrella package "just in case." A smaller surface means less code can accidentally end up in the bundle later.
- Keep large, slow-changing vendor code in its own cache-stable output, separate from application code. Day-to-day app edits should not force users to re-download the map engine.

## Trade-offs

Background warmup removes the first-open delay in the common case, but a short delay with a brief loading placeholder can still occur: if the user navigates to a surface before its warmup finishes, or if warmup was skipped. Warmup is deliberately skipped on constrained connections (Save-Data enabled, or a 2g / slow-2g link), where we stay strictly on-demand so the prefetch never competes with map tiles. In every skipped case the surface still loads normally when opened.

This is a reordering of work, not a deletion of it. A user who eventually visits every surface downloads a similar total amount of code as before, just spread across the session and prioritized by what they actually look at first. One accepted cost of warmup is that lingering on the map may download Charts, Gallery, and About even if the user never opens them; the constrained-connection skip keeps that from harming the people it would hurt most.

## The Remaining Chunk-Size Warning

After the split, Vite still prints its "chunk larger than 500 kB" warning. This is expected, and it now means something different: it flags a few individually large vendor libraries rather than the single combined mega-bundle it used to describe.

The map engine (`maplibre-gl`) is the dominant offender. It exceeds the threshold on its own, and because it powers the landing view it is on the critical path and cannot be removed or meaningfully subdivided. The deck.gl overlay is the other large first-load vendor. The charting library is also large, but it is deliberately kept out of the manual vendor split so it stays in its own lazy Charts chunk.

That Charts chunk is not on the first-load path. Once the map's point data has loaded, it is typically warmed in the background alongside Gallery and About; if warmup was skipped (for example on a constrained connection), it simply loads when Charts is first opened. Either way its size never delays the interactive map.

This is the expected, healthy end state, not a regression. The chunk-size threshold is deliberately left at its default so genuinely new bloat still trips it, consistent with treating the warning as a symptom rather than something to silence. To make this obvious to anyone reading a CI log or terminal, the production build prints a short synopsis immediately after the warning explaining that it is intentional.

## Keeping This Durable

The durable rule: **new heavy UI should be introduced as its own deferred surface, not as another eager import on the startup path.** When adding a feature that pulls in a sizable dependency, treat "when is this actually needed?" as a first-class design question, and default to loading it on demand. When you add such a surface, also add it to the background warmup list alongside the other deferred surfaces so the prefetch stays in lockstep with the code split.

If a build warning about chunk size reappears, the correct response is to look at what newly landed on the critical path, not to raise the warning threshold.
