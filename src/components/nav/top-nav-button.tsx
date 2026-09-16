import type { ButtonHTMLAttributes } from 'react';

type TopNavButtonProps = {
  label: string;
  isActive?: boolean;
  icon?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export function TopNavButton({ label, isActive = false, icon, type, ...props }: TopNavButtonProps) {
  const stateClasses = isActive
    ? 'bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active-fg)] hover:bg-[var(--color-nav-active-bg-hover)]'
    : 'text-[var(--color-nav-fg)] hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-fg)]';

  return (
    <button
      type={type ?? 'button'}
      className={`flex min-h-11 items-center gap-2 rounded-[var(--radius-round-four)] px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] sm:px-4 ${stateClasses}`}
      {...props}
    >
      {icon ? (
        <span
          className="material-symbols-outlined hidden text-[20px] leading-none sm:inline"
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}
