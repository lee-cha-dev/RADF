/**
 * @module core/viz/charts/TreemapChartPanel
 * @description Treemap visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';
import { getSeriesColor } from '../palettes/seriesColors';

/**
 * Normalize treemap data to a hierarchy if a flat dataset is provided.
 * @param {Array<Object>|Object} data - Chart data.
 * @param {string} nameKey - Key for node names.
 * @param {string} valueKey - Key for node values.
 * @returns {{ data: Array<Object>, nameKey: string, valueKey: string }}
 */
const normalizeTreemapData = (data, nameKey, valueKey) => {
  if (!data) {
    return { data: [], nameKey, valueKey };
  }
  if (Array.isArray(data)) {
    const hasChildren = data.some((item) => Array.isArray(item?.children));
    if (hasChildren) {
      return { data, nameKey, valueKey };
    }
    const children = data
      .map((row) => ({
        name: row?.[nameKey],
        value: row?.[valueKey],
      }))
      .filter((row) => row.name != null && row.value != null);
    return {
      data: children.length ? [{ name: 'root', children }] : [],
      nameKey: 'name',
      valueKey: 'value',
    };
  }
  if (Array.isArray(data.children)) {
    return { data: [data], nameKey, valueKey };
  }
  return { data: [], nameKey, valueKey };
};

/**
 * @typedef {Object} TreemapChartPanelProps
 * @property {Array<Object>|Object} [data] - Chart data rows or hierarchy.
 * @property {Object} [encodings] - Encoding map (category/value).
 * @property {Object} [options] - Chart options (tooltip, labels, colorBy).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 */

/**
 * Render a treemap panel with palette-aware colors.
 * @param {TreemapChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function TreemapChartPanel({
  data,
  encodings = {},
  options = {},
  handlers = {},
  colorAssignment,
}) {
  const nameKey = encodings.category || encodings.x || 'name';
  const valueKey = encodings.value || encodings.y || 'value';
  const showTooltip = options.tooltip !== false;
  const showLabels = options.labels === true;
  const colorByDepth = options.colorBy === 'depth';
  const normalized = useMemo(
    () => normalizeTreemapData(data, nameKey, valueKey),
    [data, nameKey, valueKey]
  );

  const renderNode = (nodeProps) => {
    const {
      x,
      y,
      width,
      height,
      depth,
      index,
      name,
      children,
    } = nodeProps;
    if (width < 4 || height < 4) {
      return null;
    }
    const isLeaf = !children || children.length === 0;
    const fill = colorByDepth
      ? getSeriesColor(depth)
      : colorAssignment?.getColor?.(name) || getSeriesColor(index);
    const shouldShowLabel = showLabels && isLeaf && width > 40 && height > 18;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke="var(--radf-border-divider)"
          strokeWidth={1}
        />
        {shouldShowLabel ? (
          <text
            x={x + 6}
            y={y + 16}
            fill="var(--radf-text-primary)"
            fontSize={12}
          >
            {name}
          </text>
        ) : null}
      </g>
    );
  };

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <Treemap
          data={normalized.data}
          dataKey={normalized.valueKey}
          nameKey={normalized.nameKey}
          stroke="var(--radf-border-divider)"
          content={renderNode}
          onClick={handlers.onClick}
        >
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
        </Treemap>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default TreemapChartPanel;
