export type ChartId = 'records-by-month';

export type ChartDefinition = {
  id: ChartId;
  label: string;
};

export const CHART_DEFINITIONS: ChartDefinition[] = [
  { id: 'records-by-month', label: 'Records by Month' },
];
