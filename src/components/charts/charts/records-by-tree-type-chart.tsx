import { useEffect, useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useFilterStore } from '../../../state/filter-store';
import { useMapSelectionStore } from '../../../state/selection-store';
import { POINT_FILL_COLOR_SELECTED } from '../../map/constants';
import { ECHARTS_THEME_NAME } from '../echarts-theme';

type TreeTypeBucket = {
  treeType: string;
  pointIds: string[];
};

type PieSeriesEvent = {
  seriesType?: string;
  name?: string;
};

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildTreeTypeBuckets(
  points: ReturnType<typeof useFilterStore.getState>['visiblePoints'],
): TreeTypeBucket[] {
  const pointIdsByTreeType = new Map<string, string[]>();

  for (const point of points) {
    if (point.treeTypes.length === 0) {
      const unknownIds = pointIdsByTreeType.get('unknown') ?? [];
      unknownIds.push(point.id);
      pointIdsByTreeType.set('unknown', unknownIds);
      continue;
    }

    for (const treeType of point.treeTypes) {
      const pointIds = pointIdsByTreeType.get(treeType) ?? [];
      pointIds.push(point.id);
      pointIdsByTreeType.set(treeType, pointIds);
    }
  }

  return [...pointIdsByTreeType.entries()]
    .map(([treeType, pointIds]) => ({ treeType, pointIds }))
    .sort((a, b) => b.pointIds.length - a.pointIds.length || a.treeType.localeCompare(b.treeType));
}

function rgbaFromTuple(
  [red, green, blue, alpha]: [number, number, number, number],
  alphaOverride?: number,
): string {
  const resolvedAlpha = alphaOverride ?? alpha / 255;
  return `rgba(${red}, ${green}, ${blue}, ${resolvedAlpha})`;
}

export function RecordsByTreeTypeChart() {
  const visiblePoints = useFilterStore((state) => state.visiblePoints);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const setHoveredIds = useMapSelectionStore((state) => state.setHoveredIds);
  const selectedCount = selectedIds.size;
  const treeTypeBuckets = useMemo(() => buildTreeTypeBuckets(visiblePoints), [visiblePoints]);
  const pointIdsByTreeType = useMemo(
    () => new Map(treeTypeBuckets.map((bucket) => [bucket.treeType, bucket.pointIds])),
    [treeTypeBuckets],
  );
  const selectedSliceFillColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED);
  const partialSelectionBorderColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED, 0.62);

  const pieSeriesData = useMemo(() => {
    return treeTypeBuckets.map((bucket) => {
      const intersectionCount = bucket.pointIds.reduce(
        (count, pointId) => (selectedIds.has(pointId) ? count + 1 : count),
        0,
      );
      const isFullySelected =
        selectedIds.size === bucket.pointIds.length &&
        bucket.pointIds.length > 0 &&
        bucket.pointIds.every((pointId) => selectedIds.has(pointId));
      const isPartiallySelected =
        !isFullySelected && intersectionCount > 0 && intersectionCount < bucket.pointIds.length;
      const itemStyle: {
        color?: string;
        borderColor?: string;
        borderWidth?: number;
      } = {};

      if (isFullySelected) {
        itemStyle.color = selectedSliceFillColor;
      } else if (isPartiallySelected) {
        itemStyle.borderColor = partialSelectionBorderColor;
        itemStyle.borderWidth = 2;
      }

      return {
        value: bucket.pointIds.length,
        name: toTitleCase(bucket.treeType),
        treeType: bucket.treeType,
        itemStyle,
      };
    });
  }, [partialSelectionBorderColor, selectedIds, selectedSliceFillColor, treeTypeBuckets]);

  const hasTreeTypeData = pieSeriesData.length > 0;
  const chartOption = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'item',
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 0,
        top: 16,
        bottom: 16,
      },
      series: [
        {
          name: 'Records',
          type: 'pie',
          data: pieSeriesData,
          avoidLabelOverlap: true,
          minAngle: 2,
          label: {
            formatter: '{b}: {c}',
          },
        },
      ],
    }),
    [pieSeriesData],
  );

  const chartEvents = useMemo(
    () => ({
      mouseover: (params: PieSeriesEvent) => {
        if (selectedCount > 0 || params.seriesType !== 'pie' || !params.name) {
          return;
        }

        const bucketPointIds = pointIdsByTreeType.get(params.name.toLowerCase());
        if (!bucketPointIds) {
          return;
        }
        setHoveredIds(bucketPointIds);
      },
      mouseout: () => {
        setHoveredIds([]);
      },
      globalout: () => {
        setHoveredIds([]);
      },
      click: (params: PieSeriesEvent) => {
        if (params.seriesType !== 'pie' || !params.name) {
          return;
        }
        const bucketPointIds = pointIdsByTreeType.get(params.name.toLowerCase());
        if (!bucketPointIds) {
          return;
        }
        replaceSelection(bucketPointIds);
      },
    }),
    [pointIdsByTreeType, replaceSelection, selectedCount, setHoveredIds],
  );

  useEffect(() => {
    if (selectedCount > 0) {
      setHoveredIds([]);
    }
  }, [selectedCount, setHoveredIds]);

  useEffect(() => {
    return () => {
      setHoveredIds([]);
    };
  }, [setHoveredIds]);

  return (
    <section
      aria-label="Records by Tree Type chart"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">Records by Tree Type</h3>
      {hasTreeTypeData ? (
        <ReactECharts
          option={chartOption}
          onEvents={chartEvents}
          theme={ECHARTS_THEME_NAME}
          style={{ height: 320, width: '100%' }}
          notMerge
          lazyUpdate
        />
      ) : (
        <p className="mt-2 text-xs text-[var(--color-on-surface-variant)]">
          No records are available for the current filters.
        </p>
      )}
    </section>
  );
}
