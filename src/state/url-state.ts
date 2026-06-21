import type { ChartId } from '../components/charts/definitions';
import { fromYearMonthKey, toYearMonthKey } from '../utils/date';
import type { AppMode, MainView, UiPane } from './ui-store';
import { useDataStore } from './data-store';
import type { TimeFilterMode } from './filter-store';
import { useFilterStore } from './filter-store';
import { useUiStore } from './ui-store';

const MAIN_VIEWS: MainView[] = ['map', 'gallery', 'about'];
const UI_PANES: UiPane[] = ['map', 'filters', 'charts', 'settings'];
const APP_MODES: AppMode[] = ['explore', 'timeline'];
const TIME_FILTER_MODES: TimeFilterMode[] = ['range', 'through'];
const CHART_IDS: ChartId[] = [
  'records-by-month',
  'records-by-month-bar',
  'records-by-tree-type',
  'records-by-tree-type-pie',
  'records-by-zip',
];

type ParsedFilterState = {
  timeFilterMode?: TimeFilterMode;
  minMonthKey?: number;
  maxMonthKey?: number;
  enabledTreeTypes?: string[];
  enabledZipCodes?: string[];
};

type ParsedUrlState = {
  ui: Partial<
    Pick<
      ReturnType<typeof useUiStore.getState>,
      | 'mainView'
      | 'activePane'
      | 'selectedChart'
      | 'appMode'
      | 'scalePointsByFee'
      | 'showAtlantaBoundary'
    >
  >;
  filters: ParsedFilterState;
};

let isHydrating = false;
let initialUrlState: ParsedUrlState | null = null;
let initialUrlHasState = false;

function hasRecognizedState(parsedState: ParsedUrlState): boolean {
  return Object.keys(parsedState.ui).length > 0 || Object.keys(parsedState.filters).length > 0;
}

function isOneOf<T extends string>(value: string | null, values: readonly T[]): value is T {
  return value !== null && values.includes(value as T);
}

function parseMonthParam(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return undefined;
  }

  return toYearMonthKey({ year, monthIndex: month - 1 });
}

