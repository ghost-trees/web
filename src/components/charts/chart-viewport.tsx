import type { ReactNode } from 'react';
import type { ChartId } from './chart-definitions';
import { RecordsByMonthChart } from './charts/records-by-month-chart';
import { RecordsByTreeTypeChart } from './charts/records-by-tree-type-chart';

type ChartViewportProps = {
  chartId: ChartId;
};

export function ChartViewport({ chartId }: ChartViewportProps) {
  const chartContentById: Record<ChartId, ReactNode> = {
    'records-by-month': <RecordsByMonthChart />,
    'records-by-tree-type': <RecordsByTreeTypeChart />,
  };

  return <div className="mt-4 min-h-0 flex-1">{chartContentById[chartId]}</div>;
}
