import type { ReactNode } from 'react';
import { CloseButton } from './close-button';

type PaneHeaderProps = {
  title: string;
  description: ReactNode;
  onClose: () => void;
  closeAriaLabel?: string;
};

export function PaneHeader({ title, description, onClose, closeAriaLabel = 'Close panel' }: PaneHeaderProps) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-on-surface)]">{title}</h2>
        <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">{description}</p>
      </div>
      <CloseButton ariaLabel={closeAriaLabel} onClick={onClose} className="shrink-0" />
    </header>
  );
}
