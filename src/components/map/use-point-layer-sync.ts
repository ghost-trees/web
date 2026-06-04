import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';
import type { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapPoint } from '../../state/data-store';
import { createPointLayer } from './point-layer';

type SyncPointLayerArgs = {
  overlay: MapboxOverlay;
  points: MapPoint[];
  selectedIds: Set<string>;
  hoveredIds: Set<string>;
  scalePointsByFee: boolean;
  appMode: 'explore' | 'timeline';
  timelineMonthKey: number | null;
};

export function syncPointLayer({
  overlay,
  points,
  selectedIds,
  hoveredIds,
  scalePointsByFee,
  appMode,
  timelineMonthKey,
}: SyncPointLayerArgs): void {
  overlay.setProps({
    layers: [
      createPointLayer(points, selectedIds, hoveredIds, scalePointsByFee, {
        enabled: appMode === 'timeline',
        currentMonthKey: timelineMonthKey,
      }),
    ],
  });
}

type UsePointLayerSyncArgs = {
  overlayRef: MutableRefObject<MapboxOverlay | null>;
  pointsForLayer: MapPoint[];
  selectedIds: Set<string>;
  hoveredIds: Set<string>;
  scalePointsByFee: boolean;
  appMode: 'explore' | 'timeline';
  timelineMonthKey: number | null;
};

export function usePointLayerSync({
  overlayRef,
  pointsForLayer,
  selectedIds,
  hoveredIds,
  scalePointsByFee,
  appMode,
  timelineMonthKey,
}: UsePointLayerSyncArgs) {
  const pointsRef = useRef<MapPoint[]>([]);
  const selectedIdsRef = useRef(selectedIds);
  const hoveredIdsRef = useRef(hoveredIds);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
    hoveredIdsRef.current = hoveredIds;
  }, [hoveredIds, selectedIds]);

  const syncCurrentLayer = useCallback(
    (selectedIdSet?: Set<string>, hoveredIdSet?: Set<string>) => {
      const overlay = overlayRef.current;
      if (!overlay) {
        return;
      }

      syncPointLayer({
        overlay,
        points: pointsRef.current,
        selectedIds: selectedIdSet ?? selectedIdsRef.current,
        hoveredIds: hoveredIdSet ?? hoveredIdsRef.current,
        scalePointsByFee,
        appMode,
        timelineMonthKey,
      });
    },
    [appMode, overlayRef, timelineMonthKey, scalePointsByFee],
  );

  useEffect(() => {
    pointsRef.current = pointsForLayer;
    syncCurrentLayer(selectedIds, hoveredIds);
  }, [hoveredIds, pointsForLayer, selectedIds, syncCurrentLayer]);

  return { pointsRef, syncCurrentLayer };
}
