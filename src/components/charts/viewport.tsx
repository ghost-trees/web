import type { ReactNode } from 'react';
import type { ChartId } from './definitions';
import { MonthChart } from './charts/month';
import { TreeChart } from './charts/tree';
import { TreePieChart } from './charts/tree-pie';

type ChartViewportProps = {
  chartId: ChartId;
};

export function ChartViewport({ chartId }: ChartViewportProps) {
  const chartContentById: Record<ChartId, ReactNode> = {
    'records-by-month': <MonthChart />,
    'records-by-tree-type': <TreeChart />,
    'records-by-tree-type-pie': <TreePieChart />,
  };

  return <div className="mt-4 min-h-0">{chartContentById[chartId]}</div>;
}
