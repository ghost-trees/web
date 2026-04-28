import * as echarts from 'echarts';

export const ECHARTS_THEME_NAME = 'ghosttrees-dark';

let isThemeRegistered = false;

function resolveCssVariable(variableName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value.length > 0 ? value : fallback;
}

export function registerEchartsTheme(): void {
  if (isThemeRegistered) {
    return;
  }

  echarts.registerTheme(ECHARTS_THEME_NAME, {
    backgroundColor: resolveCssVariable('--color-surface-container-high', '#1d1b20'),
    color: [
      resolveCssVariable('--color-primary', '#6e8cff'),
      resolveCssVariable('--color-primary-container', '#41539f'),
      resolveCssVariable('--color-secondary-container', '#4b4a5e'),
    ],
    textStyle: {
      color: resolveCssVariable('--color-on-surface', '#e6e1e5'),
    },
    title: {
      textStyle: {
        color: resolveCssVariable('--color-on-surface', '#e6e1e5'),
      },
      subtextStyle: {
        color: resolveCssVariable('--color-on-surface-variant', '#cac4d0'),
      },
    },
    legend: {
      textStyle: {
        color: resolveCssVariable('--color-on-surface-variant', '#cac4d0'),
      },
    },
    tooltip: {
      backgroundColor: resolveCssVariable('--color-surface-container-low', '#211f26'),
      borderColor: resolveCssVariable('--color-outline-variant', '#4a4458'),
      borderWidth: 1,
      textStyle: {
        color: resolveCssVariable('--color-on-surface', '#e6e1e5'),
      },
    },
    categoryAxis: {
      axisLine: {
        lineStyle: {
          color: resolveCssVariable('--color-outline-variant', '#4a4458'),
        },
      },
      axisLabel: {
        color: resolveCssVariable('--color-on-surface-variant', '#cac4d0'),
      },
    },
    valueAxis: {
      axisLine: {
        lineStyle: {
          color: resolveCssVariable('--color-outline-variant', '#4a4458'),
        },
      },
      splitLine: {
        lineStyle: {
          color: resolveCssVariable('--color-outline-variant', '#4a4458'),
          opacity: 0.4,
        },
      },
      axisLabel: {
        color: resolveCssVariable('--color-on-surface-variant', '#cac4d0'),
      },
    },
  });

  isThemeRegistered = true;
}
