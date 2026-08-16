import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  AxisPointerComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import type { ComponentProps } from 'react';
import { ECHARTS_THEME_NAME, registerEchartsTheme } from './echarts-theme';

// Register only the chart types, components, and renderer this app actually uses so
// bundlers can drop the rest of ECharts. Importing this module (which happens lazily
// via the Charts pane) is what pulls ECharts into its own async chunk.
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  AxisPointerComponent,
  CanvasRenderer,
]);

registerEchartsTheme();

type ThemedEChartProps = Omit<ComponentProps<typeof ReactEChartsCore>, 'echarts' | 'theme'>;

/**
 * Thin wrapper around `echarts-for-react`'s tree-shakable core component. It binds the
 * modular ECharts instance and the shared dark theme so individual charts stay declarative.
 */
export function ThemedEChart(props: ThemedEChartProps) {
  return <ReactEChartsCore echarts={echarts} theme={ECHARTS_THEME_NAME} {...props} />;
}
