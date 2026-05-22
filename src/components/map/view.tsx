/**
 * @file view.tsx
 * @description
 * Main map container that initializes the map instance, syncs layers with state,
 * and composes map UI elements.
 */

import { MapboxOverlay } from '@deck.gl/mapbox';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useMapSelectionStore } from '../../state/selection-store';
import { useDataStore } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';
import { derivePlaybackMonthKey, filterIdsByVisibility, selectPointsForLayer } from './playback';
import { INITIAL_CENTER, INITIAL_ZOOM } from './constants';
import { MapControls } from './controls';
import { MapTooltip } from './tooltip';
import { useMapInteractions } from './use-interactions';
import { useMapInstance } from './use-map-instance';
import { usePointLayerSync } from './use-point-layer-sync';

export function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [renderMap, setRenderMap] = useState<maplibregl.Map | null>(null);
  const [, setMapViewVersion] = useState(0);
  const pointsById = useDataStore((state) => state.pointsById);
  const loadPoints = useDataStore((state) => state.loadPoints);
  const filteredPoints = useFilterStore((state) => state.visiblePoints);
  const playbackPoints = useFilterStore((state) => state.playbackPoints);
  const playbackMonths = useFilterStore((state) => state.playbackMonths);
  const appMode = useUiStore((state) => state.appMode);
  const playbackMonthIndex = useUiStore((state) => state.playbackMonthIndex);
  const scalePointsByFee = useUiStore((state) => state.scalePointsByFee);
  const showAtlantaBoundary = useUiStore((state) => state.showAtlantaBoundary);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const hoveredIds = useMapSelectionStore((state) => state.hoveredIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const addSelection = useMapSelectionStore((state) => state.addSelection);
  const toggleSelection = useMapSelectionStore((state) => state.toggleSelection);
  const setHovered = useMapSelectionStore((state) => state.setHovered);
  const playbackMonthKey = derivePlaybackMonthKey(playbackMonths, playbackMonthIndex);
  const pointsForLayer = useMemo(() => {
    return selectPointsForLayer({
      appMode,
      filteredPoints,
      playbackPoints,
      playbackMonthKey,
    });
  }, [appMode, filteredPoints, playbackMonthKey, playbackPoints]);
  const attachMapInteractions = useMapInteractions({
    replaceSelection,
    addSelection,
    toggleSelection,
    setHovered,
  });
  const visiblePointIds = useMemo(
    () => new Set(pointsForLayer.map((point) => point.id)),
    [pointsForLayer],
  );
  const visibleSelectedIds = useMemo(
    () => filterIdsByVisibility(selectedIds, visiblePointIds),
    [selectedIds, visiblePointIds],
  );
  const visibleHoveredIds = useMemo(
    () => filterIdsByVisibility(hoveredIds, visiblePointIds),
    [hoveredIds, visiblePointIds],
  );
  const { syncCurrentLayer } = usePointLayerSync({
    overlayRef,
    pointsForLayer,
    selectedIds: visibleSelectedIds,
    hoveredIds: visibleHoveredIds,
    scalePointsByFee,
    appMode,
    playbackMonthKey,
  });
  const handleMapViewChange = useCallback(() => {
    setMapViewVersion((version) => version + 1);
  }, []);
  const handleOverlayReady = useCallback(() => {
    syncCurrentLayer(
      useMapSelectionStore.getState().selectedIds,
      useMapSelectionStore.getState().hoveredIds,
    );
  }, [syncCurrentLayer]);
  const handleMapLoad = useCallback(
    (map: maplibregl.Map) => {
      setRenderMap(map);
      syncCurrentLayer(
        useMapSelectionStore.getState().selectedIds,
        useMapSelectionStore.getState().hoveredIds,
      );
    },
    [syncCurrentLayer],
  );

  useMapInstance({
    mapContainerRef,
    mapRef,
    overlayRef,
    attachMapInteractions,
    onMapViewChange: handleMapViewChange,
    showAtlantaBoundary,
    onMapLoad: handleMapLoad,
    onOverlayReady: handleOverlayReady,
  });

  useEffect(() => {
    void loadPoints();
  }, [loadPoints]);

  useEffect(() => {
    if (selectedIds.size === 0) {
      return;
    }

    const nextVisibleSelectedIds: string[] = [];
    let hasOutOfRangeSelections = false;
    for (const selectedId of selectedIds) {
      if (visiblePointIds.has(selectedId)) {
        nextVisibleSelectedIds.push(selectedId);
      } else {
        hasOutOfRangeSelections = true;
      }
    }

    if (hasOutOfRangeSelections) {
      replaceSelection(nextVisibleSelectedIds);
    }
  }, [selectedIds, visiblePointIds, replaceSelection]);

  const selectedPointId =
    visibleSelectedIds.size === 1 ? visibleSelectedIds.values().next().value : null;
  const selectedPoint = selectedPointId ? pointsById.get(selectedPointId) : null;
  const projectedTooltip =
    selectedPoint && renderMap ? renderMap.project(selectedPoint.coordinates) : null;

  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 200 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 200 });
  };

  const handleResetView = () => {
    mapRef.current?.easeTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      duration: 400,
    });
  };

  return (
    <section
      aria-label="Map View"
      className="flex min-h-0 w-full flex-1 bg-[var(--color-surface-container-low)]"
    >
      <div className="relative h-full w-full">
        <div ref={mapContainerRef} className="h-full w-full" />
        {appMode !== 'playback' ? (
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
          />
        ) : null}
        {appMode !== 'playback' && selectedPoint && projectedTooltip ? (
          <MapTooltip
            pointId={selectedPoint.id}
            date={selectedPoint.date}
            recordType={selectedPoint.recordType}
            treeTypes={selectedPoint.treeTypes}
            address={selectedPoint.address}
            x={projectedTooltip.x}
            y={projectedTooltip.y}
          />
        ) : null}
      </div>
    </section>
  );
}
