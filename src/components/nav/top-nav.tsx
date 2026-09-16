import { TopNavButton } from './top-nav-button';
import { useUiStore } from '../../state/ui-store';
import { asset } from '../../utils/asset';

export function TopNav() {
  const mainView = useUiStore((state) => state.mainView);
  const showHome = useUiStore((state) => state.showHome);
  const showMaps = useUiStore((state) => state.showMaps);
  const showGallery = useUiStore((state) => state.showGallery);
  const showAbout = useUiStore((state) => state.showAbout);

  return (
    <header className="z-50 shrink-0 bg-[var(--color-surface-container-high)] pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <img src={asset('logo.svg')} alt="" aria-hidden="true" className="h-6 w-6 shrink-0" />
          <h1 className="truncate text-base font-semibold tracking-[var(--tracking-display-tight)] text-[var(--color-primary)] sm:text-lg">
            Ghost Trees
          </h1>
        </div>

        <nav aria-label="Primary" className="ml-auto min-w-0">
          <ul className="flex items-center gap-1">
            <li>
              <TopNavButton
                label="Home"
                icon="home"
                isActive={mainView === 'home'}
                onClick={showHome}
              />
            </li>
            <li>
              <TopNavButton
                label="Maps"
                icon="map"
                isActive={mainView === 'maps'}
                onClick={showMaps}
              />
            </li>
            <li>
              <TopNavButton
                label="Gallery"
                icon="photo_library"
                isActive={mainView === 'gallery'}
                onClick={showGallery}
              />
            </li>
            <li>
              <TopNavButton
                label="About"
                icon="info"
                isActive={mainView === 'about'}
                onClick={showAbout}
              />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
