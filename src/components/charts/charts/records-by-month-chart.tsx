import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useFilterStore } from '../../../state/filter-store';
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

function buildMonthlyCounts(dateValues: string[]): number[] {
  const counts = Array<number>(12).fill(0);
  for (const dateValue of dateValues) {
    const monthIndex = parseMonthIndex(dateValue);
    if (monthIndex !== null) {
      counts[monthIndex] += 1;
    }
  }
  return counts;
}

export function RecordsByMonthChart() {
  const visiblePoints = useFilterStore((state) => state.visiblePoints);
  const monthlyCounts = useMemo(
    () => buildMonthlyCounts(visiblePoints.map((point) => point.date)),
    [visiblePoints],
  );
  const hasMonthlyData = monthlyCounts.some((count) => count > 0);

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
          data: monthlyCounts,
          barMaxWidth: 28,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    }),
    [monthlyCounts],
  );

  return (
    <section
      aria-label="Records by Month chart"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">Records by Month</h3>
      {hasMonthlyData ? (
        <ReactECharts
          option={chartOption}
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
