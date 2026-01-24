/**
 * @module core/viz/common/chartColors
 * @description Helpers for chart color class names and CSS variables.
 */
import { getSeriesColor } from '../palettes/seriesColors';

const seriesCount = 12;
const chartColorVars = Array.from({ length: seriesCount }, (_, index) =>
  getSeriesColor(index, seriesCount)
);

/**
 * Resolve a CSS color variable for a given series index.
 * @param {number} index - Series index.
 * @returns {string} CSS variable reference.
 */
export const getChartColor = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return chartColorVars[safeIndex % chartColorVars.length];
};

/**
 * Resolve a CSS class name for a given series index.
 * @param {number} index - Series index.
 * @returns {string} Class name.
 */
export const getChartColorClass = (index) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return `radf-chart-color-${safeIndex % chartColorVars.length}`;
};

/**
 * Ordered list of chart color CSS variables.
 * @type {string[]}
 */
export const chartColors = chartColorVars;
