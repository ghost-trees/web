export type ChartId = 'records-by-month' | 'records-by-tree-type' | 'records-by-tree-type-bar';

export type ChartDefinition = {
  id: ChartId;
  label: string;
};

export const CHART_DEFINITIONS: ChartDefinition[] = [
  { id: 'records-by-month', label: 'Records by Month' },
  { id: 'records-by-tree-type', label: 'Records by Tree Type' },
  { id: 'records-by-tree-type-bar', label: 'Records by Tree Type (Bar)' },
];
