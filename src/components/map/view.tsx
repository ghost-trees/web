/**
 * @file view.tsx
 * @description
 * Main map container that initializes the map instance, syncs layers with state,
 * and composes map UI elements.
 */

import { MapboxOverlay } from '@deck.gl/mapbox';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import maplibregl, { ScaleControl } from 'maplibre-gl';
import { useMapSelectionStore } from '../../state/selection-store';
import { useDataStore, type MapPoint } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';
import { asset } from '../../utils/asset';
import {
  ATLANTA_BOUNDARY_LAYER_ID,
  ATLANTA_BOUNDARY_LINE_WIDTH,
  ATLANTA_BOUNDARY_SOURCE_ID,
  DEFAULT_STADIA_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
} from './constants';
import { MapControls } from './controls';
import { createPointLayer } from './point-layer';
import { MapTooltip } from './tooltip';
import { useMapInteractions } from './use-interactions';

type BoundaryGeoJson = {
  type: FeatureCollection<Geometry, GeoJsonProperties>['type'];
  features: FeatureCollection<Geometry, GeoJsonProperties>['features'];
};

const getVisibilityValue = (isVisible: boolean): 'visible' | 'none' =>
  isVisible ? 'visible' : 'none';

function setAtlantaBoundaryVisibility(map: maplibregl.Map, isVisible: boolean): void {
  if (!map.getLayer(ATLANTA_BOUNDARY_LAYER_ID)) {
    return;
  }

  map.setLayoutProperty(ATLANTA_BOUNDARY_LAYER_ID, 'visibility', getVisibilityValue(isVisible));
}

function getAtlantaBoundaryLineColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
}

async function addAtlantaBoundaryLayer(map: maplibregl.Map, isVisible: boolean): Promise<void> {
  const lineColor = getAtlantaBoundaryLineColor();

  if (!map.getSource(ATLANTA_BOUNDARY_SOURCE_ID)) {
    const response = await fetch(asset('atlanta.geojson'));
    if (!response.ok) {
      throw new Error(`Unable to load atlanta.geojson: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as BoundaryGeoJson;
    if (!map.getStyle()) {
      return;
    }

    map.addSource(ATLANTA_BOUNDARY_SOURCE_ID, {
      type: 'geojson',
      data,
    });
  }

  if (!map.getLayer(ATLANTA_BOUNDARY_LAYER_ID)) {
    map.addLayer({
      id: ATLANTA_BOUNDARY_LAYER_ID,
      type: 'line',
      source: ATLANTA_BOUNDARY_SOURCE_ID,
      layout: {
        visibility: getVisibilityValue(isVisible),
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': lineColor,
        'line-width': ATLANTA_BOUNDARY_LINE_WIDTH,
        'line-opacity': 0.9,
      },
    });
  }

  setAtlantaBoundaryVisibility(map, isVisible);
}

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
  const scalePointsByFee = useUiStore((state) => state.scalePointsByFee);
  const showAtlantaBoundary = useUiStore((state) => state.showAtlantaBoundary);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const hoveredIds = useMapSelectionStore((state) => state.hoveredIds);
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
  const visibleHoveredIds = useMemo(() => {
    return new Set([...hoveredIds].filter((id) => visiblePointIds.has(id)));
  }, [hoveredIds, visiblePointIds]);

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
        layers: [
          createPointLayer(
            pointsRef.current,
            useMapSelectionStore.getState().selectedIds,
            useMapSelectionStore.getState().hoveredIds,
            useUiStore.getState().scalePointsByFee,
          ),
        ],
      });
    };

    const handleMapViewChange = () => {
      setMapViewVersion((version) => version + 1);
    };

    map.on('load', () => {
      setRenderMap(map);
      void addAtlantaBoundaryLayer(map, useUiStore.getState().showAtlantaBoundary).catch(
        (error) => {
          console.error(error);
        },
      );
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

  useEffect(() => {
    void loadPoints();
  }, [loadPoints]);

  useEffect(() => {
    pointsRef.current = filteredPoints;
    if (!overlayRef.current) {
      return;
    }

    overlayRef.current.setProps({
      layers: [
        createPointLayer(
          pointsRef.current,
          useMapSelectionStore.getState().selectedIds,
          useMapSelectionStore.getState().hoveredIds,
          scalePointsByFee,
        ),
      ],
    });
  }, [filteredPoints, scalePointsByFee]);

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
    const map = mapRef.current;
    if (!map) {
      return;
    }

    setAtlantaBoundaryVisibility(map, showAtlantaBoundary);
  }, [showAtlantaBoundary]);

  useEffect(() => {
    if (!overlayRef.current) {
      return;
    }

    overlayRef.current.setProps({
      layers: [
        createPointLayer(
          pointsRef.current,
          visibleSelectedIds,
          visibleHoveredIds,
          scalePointsByFee,
        ),
      ],
    });
  }, [visibleHoveredIds, visibleSelectedIds, scalePointsByFee]);

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
