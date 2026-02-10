/**
 * @module core/viz/charts/AreaChartPanel
 * @description Area chart visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
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
 * @typedef {Object} AreaChartPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (x/y, series keys).
 * @property {Object} [options] - Chart options (tooltip, brush).
 * @property {Object} [handlers] - Interaction handlers (onClick, onBrushChange).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

/**
 * Render an area chart panel with palette-aware series colors.
 * @param {AreaChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function AreaChartPanel({
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
  const brushConfig = options.brush || {};
  const brushEnabled = Boolean(brushConfig.enabled) && data.length > 1;
  const seriesColors = useMemo(
    () => getSeriesColorsForKeys(seriesKeys),
    [seriesKeys]
  );
  const brushStartIndex =
    typeof brushConfig.startIndex === 'number' ? brushConfig.startIndex : undefined;
  const brushEndIndex =
    typeof brushConfig.endIndex === 'number' ? brushConfig.endIndex : undefined;

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
          {visibleSeriesKeys.map((key, index) => {
            const color =
              colorAssignment?.getColor?.(key) ||
              seriesColors[key] ||
              getSeriesColor(index);
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                dot={{ r: 3 }}
                activeDot={{ r: 5, onClick: handlers.onClick }}
                onClick={handlers.onClick}
              />
            );
          })}
          {brushEnabled ? (
            <Brush
              className="radf-chart__brush"
              dataKey={encodings.x}
              height={24}
              travellerWidth={12}
              stroke="var(--radf-accent-primary)"
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
              onChange={(range) => {
                if (handlers.onBrushChange) {
                  handlers.onBrushChange({
                    ...range,
                    data,
                    dataKey: encodings.x,
                  });
                }
              }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default AreaChartPanel;
