/**
 * @file view.tsx
 * @description
 * Main map container that initializes the map instance, syncs layers with state,
 * and composes map UI elements.
 *
 * Includes a ResizeObserver-based resize sync so MapLibre keeps its canvas in
 * lock-step with animated layout width changes (such as opening/closing filters).
 */

import { MapboxOverlay } from '@deck.gl/mapbox';
import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { ScaleControl } from 'maplibre-gl';
import { useMapSelectionStore } from '../../state/selection-store';
import { useDataStore, type MapPoint } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { DEFAULT_STADIA_STYLE_URL, INITIAL_CENTER, INITIAL_ZOOM } from './constants';
import { MapControls } from './controls';
import { createPointLayer } from './point-layer';
import { MapTooltip } from './tooltip';
import { useMapInteractions } from './use-interactions';

export function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const pointsRef = useRef<MapPoint[]>([]);
  const [renderMap, setRenderMap] = useState<maplibregl.Map | null>(null);
  const [, setMapViewVersion] = useState(0);
  const pointsById = useDataStore((state) => state.pointsById);
  const loadPoints = useDataStore((state) => state.loadPoints);
  const filteredPoints = useFilterStore((state) => state.visiblePoints);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const addSelection = useMapSelectionStore((state) => state.addSelection);
  const toggleSelection = useMapSelectionStore((state) => state.toggleSelection);
  const setHovered = useMapSelectionStore((state) => state.setHovered);
  const attachMapInteractions = useMapInteractions({
    replaceSelection,
    addSelection,
    toggleSelection,
    setHovered,
  });
  const visiblePointIds = useMemo(
    () => new Set(filteredPoints.map((point) => point.id)),
    [filteredPoints],
  );
  const visibleSelectedIds = useMemo(() => {
    return new Set([...selectedIds].filter((id) => visiblePointIds.has(id)));
  }, [selectedIds, visiblePointIds]);

  useEffect(() => {
    const mapContainerElement = mapContainerRef.current;
    if (!mapContainerElement || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerElement,
      style: import.meta.env.VITE_STADIA_STYLE_URL ?? DEFAULT_STADIA_STYLE_URL,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.addControl(new ScaleControl({ unit: 'imperial' }), 'bottom-right');
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;

    const overlay = new MapboxOverlay({
      interleaved: false,
      layers: [],
    });
    map.addControl(overlay);
    overlayRef.current = overlay;

    const updateLayers = () => {
      overlay.setProps({
        layers: [createPointLayer(pointsRef.current, useMapSelectionStore.getState().selectedIds)],
      });
    };

    const handleMapViewChange = () => {
      setMapViewVersion((version) => version + 1);
    };

    map.on('load', () => {
      setRenderMap(map);
      updateLayers();
    });
    const cleanupMapInteractions = attachMapInteractions({
      map,
      overlay,
      mapContainerElement,
      onMapViewChange: handleMapViewChange,
    });

    return () => {
      cleanupMapInteractions();
      overlay.finalize();
      overlayRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [attachMapInteractions]);

  // Keep the MapLibre canvas dimensions synchronized with CSS-driven container
  // size transitions. Without this, width animations can briefly expose blank
  // regions while the map catches up to the new layout.
  useEffect(() => {
    const map = mapRef.current;
    const mapContainerElement = mapContainerRef.current;

    if (!renderMap || !map || !mapContainerElement || typeof ResizeObserver === 'undefined') {
      return;
    }

    let animationFrameId: number | null = null;
    const scheduleResize = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        map.resize();
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleResize();
    });

    resizeObserver.observe(mapContainerElement);
    scheduleResize();

    return () => {
      resizeObserver.disconnect();

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [renderMap]);

  useEffect(() => {
    void loadPoints();
  }, [loadPoints]);

  useEffect(() => {
    pointsRef.current = filteredPoints;
    if (!overlayRef.current) {
      return;
    }

    overlayRef.current.setProps({
      layers: [createPointLayer(pointsRef.current, useMapSelectionStore.getState().selectedIds)],
    });
  }, [filteredPoints]);

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

  useEffect(() => {
    if (!overlayRef.current) {
      return;
    }

    overlayRef.current.setProps({
      layers: [createPointLayer(pointsRef.current, visibleSelectedIds)],
    });
  }, [visibleSelectedIds]);

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
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
        />
        {selectedPoint && projectedTooltip ? (
          <MapTooltip
            pointId={selectedPoint.id}
            date={selectedPoint.date}
            recordType={selectedPoint.recordType}
            address={selectedPoint.address}
            x={projectedTooltip.x}
            y={projectedTooltip.y}
          />
        ) : null}
      </div>
    </section>
  );
}
