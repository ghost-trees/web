export type ChartId =
  | 'records-by-month'
  | 'records-by-month-bar'
  | 'records-by-tree-type'
  | 'records-by-tree-type-pie'
  | 'records-by-zip';

export type ChartDefinition = {
  id: ChartId;
  label: string;
};

export const CHART_DEFINITIONS: ChartDefinition[] = [
  { id: 'records-by-month', label: 'Records by Month' },
  // { id: 'records-by-month-bar', label: 'Records by Month (Bar)' },
  // { id: 'records-by-tree-type-pie', label: 'Records by Tree Type (Pie)' },
  { id: 'records-by-tree-type', label: 'Records by Tree Type' },
  { id: 'records-by-zip', label: 'Records by Zip Code' },
];
