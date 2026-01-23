import { getSeriesColor } from '../palettes/seriesColors';

const seriesCount = 12;
const chartColorVars = Array.from({ length: seriesCount }, (_, index) =>
  getSeriesColor(index, seriesCount)
);

export const getChartColor = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return chartColorVars[safeIndex % chartColorVars.length];
};

export const getChartColorClass = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return `radf-chart-color-${safeIndex % chartColorVars.length}`;
};

export const chartColors = chartColorVars;
