import { ScatterplotLayer } from 'deck.gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { useEffect, useRef, useState } from 'react';
import maplibregl, { NavigationControl, ScaleControl } from 'maplibre-gl';
import { useMapSelectionStore } from '../../state/selection-store';
import { MapTooltip } from './map-tooltip';

const DEFAULT_STADIA_STYLE_URL = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';
const POINT_LAYER_ID = 'tree-points-layer';
const BRUSH_MIN_PIXELS = 4;
const DATA_GEOJSON_PATH = 'data.geojson';

type PointFeatureProperties = {
  record_number?: string;
  date?: string;
  record_type?: string;
  address?: string;
};

type PointFeature = {
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties?: PointFeatureProperties;
};

type DataGeoJson = {
  type: 'FeatureCollection';
  features: PointFeature[];
};

type MapPoint = {
  id: string;
  coordinates: [number, number];
  date: string;
  recordType: string;
  address: string;
};

type TooltipState = {
  pointId: string;
  date: string;
  recordType: string;
  address: string;
  x: number;
  y: number;
};

function toMapPoints(data: DataGeoJson): MapPoint[] {
  return data.features
    .filter((feature): feature is PointFeature => {
      return (
        feature.geometry?.type === 'Point' &&
        Array.isArray(feature.geometry.coordinates) &&
        feature.geometry.coordinates.length === 2
      );
    })
    .map((feature, index) => {
      const id = feature.properties?.record_number?.trim();
      return {
        id: id && id.length > 0 ? id : `point-${index}`,
        coordinates: feature.geometry.coordinates,
        date: feature.properties?.date?.trim() || 'Unknown',
        recordType: feature.properties?.record_type?.trim() || 'Unknown',
        address: feature.properties?.address?.trim() || 'Unknown',
      };
    });
}

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
  const tooltipPointRef = useRef<MapPoint | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
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

    const syncTooltipPosition = () => {
      const tooltipPoint = tooltipPointRef.current;
      if (!tooltipPoint) {
        return;
      }

      const projected = map.project(tooltipPoint.coordinates);
      setTooltip({
        pointId: tooltipPoint.id,
        date: tooltipPoint.date,
        recordType: tooltipPoint.recordType,
        address: tooltipPoint.address,
        x: projected.x,
        y: projected.y,
      });
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
      void (async () => {
        try {
          const dataGeoJsonUrl = `${import.meta.env.BASE_URL}${DATA_GEOJSON_PATH}`;
          const response = await fetch(dataGeoJsonUrl);
          if (!response.ok) {
            throw new Error(
              `Unable to load ${dataGeoJsonUrl}: ${response.status} ${response.statusText}`,
            );
          }

          const data = (await response.json()) as DataGeoJson;
          pointsRef.current = toMapPoints(data);
          updateLayers();
        } catch (error) {
          console.error(error);
        }
      })();
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
    map.on('move', syncTooltipPosition);
    map.on('zoom', syncTooltipPosition);
    map.on('resize', syncTooltipPosition);

    return () => {
      mapContainerElement.removeEventListener('contextmenu', handleContextMenu);
      brushBoxRef.current?.remove();
      brushBoxRef.current = null;
      tooltipPointRef.current = null;
      setTooltip(null);
      map.off('move', syncTooltipPosition);
      map.off('zoom', syncTooltipPosition);
      map.off('resize', syncTooltipPosition);
      overlay.finalize();
      overlayRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [addSelection, replaceSelection, setHovered, toggleSelection]);

  useEffect(() => {
    if (!overlayRef.current) {
      return;
    }

    overlayRef.current.setProps({
      layers: [createPointLayer(pointsRef.current, selectedIds)],
    });

    if (!mapRef.current || selectedIds.size !== 1) {
      tooltipPointRef.current = null;
      setTooltip(null);
      return;
    }

    const [selectedPointId] = selectedIds;
    const selectedPoint = pointsRef.current.find((point) => point.id === selectedPointId);
    if (!selectedPoint) {
      tooltipPointRef.current = null;
      setTooltip(null);
      return;
    }

    tooltipPointRef.current = selectedPoint;
    const projected = mapRef.current.project(selectedPoint.coordinates);
    setTooltip({
      pointId: selectedPoint.id,
      date: selectedPoint.date,
      recordType: selectedPoint.recordType,
      address: selectedPoint.address,
      x: projected.x,
      y: projected.y,
    });
  }, [selectedIds]);

  return (
    <section
      aria-label="Map View"
      className="flex min-h-0 w-full flex-1 bg-[var(--color-surface-container-low)]"
    >
      <div className="relative h-full w-full">
        <div ref={mapContainerRef} className="h-full w-full" />
        {tooltip ? (
          <MapTooltip
            pointId={tooltip.pointId}
            date={tooltip.date}
            recordType={tooltip.recordType}
            address={tooltip.address}
            x={tooltip.x}
            y={tooltip.y}
          />
        ) : null}
      </div>
    </section>
  );
}
