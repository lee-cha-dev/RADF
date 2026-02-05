/**
 * @module core/viz/charts/BarWithThresholdPanel
 * @description Bar chart visualization panel with a reference line.
 */
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';
import { getSeriesColor } from '../palettes/seriesColors';

/**
 * @typedef {Object} BarWithThresholdPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (x/y).
 * @property {Object} [options] - Chart options (tooltip, referenceLine).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

const resolveReferenceValue = (data, referenceLine) => {
  if (!referenceLine?.valueKey || !Array.isArray(data) || !data.length) {
    return null;
  }
  const valueKey = referenceLine.valueKey;
  const rowWithValue = data.find((row) => Number.isFinite(Number(row?.[valueKey])));
  if (!rowWithValue) {
    return null;
  }
  const value = Number(rowWithValue[valueKey]);
  return Number.isFinite(value) ? value : null;
};

/**
 * Render a bar chart panel with a vertical reference line.
 * @param {BarWithThresholdPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function BarWithThresholdPanel({
  data = [],
  encodings = {},
  options = {},
  handlers = {},
  colorAssignment,
  hiddenKeys,
}) {
  void colorAssignment;
  void hiddenKeys;
  const showTooltip = options.tooltip !== false;
  const referenceLine = options.referenceLine;
  const referenceValue = useMemo(
    () => resolveReferenceValue(data, referenceLine),
    [data, referenceLine]
  );
  const xTickFormatter =
    typeof options.xTickFormatter === 'function' ? options.xTickFormatter : undefined;
  const referenceStyle = referenceLine?.style === 'dashed' ? '4 4' : undefined;

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid stroke="var(--radf-chart-grid)" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey={encodings.x}
            tick={{ fill: 'var(--radf-text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--radf-border-divider)' }}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            type="category"
            dataKey={encodings.y}
            tick={{ fill: 'var(--radf-text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--radf-border-divider)' }}
          />
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
          {Number.isFinite(referenceValue) ? (
            <ReferenceLine
              x={referenceValue}
              stroke="var(--radf-border-strong)"
              strokeDasharray={referenceStyle}
              label={
                referenceLine?.label
                  ? {
                      value: referenceLine.label,
                      position: 'top',
                      fill: 'var(--radf-text-muted)',
                      fontSize: 12,
                    }
                  : undefined
              }
            />
          ) : null}
          <Bar
            dataKey={encodings.x}
            fill={getSeriesColor(0)}
            radius={[0, 6, 6, 0]}
            onClick={handlers.onClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default BarWithThresholdPanel;
