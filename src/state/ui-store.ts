import { create } from 'zustand';
import type { ChartId } from '../components/charts/definitions';

export type UiPane = 'map' | 'filters' | 'charts' | 'settings';
export type MainView = 'map' | 'gallery' | 'about';
export type AppMode = 'explore' | 'timeline';

type UiStoreState = {
  appMode: AppMode;
  mainView: MainView;
  mainViewBeforeTimeline: MainView;
  activePane: UiPane;
  paneBeforeTimeline: UiPane;
  selectedChart: ChartId;
  scalePointsByFee: boolean;
  showAtlantaBoundary: boolean;
  isTimelinePlaying: boolean;
  timelineMonthIndex: number;
  timelineStepMs: number;
  hasTimelineAutoStarted: boolean;
  enterTimeline: () => void;
  exitTimeline: () => void;
  setTimelinePlaying: (next: boolean) => void;
  toggleTimelinePlaying: () => void;
  setTimelineMonthIndex: (monthIndex: number) => void;
  setTimelineStepMs: (stepMs: number) => void;
  markTimelineAutoStarted: () => void;
  setMainView: (view: MainView) => void;
  showGalleryView: () => void;
  showAboutView: () => void;
  setActivePane: (pane: UiPane) => void;
  setSelectedChart: (chartId: ChartId) => void;
  setScalePointsByFee: (next: boolean) => void;
  setShowAtlantaBoundary: (next: boolean) => void;
  togglePane: (pane: Exclude<UiPane, 'map'>) => void;
  showMapPane: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  appMode: 'explore',
  mainView: 'map',
  mainViewBeforeTimeline: 'map',
  activePane: 'map',
  paneBeforeTimeline: 'map',
  selectedChart: 'records-by-month',
  scalePointsByFee: false,
  showAtlantaBoundary: true,
  isTimelinePlaying: true,
  timelineMonthIndex: 0,
  timelineStepMs: 1000,
  hasTimelineAutoStarted: false,
  enterTimeline: () =>
    set((state) => ({
      appMode: 'timeline',
      mainViewBeforeTimeline: state.mainView,
      paneBeforeTimeline: state.activePane,
      mainView: 'map',
      activePane: 'map',
      isTimelinePlaying: true,
    })),
  exitTimeline: () =>
    set((state) => ({
      appMode: 'explore',
      mainView: state.mainViewBeforeTimeline,
      activePane: state.paneBeforeTimeline,
      isTimelinePlaying: false,
    })),
  setTimelinePlaying: (next) => set({ isTimelinePlaying: next }),
  toggleTimelinePlaying: () =>
    set((state) => ({
      isTimelinePlaying: !state.isTimelinePlaying,
    })),
  setTimelineMonthIndex: (monthIndex) => set({ timelineMonthIndex: Math.max(0, monthIndex) }),
  setTimelineStepMs: (stepMs) => set({ timelineStepMs: Math.max(300, stepMs) }),
  markTimelineAutoStarted: () => set({ hasTimelineAutoStarted: true }),
  setMainView: (view) =>
    set({
      mainView: view,
      activePane: 'map',
    }),
  showGalleryView: () =>
    set({
      mainView: 'gallery',
      activePane: 'map',
    }),
  showAboutView: () =>
    set({
      mainView: 'about',
      activePane: 'map',
    }),
  setActivePane: (pane) => set({ activePane: pane }),
  setSelectedChart: (chartId) => set({ selectedChart: chartId }),
  setScalePointsByFee: (next) => set({ scalePointsByFee: next }),
  setShowAtlantaBoundary: (next) => set({ showAtlantaBoundary: next }),
  togglePane: (pane) =>
    set((state) => ({
      mainView: 'map',
      activePane: state.mainView !== 'map' ? pane : state.activePane === pane ? 'map' : pane,
    })),
  showMapPane: () =>
    set({
      mainView: 'map',
      activePane: 'map',
    }),
}));
