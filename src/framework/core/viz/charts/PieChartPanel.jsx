/**
 * @module core/viz/charts/PieChartPanel
 * @description Pie/Donut chart visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';
import { getSeriesColor, getSeriesColorsForKeys } from '../palettes/seriesColors';

/**
 * Resolve category keys from data rows.
 * @param {Array<Object>} data - Chart data rows.
 * @param {string} categoryKey - Key for the category field.
 * @returns {string[]} Unique category keys.
 */
const resolveCategoryKeys = (data, categoryKey) => {
  if (!Array.isArray(data) || !categoryKey) {
    return [];
  }
  const seen = new Set();
  const ordered = [];
  data.forEach((row) => {
    const value = row?.[categoryKey];
    if (value == null) {
      return;
    }
    const key = String(value);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    ordered.push(key);
  });
  return ordered;
};

/**
 * @typedef {Object} PieChartPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (category/value).
 * @property {Object} [options] - Chart options (tooltip, donut, labels).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

/**
 * Render a pie chart panel with palette-aware slice colors.
 * @param {PieChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function PieChartPanel({
  data = [],
  encodings = {},
  options = {},
  handlers = {},
  colorAssignment,
  hiddenKeys,
}) {
  const categoryKey = encodings.category;
  const valueKey = encodings.value;
  const showTooltip = options.tooltip !== false;
  const showLabels = options.labels === true;
  const isDonut = options.donut === true;
  const categoryKeys = useMemo(
    () => resolveCategoryKeys(data, categoryKey),
    [data, categoryKey]
  );
  const seriesColors = useMemo(
    () => getSeriesColorsForKeys(categoryKeys),
    [categoryKeys]
  );
  const filteredData = hiddenKeys?.size
    ? data.filter(
        (row) => !hiddenKeys.has(String(row?.[categoryKey]))
      )
    : data;

  const renderLabel = ({ cx, cy, midAngle, outerRadius, name }) => {
    if (!showLabels) {
      return null;
    }
    const radius = outerRadius + 14;
    const angle = (-midAngle * Math.PI) / 180;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const label = name != null ? String(name) : '';
    if (!label) {
      return null;
    }
    return (
      <text
        x={x}
        y={y}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fill="var(--radf-text-muted)"
        fontSize={12}
      >
        {label}
      </text>
    );
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
          <Pie
            data={filteredData}
            dataKey={valueKey}
            nameKey={categoryKey}
            innerRadius={isDonut ? '55%' : 0}
            outerRadius="80%"
            paddingAngle={1}
            label={showLabels ? renderLabel : false}
            labelLine={false}
            onClick={handlers.onClick}
          >
            {filteredData.map((entry, index) => {
              const categoryValue = entry?.[categoryKey];
              const color =
                colorAssignment?.getColor?.(categoryValue) ||
                seriesColors[String(categoryValue)] ||
                getSeriesColor(index);
              return <Cell key={`slice-${index}`} fill={color} />;
            })}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default PieChartPanel;
