import { create } from 'zustand';
import type { ChartId } from '../components/charts/definitions';

export type UiPane = 'map' | 'filters' | 'charts' | 'settings';
export type MainView = 'map' | 'gallery' | 'about';
export type AppMode = 'explore' | 'playback';

type UiStoreState = {
  appMode: AppMode;
  mainView: MainView;
  mainViewBeforePlayback: MainView;
  activePane: UiPane;
  paneBeforePlayback: UiPane;
  selectedChart: ChartId;
  scalePointsByFee: boolean;
  showAtlantaBoundary: boolean;
  isPlaybackPlaying: boolean;
  playbackMonthIndex: number;
  playbackStepMs: number;
  hasPlaybackAutoStarted: boolean;
  enterPlayback: () => void;
  exitPlayback: () => void;
  setPlaybackPlaying: (next: boolean) => void;
  togglePlaybackPlaying: () => void;
  setPlaybackMonthIndex: (monthIndex: number) => void;
  setPlaybackStepMs: (stepMs: number) => void;
  markPlaybackAutoStarted: () => void;
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
  mainViewBeforePlayback: 'map',
  activePane: 'map',
  paneBeforePlayback: 'map',
  selectedChart: 'records-by-month',
  scalePointsByFee: false,
  showAtlantaBoundary: true,
  isPlaybackPlaying: true,
  playbackMonthIndex: 0,
  playbackStepMs: 1000,
  hasPlaybackAutoStarted: false,
  enterPlayback: () =>
    set((state) => ({
      appMode: 'playback',
      mainViewBeforePlayback: state.mainView,
      paneBeforePlayback: state.activePane,
      mainView: 'map',
      activePane: 'map',
      isPlaybackPlaying: true,
    })),
  exitPlayback: () =>
    set((state) => ({
      appMode: 'explore',
      mainView: state.mainViewBeforePlayback,
      activePane: state.paneBeforePlayback,
      isPlaybackPlaying: false,
    })),
  setPlaybackPlaying: (next) => set({ isPlaybackPlaying: next }),
  togglePlaybackPlaying: () =>
    set((state) => ({
      isPlaybackPlaying: !state.isPlaybackPlaying,
    })),
  setPlaybackMonthIndex: (monthIndex) => set({ playbackMonthIndex: Math.max(0, monthIndex) }),
  setPlaybackStepMs: (stepMs) => set({ playbackStepMs: Math.max(300, stepMs) }),
  markPlaybackAutoStarted: () => set({ hasPlaybackAutoStarted: true }),
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
