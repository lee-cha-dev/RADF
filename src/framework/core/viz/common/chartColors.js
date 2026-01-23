const chartColorVars = [
  'var(--radf-chart-series-1)',
  'var(--radf-chart-series-2)',
  'var(--radf-chart-series-3)',
  'var(--radf-chart-series-4)',
  'var(--radf-chart-series-5)',
  'var(--radf-chart-series-6)',
  'var(--radf-chart-series-7)',
  'var(--radf-chart-series-8)',
];

export const getChartColor = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return chartColorVars[safeIndex % chartColorVars.length];
};

export const getChartColorClass = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return `radf-chart-color-${safeIndex % chartColorVars.length}`;
};

export const chartColors = chartColorVars;
