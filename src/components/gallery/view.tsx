import { CloseButton } from '../common/close-button';
import { useUiStore } from '../../state/ui-store';

export function GalleryView() {
  const showMapPane = useUiStore((state) => state.showMapPane);

  return (
    <section
      aria-label="Gallery View"
      className="relative flex min-h-0 w-full flex-1 bg-[var(--color-surface-container-low)] p-8"
    >
      <CloseButton
        ariaLabel="Close gallery"
        onClick={showMapPane}
        size="compact"
        className="absolute right-6 top-6"
      />
      <div className="w-full">
        <h2 className="text-xl font-semibold text-[var(--color-on-surface)]">Gallery</h2>
      </div>
    </section>
  );
}
