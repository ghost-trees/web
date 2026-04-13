import type { ReactNode } from 'react';

type ShellProps = {
  sidebar: ReactNode;
  content: ReactNode;
};

export function Shell({ sidebar, content }: ShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]">
      <aside className="w-72 shrink-0 bg-[var(--color-surface-container-high)] p-4">
        {sidebar}
      </aside>
      <main className="min-w-0 flex min-h-0 flex-1 flex-col bg-[var(--color-surface-container-lowest)] p-0">
        {content}
      </main>
    </div>
  );
}
