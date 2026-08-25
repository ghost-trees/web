import { asset } from '../../utils/asset';

export function AboutContent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-6 pt-10 pb-24 sm:px-8 md:pt-16 md:pb-32">
      <header>
        <p className="text-[11px] uppercase tracking-[var(--tracking-label-meta)] text-[var(--color-on-surface-variant)]">
          About
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[var(--tracking-display-tight)] text-[var(--color-on-surface)] md:text-3xl">
          Expressing loss through spookiness
        </h2>
        <p className="mt-6 text-base leading-7 text-[var(--color-on-surface)]">
          Ghost Trees ATL depicts the changing population of deceased trees of Atlanta's beloved
          canopy.
        </p>
      </header>

      <div className="my-6 flex justify-center" aria-hidden="true">
        <img src={asset('logo.svg')} alt="" className="h-15 w-15 opacity-75" />
      </div>

      <article className="text-base leading-7 text-[var(--color-on-surface)]">
        <p>Loss is a persistent theme across many socially engaged research and design domains.</p>
        <ul className="my-6 space-y-1">
          <li>The loss of housing.</li>
          <li>The loss of water.</li>
          <li>The loss of trees.</li>
          <li>The loss of life.</li>
        </ul>
        <p>
          Much of that loss is documented through data. Through an ongoing research-through-design
          project, we ask:
        </p>
        <blockquote className="mt-4 border-l-2 border-[var(--color-primary)] pl-4">
          How can we express loss in ways that alter our perspectives, expanding both our affective
          engagements and design repertoires?
        </blockquote>
        <p className="mt-4">
          We explore aesthetic strategies of representing loss that leverage spookiness. Informed by
          prior work on spookiness and related themes, we present five projects, each expressing
          loss through different media and visual formats. From reflection on these works, we derive
          a set of themes on representing loss, which can inform and inspire other designers looking
          to engage and express loss in more poetic ways.
        </p>
      </article>
    </div>
  );
}
