import { useEffect, useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { UNKNOWN_ZIP_CODE } from '../../../state/data-store';
import { useFilterStore } from '../../../state/filter-store';
import { useMapSelectionStore } from '../../../state/selection-store';
import { rgbaFromTuple } from '../../../utils/color';
import { UNKNOWN_DISPLAY_VALUE } from '../../../utils/tree-type';
import { POINT_FILL_COLOR_SELECTED } from '../../map/constants';
import { ECHARTS_THEME_NAME } from '../echarts-theme';

type ZipBucket = {
  zipCode: string;
  pointIds: string[];
};

type BarSeriesEvent = {
  seriesType?: string;
  dataIndex?: number;
};

function formatZipCodeLabel(zipCode: string): string {
  return zipCode === UNKNOWN_ZIP_CODE ? UNKNOWN_DISPLAY_VALUE : zipCode;
}

function buildZipBuckets(
  points: ReturnType<typeof useFilterStore.getState>['visiblePoints'],
): ZipBucket[] {
  const pointIdsByZipCode = new Map<string, string[]>();

  for (const point of points) {
    const pointIds = pointIdsByZipCode.get(point.zipCode) ?? [];
    pointIds.push(point.id);
    pointIdsByZipCode.set(point.zipCode, pointIds);
  }

  return [...pointIdsByZipCode.entries()]
    .map(([zipCode, pointIds]) => ({ zipCode, pointIds }))
    .sort(
      (leftBucket, rightBucket) =>
        rightBucket.pointIds.length - leftBucket.pointIds.length ||
        leftBucket.zipCode.localeCompare(rightBucket.zipCode, undefined, { numeric: true }),
    );
}

function getZipPointIds(params: BarSeriesEvent, zipBuckets: ZipBucket[]): string[] | null {
  if (params.seriesType !== 'bar') {
    return null;
  }

  const bucketIndex = params.dataIndex;
  if (typeof bucketIndex !== 'number' || bucketIndex < 0 || bucketIndex >= zipBuckets.length) {
    return null;
  }

  return zipBuckets[bucketIndex]?.pointIds ?? null;
}

export function ZipChart() {
  const visiblePoints = useFilterStore((state) => state.visiblePoints);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const setHoveredIds = useMapSelectionStore((state) => state.setHoveredIds);
  const selectedCount = selectedIds.size;
  const zipBuckets = useMemo(() => buildZipBuckets(visiblePoints), [visiblePoints]);
  const selectedBarFillColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED);
  const partialSelectionBorderColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED, 0.62);

  const barSeriesData = useMemo(() => {
    return zipBuckets.map((bucket) => {
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
  }, [partialSelectionBorderColor, selectedBarFillColor, selectedIds, zipBuckets]);

  const hasZipData = barSeriesData.length > 0;
  const chartHeight = Math.max(280, zipBuckets.length * 28);
  const chartOption = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: 92,
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
        data: zipBuckets.map((bucket) => formatZipCodeLabel(bucket.zipCode)),
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
    [barSeriesData, zipBuckets],
  );

  const chartEvents = useMemo(
    () => ({
      mouseover: (params: BarSeriesEvent) => {
        if (selectedCount > 0) {
          return;
        }

        const bucketPointIds = getZipPointIds(params, zipBuckets);
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
        const bucketPointIds = getZipPointIds(params, zipBuckets);
        if (!bucketPointIds) {
          return;
        }
        replaceSelection(bucketPointIds);
      },
    }),
    [replaceSelection, selectedCount, setHoveredIds, zipBuckets],
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
      aria-label="Records by Zip Code chart"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">Records by Zip Code</h3>
      {hasZipData ? (
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
