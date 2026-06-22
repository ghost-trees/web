import { useEffect, useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useFilterStore } from '../../../state/filter-store';
import type { MapPoint } from '../../../state/data-store';
import { useMapSelectionStore } from '../../../state/selection-store';
import { rgbaFromTuple } from '../../../utils/color';
import { POINT_FILL_COLOR_SELECTED } from '../../map/constants';
import { ECHARTS_THEME_NAME } from '../echarts-theme';

const FEE_BIN_COUNT = 5;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type FeeBin = {
  lo: number;
  hi: number;
  count: number;
  pointIds: string[];
};

type BarSeriesEvent = {
  seriesType?: string;
  dataIndex?: number;
};

function formatFeeBinLabel(bin: FeeBin): string {
  if (bin.lo === bin.hi) {
    return currencyFormatter.format(bin.lo);
  }

  return `${currencyFormatter.format(bin.lo)} - ${currencyFormatter.format(bin.hi)}`;
}

function buildFeeBins(points: MapPoint[], binCount = FEE_BIN_COUNT): FeeBin[] {
  const sorted = points
    .map((point) => ({ fee: point.feeTotal, id: point.id }))
    .sort((leftEntry, rightEntry) => leftEntry.fee - rightEntry.fee);
  const pointCount = sorted.length;
  if (pointCount === 0) {
    return [];
  }

  // Tie-aware equal-frequency binning: aim for equal-count quantile boundaries, but snap
  // each boundary forward to the next value change so records with the same fee (e.g. the
  // large $0 cluster) always land in a single bin. This keeps bin ranges strictly increasing
  // and non-overlapping instead of collapsing touching bins into each other.
  const boundaryIndices = [0];
  for (let binIndex = 1; binIndex < binCount; binIndex += 1) {
    let candidateIndex = Math.round((binIndex * pointCount) / binCount);
    while (
      candidateIndex < pointCount &&
      candidateIndex > 0 &&
      sorted[candidateIndex].fee === sorted[candidateIndex - 1].fee
    ) {
      candidateIndex += 1;
    }

    if (
      candidateIndex < pointCount &&
      candidateIndex > boundaryIndices[boundaryIndices.length - 1]
    ) {
      boundaryIndices.push(candidateIndex);
    }
  }
  boundaryIndices.push(pointCount);

  const bins: FeeBin[] = [];
  for (let boundary = 0; boundary < boundaryIndices.length - 1; boundary += 1) {
    const slice = sorted.slice(boundaryIndices[boundary], boundaryIndices[boundary + 1]);
    if (slice.length === 0) {
      continue;
    }

    bins.push({
      lo: slice[0].fee,
      hi: slice[slice.length - 1].fee,
      count: slice.length,
      pointIds: slice.map((entry) => entry.id),
    });
  }

  return bins;
}

function getFeeBinPointIds(params: BarSeriesEvent, feeBins: FeeBin[]): string[] | null {
  if (params.seriesType !== 'bar') {
    return null;
  }

  const binIndex = params.dataIndex;
  if (typeof binIndex !== 'number' || binIndex < 0 || binIndex >= feeBins.length) {
    return null;
  }

  return feeBins[binIndex]?.pointIds ?? null;
}

export function FeeDistributionChart() {
  const visiblePoints = useFilterStore((state) => state.visiblePoints);
  const selectedIds = useMapSelectionStore((state) => state.selectedIds);
  const replaceSelection = useMapSelectionStore((state) => state.replaceSelection);
  const setHoveredIds = useMapSelectionStore((state) => state.setHoveredIds);
  const selectedCount = selectedIds.size;
  const feeBins = useMemo(() => buildFeeBins(visiblePoints), [visiblePoints]);
  const totalCount = useMemo(
    () => feeBins.reduce((runningTotal, bin) => runningTotal + bin.count, 0),
    [feeBins],
  );
  const selectedBarFillColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED);
  const partialSelectionBorderColor = rgbaFromTuple(POINT_FILL_COLOR_SELECTED, 0.62);

  const barSeriesData = useMemo(() => {
    return feeBins.map((bin) => {
      const intersectionCount = bin.pointIds.reduce(
        (count, pointId) => (selectedIds.has(pointId) ? count + 1 : count),
        0,
      );
      const isFullySelected =
        selectedIds.size === bin.pointIds.length &&
        bin.pointIds.length > 0 &&
        bin.pointIds.every((pointId) => selectedIds.has(pointId));
      const isPartiallySelected =
        !isFullySelected && intersectionCount > 0 && intersectionCount < bin.pointIds.length;
      const itemStyle: {
        color?: string;
        borderColor?: string;
        borderWidth?: number;
      } = {};

      if (isFullySelected) {
        itemStyle.color = selectedBarFillColor;
      } else if (isPartiallySelected) {
        itemStyle.borderColor = partialSelectionBorderColor;
        itemStyle.borderWidth = 2;
      }

      return {
        value: bin.count,
        itemStyle,
      };
    });
  }, [feeBins, partialSelectionBorderColor, selectedBarFillColor, selectedIds]);

  const hasFeeData = barSeriesData.length > 0;
  const chartOption = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const tooltipParams = Array.isArray(params) ? params[0] : params;
          const binIndex = tooltipParams?.dataIndex;
          if (typeof binIndex !== 'number') {
            return '';
          }

          const bin = feeBins[binIndex];
          if (!bin) {
            return '';
          }

          const share = totalCount > 0 ? (bin.count / totalCount) * 100 : 0;
          return `${formatFeeBinLabel(bin)}<br/>${bin.count} records (${share.toFixed(1)}% of filtered)`;
        },
      },
      grid: {
        left: 48,
        right: 16,
        top: 20,
        bottom: 54,
      },
      xAxis: {
        type: 'category',
        data: feeBins.map((bin) => formatFeeBinLabel(bin)),
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          interval: 0,
          rotate: 28,
          hideOverlap: false,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          name: 'Records',
          type: 'bar',
          data: barSeriesData,
          barMaxWidth: 48,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
          },
        },
        {
          name: 'Distribution',
          type: 'line',
          data: feeBins.map((bin) => bin.count),
          smooth: true,
          symbolSize: 8,
          z: 3,
          lineStyle: {
            width: 2,
          },
        },
      ],
    }),
    [barSeriesData, feeBins, totalCount],
  );

  const chartEvents = useMemo(
    () => ({
      mouseover: (params: BarSeriesEvent) => {
        if (selectedCount > 0) {
          return;
        }

        const binPointIds = getFeeBinPointIds(params, feeBins);
        if (!binPointIds || binPointIds.length === 0) {
          return;
        }
        setHoveredIds(binPointIds);
      },
      mouseout: () => {
        setHoveredIds([]);
      },
      globalout: () => {
        setHoveredIds([]);
      },
      click: (params: BarSeriesEvent) => {
        const binPointIds = getFeeBinPointIds(params, feeBins);
        if (!binPointIds || binPointIds.length === 0) {
          return;
        }
        replaceSelection(binPointIds);
      },
    }),
    [feeBins, replaceSelection, selectedCount, setHoveredIds],
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
      aria-label="Fee Distribution chart"
      className="rounded-[var(--radius-round-four)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] p-4"
    >
      <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">Fee Distribution</h3>
      {hasFeeData ? (
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
          No records are available for the current filters.
        </p>
      )}
    </section>
  );
}
