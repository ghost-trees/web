import { useEffect, useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useFilterStore } from '../../../state/filter-store';
import { useMapSelectionStore } from '../../../state/selection-store';
import { rgbaFromTuple } from '../../../utils/color';
import { formatTreeTypeLabel } from '../../../utils/tree-type';
import { POINT_FILL_COLOR_SELECTED } from '../../map/constants';
import { ECHARTS_THEME_NAME } from '../echarts-theme';

type TreeTypeBucket = {
  treeType: string;
  pointIds: string[];
};

type BarSeriesEvent = {
  seriesType?: string;
  dataIndex?: number;
};

function buildTreeTypeBuckets(
  points: ReturnType<typeof useFilterStore.getState>['visiblePoints'],
): TreeTypeBucket[] {
  const pointIdsByTreeType = new Map<string, string[]>();

  for (const point of points) {
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

function getTreeTypePointIds(
  params: BarSeriesEvent,
  treeTypeBuckets: TreeTypeBucket[],
): string[] | null {
  if (params.seriesType !== 'bar') {
    return null;
  }

  const bucketIndex = params.dataIndex;
  if (typeof bucketIndex !== 'number' || bucketIndex < 0 || bucketIndex >= treeTypeBuckets.length) {
    return null;
  }

  return treeTypeBuckets[bucketIndex]?.pointIds ?? null;
}

export function RecordsByTreeTypeBarChart() {
  const visiblePoints = useFilterStore((state) => state.visiblePoints);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const setHoveredIds = useMapSelectionStore((state) => state.setHoveredIds);
  const selectedCount = selectedIds.size;
  const treeTypeBuckets = useMemo(() => buildTreeTypeBuckets(visiblePoints), [visiblePoints]);
  const selectedBarFillColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED);
  const partialSelectionBorderColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED, 0.62);

  const barSeriesData = useMemo(() => {
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
        itemStyle.color = selectedBarFillColor;
      } else if (isPartiallySelected) {
        itemStyle.borderColor = partialSelectionBorderColor;
        itemStyle.borderWidth = 2;
      }

      return {
        value: bucket.pointIds.length,
        itemStyle,
      };
    });
  }, [partialSelectionBorderColor, selectedBarFillColor, selectedIds, treeTypeBuckets]);

  const hasTreeTypeData = barSeriesData.length > 0;
  const chartHeight = Math.max(280, treeTypeBuckets.length * 28);
  const chartOption = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: 116,
        right: 20,
        top: 20,
        bottom: 20,
      },
      xAxis: {
        type: 'value',
        minInterval: 1,
      },
      yAxis: {
        type: 'category',
        data: treeTypeBuckets.map((bucket) => formatTreeTypeLabel(bucket.treeType)),
        inverse: true,
      },
      series: [
        {
          name: 'Records',
          type: 'bar',
          data: barSeriesData,
          barMaxWidth: 24,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
          },
        },
      ],
    }),
    [barSeriesData, treeTypeBuckets],
  );

  const chartEvents = useMemo(
    () => ({
      mouseover: (params: BarSeriesEvent) => {
        if (selectedCount > 0) {
          return;
        }

        const bucketPointIds = getTreeTypePointIds(params, treeTypeBuckets);
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
      click: (params: BarSeriesEvent) => {
        const bucketPointIds = getTreeTypePointIds(params, treeTypeBuckets);
        if (!bucketPointIds) {
          return;
        }
        replaceSelection(bucketPointIds);
      },
    }),
    [replaceSelection, selectedCount, setHoveredIds, treeTypeBuckets],
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
      aria-label="Records by Tree Type (Bar) chart"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">
        Records by Tree Type (Bar)
      </h3>
      {hasTreeTypeData ? (
        <ReactECharts
          option={chartOption}
          onEvents={chartEvents}
          theme={ECHARTS_THEME_NAME}
          style={{ height: chartHeight, width: '100%' }}
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
