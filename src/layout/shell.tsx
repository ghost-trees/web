import type { ReactNode } from 'react';
import { useUiStore } from '../state/ui-store';

type ShellProps = {
  sidebar: ReactNode;
  filtersPane?: ReactNode;
  content: ReactNode;
};

export function Shell({ sidebar, filtersPane, content }: ShellProps) {
  const isFiltersOpen = useUiStore((state) => state.isFiltersOpen);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface-variant)]">
      <aside className="w-72 shrink-0 bg-[var(--color-surface-container-high)] p-4">
        {sidebar}
      </aside>
      {filtersPane ? (
        <section
          aria-label="Inline filters panel"
          className={`min-h-0 shrink-0 overflow-hidden bg-[var(--color-surface-container-low)] transition-[width,padding,border-color] duration-200 ease-out ${
            isFiltersOpen
              ? 'w-80 border-r border-[var(--color-outline-variant)] p-4'
              : 'w-0 border-r border-transparent p-0'
          }`}
        >
          <div
            className={`h-full min-h-0 transition-opacity duration-150 ${
              isFiltersOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {filtersPane}
          </div>
        </section>
      ) : null}
      <main className="min-w-0 flex min-h-0 flex-1 flex-col bg-[var(--color-surface-container-lowest)] p-0">
        {content}
      </main>
    </div>
  );
}
