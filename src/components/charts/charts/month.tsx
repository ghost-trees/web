import { useEffect, useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useFilterStore } from '../../../state/filter-store';
import type { MapPoint } from '../../../state/data-store';
import { useMapSelectionStore } from '../../../state/selection-store';
import { rgbaFromTuple } from '../../../utils/color';
import { MONTH_LABELS, fromYearMonthKey, parseYearMonth, toYearMonthKey } from '../../../utils/date';
import { POINT_FILL_COLOR_SELECTED } from '../../map/constants';
import { ECHARTS_THEME_NAME } from '../echarts-theme';

type MonthBucket = {
  key: number;
  label: string;
  count: number;
  pointIds: string[];
};

function formatShortYearLabel(year: number): string {
  return `${year % 100}`.padStart(2, '0');
}

function formatMonthLabel(monthKey: number): string {
  const yearMonth = fromYearMonthKey(monthKey);
  return `${MONTH_LABELS[yearMonth.monthIndex]} '${formatShortYearLabel(yearMonth.year)}`;
}

function formatMonthRangeLabel(monthKey: number): string {
  const yearMonth = fromYearMonthKey(monthKey);
  return `${MONTH_LABELS[yearMonth.monthIndex]} ${yearMonth.year}`;
}

function buildMonthlyBuckets(
  points: MapPoint[],
  rangeStartMonthKey: number,
  rangeEndMonthKey: number,
): MonthBucket[] {
  const bucketMap = new Map<number, { count: number; pointIds: string[] }>();

  for (const point of points) {
    const yearMonth = parseYearMonth(point.date);
    if (!yearMonth) {
      continue;
    }

    const monthKey = toYearMonthKey(yearMonth);
    const existingBucket = bucketMap.get(monthKey);
    if (existingBucket) {
      existingBucket.count += 1;
      existingBucket.pointIds.push(point.id);
      continue;
    }

    bucketMap.set(monthKey, {
      count: 1,
      pointIds: [point.id],
    });
  }

  const monthlyBuckets: MonthBucket[] = [];
  for (let monthKey = rangeStartMonthKey; monthKey <= rangeEndMonthKey; monthKey += 1) {
    const bucket = bucketMap.get(monthKey);
    monthlyBuckets.push({
      key: monthKey,
      label: formatMonthLabel(monthKey),
      count: bucket?.count ?? 0,
      pointIds: bucket?.pointIds ?? [],
    });
  }

  return monthlyBuckets;
}

type SeriesEvent = {
  seriesType?: string;
  dataIndex?: number;
};

function getMonthPointIds(params: SeriesEvent, monthlyBuckets: MonthBucket[]): string[] | null {
  if (params.seriesType !== 'line' && params.seriesType !== 'scatter') {
    return null;
  }

  const monthIndex = params.dataIndex;
  if (typeof monthIndex !== 'number' || monthIndex < 0 || monthIndex >= monthlyBuckets.length) {
    return null;
  }

  return monthlyBuckets[monthIndex]?.pointIds ?? null;
}

