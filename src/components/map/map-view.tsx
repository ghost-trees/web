import { ScatterplotLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { useEffect, useRef, useState } from 'react';
import maplibregl, { NavigationControl, ScaleControl } from 'maplibre-gl';
import { useMapSelectionStore } from '../../state/selection-store';
import { selectPoints, useDataStore, type MapPoint } from '../../state/data-store';
import { MapTooltip } from './map-tooltip';

const DEFAULT_STADIA_STYLE_URL = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';
const POINT_LAYER_ID = 'tree-points-layer';
const BRUSH_MIN_PIXELS = 4;

function createPointLayer(points: MapPoint[], selectedIds: Set<string>) {
  return new ScatterplotLayer<MapPoint>({
    id: POINT_LAYER_ID,
    data: points,
    pickable: true,
    radiusUnits: 'pixels',
    radiusMinPixels: 3,
    radiusMaxPixels: 18,
    getPosition: (point) => point.coordinates,
    getRadius: (point) => (selectedIds.has(point.id) ? 9 : 4),
    getFillColor: (point) =>
      selectedIds.has(point.id) ? [164, 211, 147, 255] : [164, 211, 147, 220],
    stroked: false,
  });
}

export function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const pointsRef = useRef<MapPoint[]>([]);
  const brushStartRef = useRef<maplibregl.Point | null>(null);
  const brushAdditiveRef = useRef(false);
  const brushBoxRef = useRef<HTMLDivElement | null>(null);
  const [renderMap, setRenderMap] = useState<maplibregl.Map | null>(null);
  const [, setMapViewVersion] = useState(0);
  const points = useDataStore(selectPoints);
  const pointsById = useDataStore((state) => state.pointsById);
  const loadPoints = useDataStore((state) => state.loadPoints);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const addSelection = useMapSelectionStore((state) => state.addSelection);
  const toggleSelection = useMapSelectionStore((state) => state.toggleSelection);
  const setHovered = useMapSelectionStore((state) => state.setHovered);

  useEffect(() => {
    const mapContainerElement = mapContainerRef.current;
    if (!mapContainerElement || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerElement,
      style: import.meta.env.VITE_STADIA_STYLE_URL ?? DEFAULT_STADIA_STYLE_URL,
      center: [-84.388, 33.749],
      zoom: 10,
    });

    map.addControl(new NavigationControl(), 'top-right');
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

    const brushBoxElement = document.createElement('div');
    brushBoxElement.className =
      'pointer-events-none absolute z-20 hidden rounded border border-[var(--color-primary)] bg-[var(--color-primary)]/15';
    mapContainerElement.appendChild(brushBoxElement);
    brushBoxRef.current = brushBoxElement;

    const handleContextMenu = (event: MouseEvent) => {
      if (brushStartRef.current) {
        event.preventDefault();
      }
    };

    mapContainerElement.addEventListener('contextmenu', handleContextMenu);

    const updateLayers = () => {
      overlay.setProps({
        layers: [createPointLayer(pointsRef.current, useMapSelectionStore.getState().selectedIds)],
      });
    };

    const handleMapViewChange = () => {
      setMapViewVersion((version) => version + 1);
    };

    const endBrush = (event?: maplibregl.MapMouseEvent) => {
      const start = brushStartRef.current;
      if (!start) {
        return;
      }

      const endPoint = event?.point;
      const brushBox = brushBoxRef.current;
      if (brushBox) {
        brushBox.style.display = 'none';
      }
      brushStartRef.current = null;

      if (!endPoint) {
        return;
      }

      const width = Math.abs(endPoint.x - start.x);
      const height = Math.abs(endPoint.y - start.y);
      if (width < BRUSH_MIN_PIXELS || height < BRUSH_MIN_PIXELS) {
        return;
      }

      const x = Math.min(start.x, endPoint.x);
      const y = Math.min(start.y, endPoint.y);
      const hitPoints = overlay.pickObjects({
        x,
        y,
        width,
        height,
        layerIds: [POINT_LAYER_ID],
      });

      const ids = hitPoints
        .map((info) => info.object as MapPoint | undefined)
        .filter((point): point is MapPoint => Boolean(point))
        .map((point) => point.id);

      if (brushAdditiveRef.current) {
        addSelection(ids);
      } else {
        replaceSelection(ids);
      }
    };

    const updateBrushBox = (event: maplibregl.MapMouseEvent) => {
      const start = brushStartRef.current;
      const brushBox = brushBoxRef.current;
      if (!start || !brushBox) {
        return;
      }

      const x = Math.min(start.x, event.point.x);
      const y = Math.min(start.y, event.point.y);
      const width = Math.abs(event.point.x - start.x);
      const height = Math.abs(event.point.y - start.y);

      brushBox.style.display = 'block';
      brushBox.style.left = `${x}px`;
      brushBox.style.top = `${y}px`;
      brushBox.style.width = `${width}px`;
      brushBox.style.height = `${height}px`;
    };

    map.on('load', () => {
      setRenderMap(map);
      updateLayers();
    });

    map.on('click', (event) => {
      if (brushStartRef.current) {
        return;
      }

      const hit = overlay.pickObject({
        x: event.point.x,
        y: event.point.y,
        layerIds: [POINT_LAYER_ID],
        radius: 6,
      });

      const point = hit?.object as MapPoint | undefined;
      if (!point) {
        replaceSelection([]);
        return;
      }

      if (event.originalEvent.shiftKey) {
        toggleSelection(point.id);
      } else {
        replaceSelection([point.id]);
      }
    });

    map.on('mousemove', (event) => {
      if (brushStartRef.current) {
        updateBrushBox(event);
        return;
      }

      const hit = overlay.pickObject({
        x: event.point.x,
        y: event.point.y,
        layerIds: [POINT_LAYER_ID],
        radius: 4,
      });

      const point = hit?.object as MapPoint | undefined;
      setHovered(point?.id ?? null);
    });

    map.on('mousedown', (event) => {
      if (event.originalEvent.button !== 2) {
        return;
      }

      brushStartRef.current = event.point;
      brushAdditiveRef.current = event.originalEvent.shiftKey;
    });

    map.on('mouseup', (event) => {
      endBrush(event);
    });

    map.on('mouseout', () => {
      endBrush();
      setHovered(null);
    });
    map.on('move', handleMapViewChange);
    map.on('zoom', handleMapViewChange);
    map.on('resize', handleMapViewChange);

    return () => {
      mapContainerElement.removeEventListener('contextmenu', handleContextMenu);
      brushBoxRef.current?.remove();
      brushBoxRef.current = null;
      map.off('move', handleMapViewChange);
      map.off('zoom', handleMapViewChange);
      map.off('resize', handleMapViewChange);
      overlay.finalize();
      overlayRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [addSelection, replaceSelection, setHovered, toggleSelection]);

  useEffect(() => {
    void loadPoints();
  }, [loadPoints]);

  useEffect(() => {
    pointsRef.current = points;
    if (!overlayRef.current) {
      return;
    }

    overlayRef.current.setProps({
      layers: [createPointLayer(pointsRef.current, useMapSelectionStore.getState().selectedIds)],
    });
  }, [points]);

  useEffect(() => {
    if (!overlayRef.current) {
      return;
    }

    overlayRef.current.setProps({
      layers: [createPointLayer(pointsRef.current, selectedIds)],
    });
  }, [selectedIds]);

  const selectedPointId = selectedIds.size === 1 ? selectedIds.values().next().value : null;
  const selectedPoint = selectedPointId ? pointsById.get(selectedPointId) : null;
  const projectedTooltip =
    selectedPoint && renderMap ? renderMap.project(selectedPoint.coordinates) : null;

  return (
    <section
      aria-label="Map View"
      className="flex min-h-0 w-full flex-1 bg-[var(--color-surface-container-low)]"
    >
      <div className="relative h-full w-full">
        <div ref={mapContainerRef} className="h-full w-full" />
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