function formatMonthParam(monthKey: number): string {
  const { year, monthIndex } = fromYearMonthKey(monthKey);
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function parseCsvParam(value: string | null): string[] | undefined {
  if (value === null) {
    return undefined;
  }

  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return [...new Set(items)];
}

function withHydrationGuard(apply: () => void): void {
  isHydrating = true;
  try {
    apply();
  } finally {
    isHydrating = false;
  }
}

function applyFilterState(filters: ParsedFilterState): void {
  const filterStore = useFilterStore.getState();

  if (filters.timeFilterMode) {
    filterStore.setTimeFilterMode(filters.timeFilterMode);
  }

  if (typeof filters.minMonthKey === 'number' && typeof filters.maxMonthKey === 'number') {
    filterStore.setMonthRange(filters.minMonthKey, filters.maxMonthKey);
  } else {
    if (typeof filters.minMonthKey === 'number') {
      filterStore.setMinMonthKey(filters.minMonthKey);
    }
    if (typeof filters.maxMonthKey === 'number') {
      filterStore.setMaxMonthKey(filters.maxMonthKey);
    }
  }

  if (filters.enabledTreeTypes) {
    filterStore.setEnabledTreeTypes(filters.enabledTreeTypes);
  }
  if (filters.enabledZipCodes) {
    filterStore.setEnabledZipCodes(filters.enabledZipCodes);
  }
}

export function readStateFromUrl(): ParsedUrlState {
  const searchParams = new URLSearchParams(window.location.search);
  const ui: ParsedUrlState['ui'] = {};
  const filters: ParsedFilterState = {};

  const modeParam = searchParams.get('mode');
  if (isOneOf(modeParam, APP_MODES)) {
    ui.appMode = modeParam;
  }

  const viewParam = searchParams.get('view');
  if (isOneOf(viewParam, MAIN_VIEWS)) {
    ui.mainView = viewParam;
  }

  const paneParam = searchParams.get('pane');
  if (isOneOf(paneParam, UI_PANES)) {
    ui.activePane = paneParam;
  }

  const chartParam = searchParams.get('chart');
  if (isOneOf(chartParam, CHART_IDS)) {
    ui.selectedChart = chartParam;
  }

  const scaleFeeParam = searchParams.get('scaleFee');
  if (scaleFeeParam === '1') {
    ui.scalePointsByFee = true;
  } else if (scaleFeeParam === '0') {
    ui.scalePointsByFee = false;
  }

  const boundaryParam = searchParams.get('boundary');
  if (boundaryParam === '0') {
    ui.showAtlantaBoundary = false;
  } else if (boundaryParam === '1') {
    ui.showAtlantaBoundary = true;
  }

  const timeModeParam = searchParams.get('tmode');
  if (isOneOf(timeModeParam, TIME_FILTER_MODES)) {
    filters.timeFilterMode = timeModeParam;
  }

  const fromMonthKey = parseMonthParam(searchParams.get('from'));
  if (typeof fromMonthKey === 'number') {
    filters.minMonthKey = fromMonthKey;
  }

  const toMonthKey = parseMonthParam(searchParams.get('to'));
  if (typeof toMonthKey === 'number') {
    filters.maxMonthKey = toMonthKey;
  }

  const treeTypes = parseCsvParam(searchParams.get('trees'));
  if (treeTypes !== undefined) {
    filters.enabledTreeTypes = treeTypes;
  }

  const zipCodes = parseCsvParam(searchParams.get('zips'));
  if (zipCodes !== undefined) {
    filters.enabledZipCodes = zipCodes;
  }

  return { ui, filters };
}

initialUrlState = readStateFromUrl();
initialUrlHasState = hasRecognizedState(initialUrlState);

export function applyUrlToStores(): void {
  const parsedState = initialUrlState ?? readStateFromUrl();
  initialUrlState = parsedState;
  initialUrlHasState = hasRecognizedState(parsedState);

  withHydrationGuard(() => {
    if (Object.keys(parsedState.ui).length > 0) {
      useUiStore.setState(parsedState.ui);
    }
  });

  const hasFilterParams = Object.keys(parsedState.filters).length > 0;
  if (!hasFilterParams) {
    return;
  }

  const applyFilters = () => {
    withHydrationGuard(() => {
      applyFilterState(parsedState.filters);
    });
  };

  if (useDataStore.getState().hasLoaded) {
    applyFilters();
    return;
  }

  const unsubscribe = useDataStore.subscribe((state, previousState) => {
    if (!previousState.hasLoaded && state.hasLoaded) {
      unsubscribe();
      applyFilters();
    }
  });
}

export function hasInitialUrlState(): boolean {
  return initialUrlHasState;
}

export function serializeStoresToUrl(): void {
  const uiState = useUiStore.getState();
  const filterState = useFilterStore.getState();
  const searchParams = new URLSearchParams();

  if (uiState.mainView !== 'map') {
    searchParams.set('view', uiState.mainView);
  }
  if (uiState.mainView === 'map' && uiState.activePane !== 'map') {
    searchParams.set('pane', uiState.activePane);
  }
  if (uiState.selectedChart !== 'records-by-month') {
    searchParams.set('chart', uiState.selectedChart);
  }
  if (uiState.appMode !== 'explore') {
    searchParams.set('mode', uiState.appMode);
  }

  if (uiState.scalePointsByFee) {
    searchParams.set('scaleFee', '1');
  }
  if (!uiState.showAtlantaBoundary) {
    searchParams.set('boundary', '0');
  }

  if (filterState.timeFilterMode !== 'range') {
    searchParams.set('tmode', filterState.timeFilterMode);
  }

  if (filterState.hasAvailableMonths) {
    if (
      filterState.timeFilterMode === 'range' &&
      filterState.minMonthKey > filterState.minAvailableMonthKey
    ) {
      searchParams.set('from', formatMonthParam(filterState.minMonthKey));
    }
    if (filterState.maxMonthKey < filterState.maxAvailableMonthKey) {
      searchParams.set('to', formatMonthParam(filterState.maxMonthKey));
    }
  }

  if (
    filterState.availableTreeTypes.length > 0 &&
    filterState.enabledTreeTypes.length < filterState.availableTreeTypes.length
  ) {
    searchParams.set('trees', filterState.enabledTreeTypes.join(','));
  }

  if (
    filterState.availableZipCodes.length > 0 &&
    filterState.enabledZipCodes.length < filterState.availableZipCodes.length
  ) {
    searchParams.set('zips', filterState.enabledZipCodes.join(','));
  }

  const nextSearch = searchParams.toString();
  const nextPath = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextPath !== currentPath) {
    window.history.replaceState(null, '', nextPath);
  }
}

export function startUrlSync(): () => void {
  const sync = () => {
    if (isHydrating) {
      return;
    }
    serializeStoresToUrl();
  };

  const unsubscribeUi = useUiStore.subscribe(sync);
  const unsubscribeFilters = useFilterStore.subscribe(sync);

  return () => {
    unsubscribeUi();
    unsubscribeFilters();
  };
}
