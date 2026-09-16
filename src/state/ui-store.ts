import { create } from 'zustand';
import type { ChartId } from '../components/charts/definitions';

export type MapsSubTab = 'filters' | 'charts' | 'settings';
export type MainView = 'home' | 'maps' | 'gallery' | 'about';

type UiStoreState = {
  mainView: MainView;
  // Views that have been opened at least once. Maps and Gallery stay mounted afterwards so a
  // MapLibre session and scroll positions survive navigation.
  visitedViews: Set<MainView>;
  mapsSubTab: MapsSubTab;
  // Only meaningful below the `md` breakpoint, where the Maps panel is a bottom sheet over the
  // map. From `md` up the panel is a persistent column and this flag is ignored.
  mapsPanelOpen: boolean;
  selectedChart: ChartId;
  scalePointsByFee: boolean;
  showAtlantaBoundary: boolean;
  isTimelinePlaying: boolean;
  timelineMonthIndex: number;
  timelineStepMs: number;
  hasTimelineAutoStarted: boolean;
  setTimelinePlaying: (next: boolean) => void;
  toggleTimelinePlaying: () => void;
  setTimelineMonthIndex: (monthIndex: number) => void;
  setTimelineStepMs: (stepMs: number) => void;
  markTimelineAutoStarted: () => void;
  setMainView: (view: MainView) => void;
  showHome: () => void;
  showMaps: () => void;
  showGallery: () => void;
  showAbout: () => void;
  setMapsSubTab: (tab: MapsSubTab) => void;
  setMapsPanelOpen: (open: boolean) => void;
  setSelectedChart: (chartId: ChartId) => void;
  setScalePointsByFee: (next: boolean) => void;
  setShowAtlantaBoundary: (next: boolean) => void;
};

function withVisitedView(visitedViews: Set<MainView>, view: MainView): Set<MainView> {
  if (visitedViews.has(view)) {
    return visitedViews;
  }
  return new Set(visitedViews).add(view);
}

export const useUiStore = create<UiStoreState>((set) => ({
  mainView: 'home',
  visitedViews: new Set<MainView>(['home']),
  mapsSubTab: 'filters',
  mapsPanelOpen: false,
  selectedChart: 'records-by-month',
  scalePointsByFee: false,
  showAtlantaBoundary: true,
  isTimelinePlaying: false,
  timelineMonthIndex: 0,
  timelineStepMs: 1000,
  hasTimelineAutoStarted: false,
  setTimelinePlaying: (next) => set({ isTimelinePlaying: next }),
  toggleTimelinePlaying: () =>
    set((state) => ({
      isTimelinePlaying: !state.isTimelinePlaying,
    })),
  setTimelineMonthIndex: (monthIndex) => set({ timelineMonthIndex: Math.max(0, monthIndex) }),
  setTimelineStepMs: (stepMs) => set({ timelineStepMs: Math.max(300, stepMs) }),
  markTimelineAutoStarted: () => set({ hasTimelineAutoStarted: true }),
  setMainView: (view) =>
    set((state) => ({
      mainView: view,
      visitedViews: withVisitedView(state.visitedViews, view),
      // Playback only runs on Home, so leaving it must not keep a timer alive.
      isTimelinePlaying: view === 'home' ? state.isTimelinePlaying : false,
    })),
  showHome: () =>
    set((state) => ({
      mainView: 'home',
      visitedViews: withVisitedView(state.visitedViews, 'home'),
    })),
  showMaps: () =>
    set((state) => ({
      mainView: 'maps',
      visitedViews: withVisitedView(state.visitedViews, 'maps'),
      isTimelinePlaying: false,
    })),
  showGallery: () =>
    set((state) => ({
      mainView: 'gallery',
      visitedViews: withVisitedView(state.visitedViews, 'gallery'),
      isTimelinePlaying: false,
    })),
  showAbout: () =>
    set({
      mainView: 'about',
      isTimelinePlaying: false,
    }),
  setMapsSubTab: (tab) => set({ mapsSubTab: tab }),
  setMapsPanelOpen: (open) => set({ mapsPanelOpen: open }),
  setSelectedChart: (chartId) => set({ selectedChart: chartId }),
  setScalePointsByFee: (next) => set({ scalePointsByFee: next }),
  setShowAtlantaBoundary: (next) => set({ showAtlantaBoundary: next }),
}));
