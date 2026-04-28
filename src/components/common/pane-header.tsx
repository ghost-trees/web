import type { ReactNode } from 'react';

type PaneHeaderProps = {
  title: string;
  description: ReactNode;
  onClose: () => void;
  closeLabel?: string;
};

export function PaneHeader({ title, description, onClose, closeLabel = 'Close' }: PaneHeaderProps) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-on-surface)]">{title}</h2>
        <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-outline-variant)] px-3 py-1.5 text-xs font-medium text-[var(--color-on-surface-variant)] transition hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]"
      >
        <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
          close
        </span>
        {closeLabel}
      </button>
    </header>
  );
}
