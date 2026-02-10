/**
 * @module core/viz/charts/RadarChartPanel
 * @description Radar chart visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
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
 * @typedef {Object} RadarChartPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (x/y, series keys).
 * @property {Object} [options] - Chart options (tooltip, fillOpacity).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

/**
 * Render a radar chart panel with palette-aware series colors.
 * @param {RadarChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function RadarChartPanel({
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
  const showTooltip = options.tooltip !== false;
  const fillOpacity =
    typeof options.fillOpacity === 'number' ? options.fillOpacity : 0.2;
  const seriesColors = useMemo(
    () => getSeriesColorsForKeys(seriesKeys),
    [seriesKeys]
  );

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--radf-chart-grid)" />
          <PolarAngleAxis
            dataKey={encodings.x}
            tick={{ fill: 'var(--radf-text-muted)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            tick={{ fill: 'var(--radf-text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--radf-border-divider)' }}
          />
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
          {visibleSeriesKeys.map((key, index) => {
            const color =
              colorAssignment?.getColor?.(key) ||
              seriesColors[key] ||
              getSeriesColor(index);
            return (
              <Radar
                key={key}
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={fillOpacity}
                onClick={handlers.onClick}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default RadarChartPanel;
