import { useEffect, useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useFilterStore } from '../../../state/filter-store';
import type { MapPoint } from '../../../state/data-store';
import { useMapSelectionStore } from '../../../state/selection-store';
import { rgbaFromTuple } from '../../../utils/color';
import { POINT_FILL_COLOR_SELECTED } from '../../map/constants';
import { ECHARTS_THEME_NAME } from '../echarts-theme';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function parseMonthIndex(dateValue: string): number | null {
  const parsedDate = new Date(dateValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getMonth();
  }

  const monthMatch = dateValue.match(
    /\b(0?[1-9]|1[0-2])[/-](\d{2,4})\b|\b(\d{2,4})[/-](0?[1-9]|1[0-2])\b/,
  );
  if (!monthMatch) {
    return null;
  }

  const month = monthMatch[1] ?? monthMatch[4];
  if (!month) {
    return null;
  }

  const monthIndex = Number(month) - 1;
  return monthIndex >= 0 && monthIndex < 12 ? monthIndex : null;
}

function buildMonthlyBuckets(points: MapPoint[]): {
  counts: number[];
  pointIdsByMonth: string[][];
} {
  const counts = Array<number>(12).fill(0);
  const pointIdsByMonth = Array.from({ length: 12 }, () => [] as string[]);

  for (const point of points) {
    const monthIndex = parseMonthIndex(point.date);
    if (monthIndex !== null) {
      counts[monthIndex] += 1;
      pointIdsByMonth[monthIndex].push(point.id);
    }
  }

  return { counts, pointIdsByMonth };
}

type SeriesEvent = {
  seriesType?: string;
  dataIndex?: number;
};

function getMonthPointIds(params: SeriesEvent, pointIdsByMonth: string[][]): string[] | null {
  if (params.seriesType !== 'bar') {
    return null;
  }
  const monthIndex = params.dataIndex;
  if (typeof monthIndex !== 'number' || monthIndex < 0 || monthIndex >= pointIdsByMonth.length) {
    return null;
  }

  return pointIdsByMonth[monthIndex];
}

export function RecordsByMonthChart() {
  const visiblePoints = useFilterStore((state) => state.visiblePoints);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const setHoveredIds = useMapSelectionStore((state) => state.setHoveredIds);
  const selectedCount = selectedIds.size;
  const monthlyBuckets = useMemo(() => buildMonthlyBuckets(visiblePoints), [visiblePoints]);
  const monthlyCounts = monthlyBuckets.counts;
  const isMonthFullySelected = useMemo(() => {
    return monthlyBuckets.pointIdsByMonth.map((monthPointIds) => {
      if (monthPointIds.length === 0 || selectedIds.size !== monthPointIds.length) {
        return false;
      }

      return monthPointIds.every((pointId) => selectedIds.has(pointId));
    });
  }, [monthlyBuckets.pointIdsByMonth, selectedIds]);
  const isMonthPartiallySelected = useMemo(() => {
    return monthlyBuckets.pointIdsByMonth.map((monthPointIds, monthIndex) => {
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
  }, [isMonthFullySelected, monthlyBuckets.pointIdsByMonth, selectedIds]);
  const hasMonthlyData = monthlyCounts.some((count) => count > 0);
  const selectedBarFillColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED);
  const partialSelectionBorderColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED, 0.62);
  const monthlySeriesData = useMemo(
    () =>
      monthlyCounts.map((count, monthIndex) => {
        const itemStyle: {
          color?: string;
          borderWidth?: number;
          borderColor?: string;
        } = {};

        if (isMonthFullySelected[monthIndex]) {
          itemStyle.color = selectedBarFillColor;
        } else if (isMonthPartiallySelected[monthIndex]) {
          itemStyle.borderWidth = 2;
          itemStyle.borderColor = partialSelectionBorderColor;
        }

        return {
          value: count,
          itemStyle,
        };
      }),
    [
      isMonthFullySelected,
      isMonthPartiallySelected,
      monthlyCounts,
      partialSelectionBorderColor,
      selectedBarFillColor,
    ],
  );

  const chartOption = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: 40,
        right: 16,
        top: 20,
        bottom: 32,
      },
      xAxis: {
        type: 'category',
        data: MONTH_LABELS,
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          name: 'Records',
          type: 'bar',
          data: monthlySeriesData,
          barMaxWidth: 28,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    }),
    [monthlySeriesData],
  );
  const chartEvents = useMemo(
    () => ({
      mouseover: (params: SeriesEvent) => {
        if (selectedCount > 0) {
          return;
        }
        const monthPointIds = getMonthPointIds(params, monthlyBuckets.pointIdsByMonth);
        if (!monthPointIds) {
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
        const monthPointIds = getMonthPointIds(params, monthlyBuckets.pointIdsByMonth);
        if (!monthPointIds) {
          return;
        }
        replaceSelection(monthPointIds);
      },
    }),
    [monthlyBuckets.pointIdsByMonth, replaceSelection, selectedCount, setHoveredIds],
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
      <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">Records by Month</h3>
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
