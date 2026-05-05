import type { ReactNode } from 'react';
import type { ChartId } from './chart-definitions';
import { RecordsByMonthChart } from './charts/records-by-month-chart';
import { RecordsByTreeTypeBarChart } from './charts/records-by-tree-type-bar-chart';
import { RecordsByTreeTypeChart } from './charts/records-by-tree-type-chart';

type ChartViewportProps = {
  chartId: ChartId;
};

export function ChartViewport({ chartId }: ChartViewportProps) {
  const chartContentById: Record<ChartId, ReactNode> = {
    'records-by-month': <RecordsByMonthChart />,
    'records-by-tree-type': <RecordsByTreeTypeChart />,
    'records-by-tree-type-bar': <RecordsByTreeTypeBarChart />,
  };

  return <div className="mt-4 min-h-0">{chartContentById[chartId]}</div>;
}