export function MonthChart() {
  const visiblePoints = useFilterStore((state) => state.visiblePoints);
  const minMonthKey = useFilterStore((state) => state.minMonthKey);
  const maxMonthKey = useFilterStore((state) => state.maxMonthKey);
  const minAvailableMonthKey = useFilterStore((state) => state.minAvailableMonthKey);
  const hasAvailableMonths = useFilterStore((state) => state.hasAvailableMonths);
  const timeFilterMode = useFilterStore((state) => state.timeFilterMode);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const setHoveredIds = useMapSelectionStore((state) => state.setHoveredIds);
  const selectedCount = selectedIds.size;
  const monthlyBuckets = useMemo(() => {
    if (!hasAvailableMonths) {
      return [];
    }

    const rangeStartMonthKey = timeFilterMode === 'through' ? minAvailableMonthKey : minMonthKey;
    if (rangeStartMonthKey > maxMonthKey) {
      return [];
    }

    return buildMonthlyBuckets(visiblePoints, rangeStartMonthKey, maxMonthKey);
  }, [hasAvailableMonths, maxMonthKey, minAvailableMonthKey, minMonthKey, timeFilterMode, visiblePoints]);
  const chartTitle = useMemo(() => {
    const baseTitle = 'Records by Month';
    if (!hasAvailableMonths) {
      return {
        baseTitle,
        rangeReadout: null as string | null,
      };
    }

    const rangeStartMonthKey = timeFilterMode === 'through' ? minAvailableMonthKey : minMonthKey;
    const rangeReadout = `${formatMonthRangeLabel(rangeStartMonthKey)} - ${formatMonthRangeLabel(maxMonthKey)}`;
    return {
      baseTitle,
      rangeReadout,
    };
  }, [hasAvailableMonths, maxMonthKey, minAvailableMonthKey, minMonthKey, timeFilterMode]);
  const isMonthFullySelected = useMemo(() => {
    return monthlyBuckets.map((bucket) => {
      const monthPointIds = bucket.pointIds;
      if (monthPointIds.length === 0 || selectedIds.size !== monthPointIds.length) {
        return false;
      }

      return monthPointIds.every((pointId) => selectedIds.has(pointId));
    });
  }, [monthlyBuckets, selectedIds]);
  const isMonthPartiallySelected = useMemo(() => {
    return monthlyBuckets.map((bucket, monthIndex) => {
      const monthPointIds = bucket.pointIds;
      if (monthPointIds.length === 0 || isMonthFullySelected[monthIndex]) {
        return false;
      }

      let intersectionCount = 0;
      for (const monthPointId of monthPointIds) {
        if (selectedIds.has(monthPointId)) {
          intersectionCount += 1;
        }
      }

      return intersectionCount > 0 && intersectionCount < monthPointIds.length;
    });
  }, [isMonthFullySelected, monthlyBuckets, selectedIds]);
  const hasMonthlyData = monthlyBuckets.length > 0;
  const monthTickStep = 4;
  const xAxisLabelRotation = 28;
  const selectedScatterFillColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED);
  const partialSelectionBorderColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED, 0.62);
  const monthlySeriesData = useMemo<
    {
      value: [number, number];
      itemStyle: {
        color?: string;
        borderWidth?: number;
        borderColor?: string;
      };
    }[]
  >(
    () =>
      monthlyBuckets.map((bucket, monthIndex) => {
        const itemStyle: { color?: string; borderWidth?: number; borderColor?: string } = {};

        if (isMonthFullySelected[monthIndex]) {
          itemStyle.color = selectedScatterFillColor;
        } else if (isMonthPartiallySelected[monthIndex]) {
          itemStyle.borderWidth = 2;
          itemStyle.borderColor = partialSelectionBorderColor;
        }

        return {
          value: [monthIndex, bucket.count],
          itemStyle,
        };
      }),
    [
      isMonthFullySelected,
      isMonthPartiallySelected,
      monthlyBuckets,
      partialSelectionBorderColor,
      selectedScatterFillColor,
    ],
  );

  const chartOption = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'item',
      },
      grid: {
        left: 48,
        right: 16,
        top: 20,
        bottom: xAxisLabelRotation > 0 ? 54 : 36,
      },
      xAxis: {
        type: 'category',
        data: monthlyBuckets.map((bucket) => bucket.label),
        boundaryGap: false,
        axisTick: {
          alignWithLabel: true,
        },
        splitLine: {
          show: true,
          interval: monthTickStep - 1,
          lineStyle: {
            opacity: 0.35,
          },
        },
        axisLabel: {
          interval: 0,
          rotate: xAxisLabelRotation,
          hideOverlap: false,
          formatter: (value: string, index: number) => {
            if (index % monthTickStep === 0) {
              return value;
            }

            return '';
          },
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          name: 'Records',
          type: 'line',
          data: monthlySeriesData,
          showSymbol: false,
          lineStyle: {
            width: 2,
          },
        },
        {
          name: 'Records',
          type: 'scatter',
          data: monthlySeriesData,
          symbolSize: 9,
          z: 3,
        },
      ],
    }),
    [monthTickStep, monthlyBuckets, monthlySeriesData, xAxisLabelRotation],
  );
  const chartEvents = useMemo(
    () => ({
      mouseover: (params: SeriesEvent) => {
        if (selectedCount > 0) {
          return;
        }
        const monthPointIds = getMonthPointIds(params, monthlyBuckets);
        if (!monthPointIds || monthPointIds.length === 0) {
          return;
        }
        setHoveredIds(monthPointIds);
      },
      mouseout: () => {
        setHoveredIds([]);
      },
      globalout: () => {
        setHoveredIds([]);
      },
      click: (params: SeriesEvent) => {
        const monthPointIds = getMonthPointIds(params, monthlyBuckets);
        if (!monthPointIds || monthPointIds.length === 0) {
          return;
        }
        replaceSelection(monthPointIds);
      },
    }),
    [monthlyBuckets, replaceSelection, selectedCount, setHoveredIds],
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
      aria-label="Records by Month chart"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">
        <span className="block">{chartTitle.baseTitle}</span>
        {chartTitle.rangeReadout ? (
          <span className="block text-xs font-normal text-[var(--color-on-surface-variant)]">
            {chartTitle.rangeReadout}
          </span>
        ) : null}
      </h3>
      {hasMonthlyData ? (
        <ReactECharts
          option={chartOption}
          onEvents={chartEvents}
          theme={ECHARTS_THEME_NAME}
          style={{ height: 280, width: '100%' }}
          notMerge
          lazyUpdate
        />
      ) : (
        <p className="mt-2 text-xs text-[var(--color-on-surface-variant)]">
          No records with valid dates are available for the current filters.
        </p>
      )}
    </section>
  );
}
