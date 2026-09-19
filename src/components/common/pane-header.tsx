import type { ReactNode } from 'react';

type PaneHeaderProps = {
  title: string;
  description?: ReactNode;
};

export function PaneHeader({ title, description }: PaneHeaderProps) {
  return (
    <header className="mb-4">
      <h2 className="text-base font-semibold text-[var(--color-on-surface)]">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">{description}</p>
      ) : null}
    </header>
  );
}
