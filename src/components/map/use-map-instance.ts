import { MapboxOverlay } from '@deck.gl/mapbox';
import { useEffect, useRef, type MutableRefObject } from 'react';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import maplibregl, { ScaleControl } from 'maplibre-gl';
import { asset } from '../../utils/asset';
import {
  ATLANTA_BOUNDARY_LAYER_ID,
  ATLANTA_BOUNDARY_LINE_WIDTH,
  ATLANTA_BOUNDARY_SOURCE_ID,
  DEFAULT_STADIA_STYLE_URL,
  INITIAL_CENTER,
  INITIAL_ZOOM,
} from './constants';
import type { AttachMapInteractions } from './use-interactions';

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

type UseMapInstanceArgs = {
  mapContainerRef: MutableRefObject<HTMLDivElement | null>;
  mapRef: MutableRefObject<maplibregl.Map | null>;
  overlayRef: MutableRefObject<MapboxOverlay | null>;
  attachMapInteractions: AttachMapInteractions;
  onMapViewChange: () => void;
  showAtlantaBoundary: boolean;
  onMapLoad: (map: maplibregl.Map) => void;
  onOverlayReady: (overlay: MapboxOverlay) => void;
};

export function useMapInstance({
  mapContainerRef,
  mapRef,
  overlayRef,
  attachMapInteractions,
  onMapViewChange,
  showAtlantaBoundary,
  onMapLoad,
  onOverlayReady,
}: UseMapInstanceArgs): void {
  const showAtlantaBoundaryRef = useRef(showAtlantaBoundary);
  const attachMapInteractionsRef = useRef(attachMapInteractions);
  const onMapViewChangeRef = useRef(onMapViewChange);
  const onMapLoadRef = useRef(onMapLoad);
  const onOverlayReadyRef = useRef(onOverlayReady);

  useEffect(() => {
    showAtlantaBoundaryRef.current = showAtlantaBoundary;
  }, [showAtlantaBoundary]);

  useEffect(() => {
    attachMapInteractionsRef.current = attachMapInteractions;
  }, [attachMapInteractions]);

  useEffect(() => {
    onMapViewChangeRef.current = onMapViewChange;
  }, [onMapViewChange]);

  useEffect(() => {
    onMapLoadRef.current = onMapLoad;
  }, [onMapLoad]);

  useEffect(() => {
    onOverlayReadyRef.current = onOverlayReady;
  }, [onOverlayReady]);

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
    onOverlayReadyRef.current(overlay);

    map.on('load', () => {
      onMapLoadRef.current(map);
      void addAtlantaBoundaryLayer(map, showAtlantaBoundaryRef.current).catch((error) => {
        console.error(error);
      });
    });
    const cleanupMapInteractions = attachMapInteractionsRef.current({
      map,
      overlay,
      mapContainerElement,
      onMapViewChange: () => onMapViewChangeRef.current(),
    });

    return () => {
      cleanupMapInteractions();
      overlay.finalize();
      overlayRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [
    mapContainerRef,
    mapRef,
    overlayRef,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    setAtlantaBoundaryVisibility(map, showAtlantaBoundary);
  }, [mapRef, showAtlantaBoundary]);
}
