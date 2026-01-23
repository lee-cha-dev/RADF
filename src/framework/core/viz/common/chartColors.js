const chartColorVars = [
  'var(--radf-chart-color-1)',
  'var(--radf-chart-color-2)',
  'var(--radf-chart-color-3)',
  'var(--radf-chart-color-4)',
  'var(--radf-chart-color-5)',
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
