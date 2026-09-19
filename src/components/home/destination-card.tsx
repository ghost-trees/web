/**
 * @file destination-card.tsx
 * @description
 * Card that hooks the landing page into another surface. There is no router, so each card just
 * calls the same ui-store action the top nav uses.
 */

type DestinationCardProps = {
  label: string;
  title: string;
  description: string;
  icon: string;
  actionLabel: string;
  onSelect: () => void;
};

export function DestinationCard({
  label,
  title,
  description,
  icon,
  actionLabel,
  onSelect,
}: DestinationCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex h-full w-full flex-col rounded-round-four bg-surface-container-high p-6 pr-14 text-left transition-colors hover:bg-[var(--color-nav-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span
        className="material-symbols-outlined absolute right-5 top-5 text-2xl text-secondary-container transition-colors group-hover:text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-label-meta text-primary">{label}</span>
      <span className="mt-1 text-lg font-semibold tracking-[var(--tracking-display-tight)] text-on-surface">
        {title}
      </span>
      <span className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</span>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        {actionLabel}
        <span
          className="material-symbols-outlined text-base leading-none transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          arrow_forward
        </span>
      </span>
    </button>
  );
}
