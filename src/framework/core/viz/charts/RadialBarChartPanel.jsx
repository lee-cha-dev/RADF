/**
 * @module core/viz/charts/RadialBarChartPanel
 * @description Radial bar chart visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';
import { getSeriesColor, getSeriesColorsForKeys } from '../palettes/seriesColors';

/**
 * Resolve series keys from encodings or data.
 * @param {Object} encodings - Encoding map for the visualization.
 * @param {Array<Object>} data - Chart data rows.
 * @returns {string[]} Series keys.
 */
const resolveSeriesKeys = (encodings, data) => {
  if (!encodings) {
    return [];
  }
  if (Array.isArray(encodings.y)) {
    return encodings.y;
  }
  if (encodings.y) {
    return [encodings.y];
  }
  if (data?.length) {
    return Object.keys(data[0]).filter((key) => key !== encodings.x);
  }
  return [];
};

/**
 * Normalize radius values for RadialBarChart.
 * @param {string|number|undefined} value - Input radius.
 * @param {string} fallback - Fallback radius.
 * @returns {string|number} Radius for Recharts.
 */
const normalizeRadius = (value, fallback) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  return fallback;
};

/**
 * @typedef {Object} RadialBarChartPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (category/value).
 * @property {Object} [options] - Chart options (tooltip, innerRadius, outerRadius, labels).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

/**
 * Render a radial bar chart panel with palette-aware colors.
 * @param {RadialBarChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function RadialBarChartPanel({
  data = [],
  encodings = {},
  options = {},
  handlers = {},
  colorAssignment,
  hiddenKeys,
}) {
  const assignedKeys =
    colorAssignment?.mode === 'series' || colorAssignment?.mode === 'single'
      ? colorAssignment.items.map((item) => item.key)
      : [];
  const seriesKeys = assignedKeys.length ? assignedKeys : resolveSeriesKeys(encodings, data);
  const visibleSeriesKeys = seriesKeys.filter(
    (key) => !hiddenKeys?.has(String(key))
  );
  const categoryKey = encodings.category || encodings.x;
  const showTooltip = options.tooltip !== false;
  const showLabels = options.labels === true;
  const innerRadius = normalizeRadius(options.innerRadius, '20%');
  const outerRadius = normalizeRadius(options.outerRadius, '80%');
  const seriesColors = useMemo(
    () => getSeriesColorsForKeys(seriesKeys),
    [seriesKeys]
  );
  const isCategoryMode = colorAssignment?.mode === 'category';
  const chartData =
    isCategoryMode && hiddenKeys?.size && categoryKey
      ? data.filter((row) => !hiddenKeys.has(String(row?.[categoryKey])))
      : data;

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <RadialBarChart
          data={chartData}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          barSize={10}
        >
          <PolarGrid stroke="var(--radf-chart-grid)" />
          <PolarAngleAxis
            dataKey={categoryKey}
            tick={{ fill: 'var(--radf-text-muted)', fontSize: 12 }}
          />
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
          {visibleSeriesKeys.length > 1
            ? visibleSeriesKeys.map((key, index) => (
                <RadialBar
                  key={key}
                  dataKey={key}
                  fill={
                    colorAssignment?.getColor?.(key) ||
                    seriesColors[key] ||
                    getSeriesColor(index)
                  }
                  onClick={handlers.onClick}
                  label={
                    showLabels
                      ? { fill: 'var(--radf-text-primary)', position: 'insideStart' }
                      : false
                  }
                />
              ))
            : (
              <RadialBar
                dataKey={visibleSeriesKeys[0] || encodings.value || encodings.y}
                fill={
                  colorAssignment?.getColor?.(visibleSeriesKeys[0]) ||
                  getSeriesColor(0)
                }
                onClick={handlers.onClick}
                label={
                  showLabels
                    ? { fill: 'var(--radf-text-primary)', position: 'insideStart' }
                    : false
                }
              >
                {isCategoryMode && categoryKey
                  ? chartData.map((entry, index) => {
                      const categoryValue = entry?.[categoryKey];
                      const color =
                        colorAssignment?.getColor?.(categoryValue) ||
                        getSeriesColor(index);
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })
                  : null}
              </RadialBar>
            )}
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default RadialBarChartPanel;
