import { getSeriesVar } from '../palettes/paletteRegistry';

const seriesCount = 12;
const chartColorVars = Array.from({ length: seriesCount }, (_, index) =>
  getSeriesVar(index, seriesCount)
);

const hashSeriesKey = (key) => {
  if (key == null) {
    return 0;
  }
  const value = String(key);
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getChartColor = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return chartColorVars[safeIndex % chartColorVars.length];
};

export const getChartColorClass = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return `radf-chart-color-${safeIndex % chartColorVars.length}`;
};

export const getChartColorByKey = (key) => {
  const hashedIndex = hashSeriesKey(key) % chartColorVars.length;
  return chartColorVars[hashedIndex];
};

export const getChartColorClassByKey = (key) => {
  const hashedIndex = hashSeriesKey(key) % chartColorVars.length;
  return `radf-chart-color-${hashedIndex}`;
};

export const chartColors = chartColorVars;
