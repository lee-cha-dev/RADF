/**
 * @module core/viz/charts/ComposedChartPanel
 * @description Composed bar + line chart visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
 * Normalize key lists into unique strings.
 * @param {Array<*>} keys - Raw keys list.
 * @returns {string[]} Normalized keys.
 */
const normalizeKeys = (keys) => {
  if (!Array.isArray(keys)) {
    return [];
  }
  const seen = new Set();
  const ordered = [];
  keys.forEach((key) => {
    if (key == null) {
      return;
    }
    const normalized = String(key);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    ordered.push(normalized);
  });
  return ordered;
};

/**
 * @typedef {Object} ComposedChartPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (x/y, series keys).
 * @property {Object} [options] - Chart options (tooltip, barKeys, lineKeys).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

/**
 * Render a composed bar + line chart panel with palette-aware colors.
 * @param {ComposedChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function ComposedChartPanel({
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
  const declaredBarKeys = normalizeKeys(options.barKeys);
  const declaredLineKeys = normalizeKeys(options.lineKeys);
  const fallbackBarKeys =
    declaredBarKeys.length || declaredLineKeys.length ? [] : seriesKeys;
  const barKeys = declaredBarKeys.length ? declaredBarKeys : fallbackBarKeys;
  const lineKeys = declaredLineKeys.length
    ? declaredLineKeys
    : seriesKeys.filter((key) => !barKeys.includes(key));
  const visibleBarKeys = barKeys.filter((key) => !hiddenKeys?.has(String(key)));
  const visibleLineKeys = lineKeys.filter((key) => !hiddenKeys?.has(String(key)));
  const showTooltip = options.tooltip !== false;
  const seriesColors = useMemo(
    () => getSeriesColorsForKeys(seriesKeys),
    [seriesKeys]
  );

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--radf-chart-grid)" strokeDasharray="3 3" />
          <XAxis
            dataKey={encodings.x}
            tick={{ fill: 'var(--radf-text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--radf-border-divider)' }}
          />
          <YAxis
            tick={{ fill: 'var(--radf-text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--radf-border-divider)' }}
          />
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
          {visibleBarKeys.map((key, index) => (
            <Bar
              key={`bar-${key}`}
              dataKey={key}
              fill={
                colorAssignment?.getColor?.(key) ||
                seriesColors[key] ||
                getSeriesColor(index)
              }
              radius={[6, 6, 0, 0]}
              onClick={handlers.onClick}
            />
          ))}
          {visibleLineKeys.map((key, index) => (
            <Line
              key={`line-${key}`}
              type="monotone"
              dataKey={key}
              stroke={
                colorAssignment?.getColor?.(key) ||
                seriesColors[key] ||
                getSeriesColor(index + visibleBarKeys.length)
              }
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5, onClick: handlers.onClick }}
              onClick={handlers.onClick}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default ComposedChartPanel;
