import type { ButtonHTMLAttributes } from 'react';

type SidePanelButtonProps = {
  label: string;
  isActive?: boolean;
  icon?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export function SidePanelButton({
  label,
  isActive = false,
  icon,
  type,
  ...props
}: SidePanelButtonProps) {
  const stateClasses = isActive
    ? 'bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-fg)] hover:bg-[var(--color-nav-active-bg-hover)]'
    : 'text-[var(--color-nav-fg)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-fg)]';

  return (
    <button
      type={type ?? 'button'}
      className={`flex w-full items-center gap-3 rounded-[var(--radius-round-four)] px-4 py-3 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${stateClasses}`}
      {...props}
    >
      {icon ? (
        <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}
