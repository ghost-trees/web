/**
 * @file playback-map.tsx
 * @description
 * Display-only map behind the Home timeline. It is deliberately NOT the explore map: there is
 * no MapLibre instance, no controller, and no picking, so Home never pays for a second heavy
 * GL context. The camera is fixed on Atlanta and only the point layer animates.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Deck } from '@deck.gl/core';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, type BitmapLayerProps } from '@deck.gl/layers';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { useDataStore } from '../../state/data-store';
import { useFilterStore } from '../../state/filter-store';
import { useUiStore } from '../../state/ui-store';
import { DEFAULT_STADIA_RASTER_TILE_URL, INITIAL_CENTER, INITIAL_ZOOM } from '../map/constants';
import { createPointLayer } from '../map/point-layer';
import { deriveTimelineMonthKey, selectPointsForLayer } from '../map/timeline';
import { asset } from '../../utils/asset';
import { boundsOfFeatureCollection, viewStateForBounds } from '../../utils/geo-bounds';

const EMPTY_ID_SET: Set<string> = new Set();
const BASEMAP_TILE_URL =
  import.meta.env.VITE_STADIA_RASTER_TILE_URL ?? DEFAULT_STADIA_RASTER_TILE_URL;
// Used until the city limits arrive and the camera can be fitted to them.
const FALLBACK_VIEW_STATE = {
  longitude: INITIAL_CENTER[0],
  latitude: INITIAL_CENTER[1],
  zoom: INITIAL_ZOOM,
  pitch: 0,
  bearing: 0,
};
// Extra bottom padding clears the scrubber overlay; a touch more edge padding zooms out slightly
// and shifts the city up so southern points aren't clipped by the controls.
const BOUNDARY_FIT_PADDING = {
  top: 20,
  right: 24,
  bottom: 56,
  left: 24,
};

type BoundaryGeoJson = FeatureCollection<Geometry, GeoJsonProperties>;
type CanvasSize = { width: number; height: number };

export function HomePlaybackMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const deckRef = useRef<Deck | null>(null);
  const [boundary, setBoundary] = useState<BoundaryGeoJson | null>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const timelinePoints = useFilterStore((state) => state.timelinePoints);
  const timelineMonths = useFilterStore((state) => state.timelineMonths);
  const timelineMonthIndex = useUiStore((state) => state.timelineMonthIndex);
  const scalePointsByFee = useUiStore((state) => state.scalePointsByFee);
  const loadPoints = useDataStore((state) => state.loadPoints);
  const timelineMonthKey = deriveTimelineMonthKey(timelineMonths, timelineMonthIndex);

  useEffect(() => {
    void loadPoints();
  }, [loadPoints]);

  useEffect(() => {
    let isActive = true;

    const loadBoundary = async () => {
      const response = await fetch(asset('atlanta.geojson'));
      if (!response.ok) {
        throw new Error(
          `Unable to load atlanta.geojson: ${response.status} ${response.statusText}`,
        );
      }
      const data = (await response.json()) as BoundaryGeoJson;
      if (isActive) {
        setBoundary(data);
      }
    };

    void loadBoundary().catch((error) => {
      console.error(error);
    });

    return () => {
      isActive = false;
    };
  }, []);

  // The map is a tall column beside the headline on desktop and a short block on mobile, so the
  // fitted camera has to be recomputed whenever the canvas changes shape.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      setCanvasSize((current) =>
        current && Math.abs(current.width - width) < 1 && Math.abs(current.height - height) < 1
          ? current
          : { width, height },
      );
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const viewState = useMemo(() => {
    const bounds = boundary ? boundsOfFeatureCollection(boundary) : null;
    if (!bounds || !canvasSize) {
      return FALLBACK_VIEW_STATE;
    }

    const fitted = viewStateForBounds({
      bounds,
      width: canvasSize.width,
      height: canvasSize.height,
      padding: BOUNDARY_FIT_PADDING,
    });

    return fitted ? { ...fitted, pitch: 0, bearing: 0 } : FALLBACK_VIEW_STATE;
  }, [boundary, canvasSize]);

  const pointsForLayer = useMemo(
    () =>
      selectPointsForLayer({
        appMode: 'timeline',
        filteredPoints: timelinePoints,
        timelinePoints,
        timelineMonthKey,
      }),
    [timelineMonthKey, timelinePoints],
  );

  const layers = useMemo(() => {
    const basemapLayer = new TileLayer({
      id: 'home-basemap',
      data: BASEMAP_TILE_URL,
      tileSize: 256,
      minZoom: 0,
      maxZoom: 19,
      renderSubLayers: (props) => {
        const [[west, south], [east, north]] = props.tile.boundingBox;
        return new BitmapLayer(props, {
          data: undefined,
          image: props.data as BitmapLayerProps['image'],
          bounds: [west, south, east, north],
        });
      },
    });

    // Landing playback keeps the city outline off so the animation stays focused on points.
    const pointLayer = createPointLayer(
      pointsForLayer,
      EMPTY_ID_SET,
      EMPTY_ID_SET,
      scalePointsByFee,
      {
        enabled: true,
        currentMonthKey: timelineMonthKey,
      },
    );

    return [basemapLayer, pointLayer];
  }, [pointsForLayer, scalePointsByFee, timelineMonthKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // The camera is controlled rather than initial: it is refitted to the city limits once the
    // boundary loads and again whenever the canvas is resized.
    const deck = new Deck({
      canvas,
      viewState: FALLBACK_VIEW_STATE,
      controller: false,
      layers: [],
      getCursor: () => 'default',
    });
    deckRef.current = deck;

    return () => {
      deck.finalize();
      deckRef.current = null;
    };
  }, []);

  useEffect(() => {
    deckRef.current?.setProps({ layers });
  }, [layers]);

  useEffect(() => {
    deckRef.current?.setProps({ viewState });
  }, [viewState]);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-[var(--color-surface-container-lowest)]">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
    </div>
  );
}
