/**
 * @module core/viz/charts/FunnelChartPanel
 * @description Funnel chart visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import {
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';
import { getSeriesColor } from '../palettes/seriesColors';

/**
 * Normalize funnel data to name/value pairs.
 * @param {Array<Object>} data - Chart data rows.
 * @param {string} nameKey - Key for stage names.
 * @param {string} valueKey - Key for stage values.
 * @returns {Array<{name: string, value: number, raw: Object}>}
 */
const normalizeFunnelData = (data, nameKey, valueKey) => {
  if (!Array.isArray(data)) {
    return [];
  }
  return data
    .map((row) => ({
      name: row?.[nameKey],
      value: row?.[valueKey],
      raw: row,
    }))
    .filter((row) => row.name != null && row.value != null);
};

/**
 * @typedef {Object} FunnelChartPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (category/value).
 * @property {Object} [options] - Chart options (tooltip, labelMode, sort).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 */

/**
 * Render a funnel chart panel with palette-aware colors.
 * @param {FunnelChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function FunnelChartPanel({
  data = [],
  encodings = {},
  options = {},
  handlers = {},
  colorAssignment,
}) {
  const nameKey = encodings.category || encodings.x || 'name';
  const valueKey = encodings.value || encodings.y || 'value';
  const showTooltip = options.tooltip !== false;
  const labelMode = options.labelMode || 'name';
  const sortMode = options.sort || 'input';
  const normalized = useMemo(() => {
    const rows = normalizeFunnelData(data, nameKey, valueKey);
    if (sortMode === 'asc' || sortMode === 'desc') {
      const dir = sortMode === 'asc' ? 1 : -1;
      return [...rows].sort((a, b) => {
        const aVal = Number(a.value) || 0;
        const bVal = Number(b.value) || 0;
        return dir * (aVal - bVal);
      });
    }
    return rows;
  }, [data, nameKey, valueKey, sortMode]);
  const total = useMemo(
    () =>
      normalized.reduce((acc, row) => acc + (Number(row.value) || 0), 0),
    [normalized]
  );

  const renderLabel = (props) => {
    const { x, y, width, height, value, name } = props;
    if (labelMode === 'none') {
      return null;
    }
    if (width < 20 || height < 12) {
      return null;
    }
    let label = '';
    if (labelMode === 'value') {
      label = String(value ?? '');
    } else if (labelMode === 'percent') {
      const percent = total ? (Number(value) || 0) / total : 0;
      label = `${Math.round(percent * 100)}%`;
    } else {
      label = String(name ?? '');
    }
    if (!label) {
      return null;
    }
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--radf-text-primary)"
        fontSize={12}
      >
        {label}
      </text>
    );
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <FunnelChart>
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
          <Funnel
            data={normalized}
            dataKey="value"
            nameKey="name"
            onClick={handlers.onClick}
          >
            {labelMode !== 'none' ? (
              <LabelList content={renderLabel} />
            ) : null}
            {normalized.map((entry, index) => {
              const color =
                colorAssignment?.getColor?.(entry.name) || getSeriesColor(index);
              return <Cell key={`funnel-${index}`} fill={color} />;
            })}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default FunnelChartPanel;
