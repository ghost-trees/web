export function AboutView() {
  return (
    <section
      aria-label="About View"
      className="flex min-h-0 w-full flex-1 overflow-y-auto bg-[var(--color-surface-container-low)] p-8"
    >
      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-semibold text-[var(--color-on-surface)]">About</h2>
        <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          <p>
            Loss is a persistent theme across many socially engaged research and design domains. The
            loss of housing. The loss of water. The loss of trees. The loss of life. Much of that
            loss is documented through data. Through an ongoing research-through-design project, we
            ask, How can we express loss in ways that alter our perspectives, expanding both our
            affective engagements and design repertoires? In this pictorial, we explore aesthetic
            strategies of representing loss that leverage spookiness. Informed by prior work on
            spookiness and related themes, we present five projects, each expressing loss through
            different media and visual formats. From reflection on these works, we derive a set of
            themes on representing loss, which can inform and inspire other designers looking to
            engage and express loss in more poetic ways.
          </p>
          <p>
            Ghost Trees ATL is a collection of interactive maps and generated photos that depict the
            changing population of deceased trees of Atlanta&apos;s beloved canopy.
          </p>
        </div>
      </div>
    </section>
  );
}
