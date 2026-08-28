import { CloseButton } from '../common/close-button';
import { useUiStore } from '../../state/ui-store';
import { asset } from '../../utils/asset';

export function AboutView() {
  const showMapPane = useUiStore((state) => state.showMapPane);

  return (
    <section
      aria-label="About View"
      className="relative h-full min-h-0 w-full overflow-y-auto bg-[var(--color-surface-container-low)]"
    >
      <CloseButton
        ariaLabel="Close about"
        onClick={showMapPane}
        size="compact"
        className="absolute right-6 top-6 z-10"
      />
      <div className="mx-auto flex w-full max-w-2xl flex-col px-8 pt-8 pb-32 md:pt-12 md:pb-40">
        <header>
          <p className="text-[11px] uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
            About
          </p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[var(--tracking-display-tight)] text-[var(--color-on-surface)] md:text-3xl">
              Ghost Trees
            </h2>
            <img
              src={asset('logo.svg')}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 opacity-75 md:h-12 md:w-12"
            />
          </div>
        </header>

        <article className="mt-6 space-y-4 text-base leading-7 text-[var(--color-on-surface)]">
          <p>
            Atlanta is often described as the city in a forest. Its tree canopy is one of the
            defining features of the city, shaping neighborhoods as much as roads or buildings. The
            trees soften the summer heat, alter the sound of streets, and give Atlanta a landscape
            unlike most American cities.
          </p>
          <p>
            Because of their value, the city regulates their removal. In most cases, a tree six
            inches or greater in diameter cannot legally be removed without a permit from the City
            Arborist. Permits are generally reserved for trees that are dead, hazardous, or
            otherwise meet specific criteria.
          </p>
          <p>Yet every year, trees are cut down without permission.</p>
          <p>
            Sometimes it is a single tree. Sometimes dozens disappear from a property at once. Often
            these removals accompany redevelopment: a larger house replaces a smaller one, an
            addition extends into a backyard, a new apartment building rises where trees once stood.
            The economics are straightforward. Land becomes more valuable when obstacles are
            removed. Occasionally, the penalties for illegal removal are treated as simply another
            cost of construction.
          </p>
          <p>When these cases are discovered, they become part of the public record.</p>
          <p>
            This map traces a selection of those records: documented instances of illegal tree
            removal in Atlanta over several years. Each point marks a tree that once occupied a
            specific place and no longer does.
          </p>
          <p>We call them Ghost Trees.</p>
          <p>
            The name is less about loss than presence. A ghost is evidence that something remains,
            even after it has disappeared. These points are traces of absent trees—small records of
            decisions that continue to shape the city long after the stumps are gone.
          </p>
          <p>
            The map is the project's point of departure, not its conclusion. Ghost Trees is an
            ongoing investigation into urban landscapes, public records, memory, and the things that
            become visible only after they have vanished.
          </p>
          <p>
            Additional work and ongoing experiments can be found on Instagram:{' '}
            <a
              href="https://www.instagram.com/ghosttreesATL/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-[var(--color-primary)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              @ghosttreesATL
            </a>
            .
          </p>
        </article>

        <footer className="mt-10 space-y-1 border-t border-[var(--color-outline-variant)] pt-6 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          <p>Concept: Carl DiSalvo</p>
          <p>Data &amp; Map Design and Development: Cameron Owens</p>
          <p>Earlier Concepts and Prototype by: Olamide Z Ajasin &amp; Elizza Kaimachiande</p>
        </footer>
      </div>
    </section>
  );
}
