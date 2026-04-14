/**
 * @file use-interactions.ts
 * @description
 * Hook that wires pointer interactions for map point selection, hover, and brush selection.
 */

import { MapboxOverlay } from '@deck.gl/mapbox';
import { useCallback, useRef } from 'react';
import type maplibregl from 'maplibre-gl';
import type { MapPoint } from '../../state/data-store';
import { BRUSH_MIN_PIXELS, POINT_LAYER_ID } from './constants';

type UseMapInteractionsArgs = {
  replaceSelection: (ids: string[]) => void;
  addSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  setHovered: (id: string | null) => void;
};

type AttachMapInteractionsArgs = {
  map: maplibregl.Map;
  overlay: MapboxOverlay;
  mapContainerElement: HTMLDivElement;
  onMapViewChange: () => void;
};

export function useMapInteractions({
  replaceSelection,
  addSelection,
  toggleSelection,
  setHovered,
}: UseMapInteractionsArgs) {
  const brushStartRef = useRef<maplibregl.Point | null>(null);
  const brushAdditiveRef = useRef(false);
  const brushBoxRef = useRef<HTMLDivElement | null>(null);

  return useCallback(
    ({ map, overlay, mapContainerElement, onMapViewChange }: AttachMapInteractionsArgs) => {
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

      const handleClick = (event: maplibregl.MapMouseEvent) => {
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
      };

      const handleMouseMove = (event: maplibregl.MapMouseEvent) => {
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
      };

      const handleMouseDown = (event: maplibregl.MapMouseEvent) => {
        if (event.originalEvent.button !== 2) {
          return;
        }

        brushStartRef.current = event.point;
        brushAdditiveRef.current = event.originalEvent.shiftKey;
      };

      const handleMouseUp = (event: maplibregl.MapMouseEvent) => {
        endBrush(event);
      };

      const handleMouseOut = () => {
        endBrush();
        setHovered(null);
      };

      mapContainerElement.addEventListener('contextmenu', handleContextMenu);
      map.on('click', handleClick);
      map.on('mousemove', handleMouseMove);
      map.on('mousedown', handleMouseDown);
      map.on('mouseup', handleMouseUp);
      map.on('mouseout', handleMouseOut);
      map.on('move', onMapViewChange);
      map.on('zoom', onMapViewChange);
      map.on('resize', onMapViewChange);

      return () => {
        mapContainerElement.removeEventListener('contextmenu', handleContextMenu);
        map.off('click', handleClick);
        map.off('mousemove', handleMouseMove);
        map.off('mousedown', handleMouseDown);
        map.off('mouseup', handleMouseUp);
        map.off('mouseout', handleMouseOut);
        map.off('move', onMapViewChange);
        map.off('zoom', onMapViewChange);
        map.off('resize', onMapViewChange);
        brushBoxRef.current?.remove();
        brushBoxRef.current = null;
        brushStartRef.current = null;
      };
    },
    [addSelection, replaceSelection, setHovered, toggleSelection],
  );
}
