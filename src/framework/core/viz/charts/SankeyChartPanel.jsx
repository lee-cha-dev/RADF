/**
 * @module core/viz/charts/SankeyChartPanel
 * @description Sankey chart visualization panel using Recharts.
 */
import React, { useMemo } from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';
import { getSeriesColor } from '../palettes/seriesColors';

/**
 * Resolve the sankey data payload from input.
 * @param {Object|Array<Object>} data - Chart data.
 * @returns {{ nodes: Array<Object>, links: Array<Object> }|null}
 */
const resolveSankeyData = (data) => {
  if (data?.nodes && data?.links) {
    return data;
  }
  if (Array.isArray(data) && data[0]?.nodes && data[0]?.links) {
    return data[0];
  }
  return null;
};

/**
 * @typedef {Object} SankeyChartPanelProps
 * @property {Object|Array<Object>} [data] - Sankey data ({nodes, links}).
 * @property {Object} [options] - Chart options (tooltip, colorBy).
 * @property {Object} [handlers] - Interaction handlers (onClick).
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 */

/**
 * Render a sankey chart panel with palette-aware colors.
 * @param {SankeyChartPanelProps} props - Chart props.
 * @returns {JSX.Element} Chart panel.
 */
function SankeyChartPanel({
  data,
  options = {},
  handlers = {},
  colorAssignment,
}) {
  const showTooltip = options.tooltip !== false;
  const colorBy = options.colorBy || 'node';
  const sankeyData = useMemo(() => resolveSankeyData(data), [data]);

  const resolveNodeColor = (node, index) =>
    colorAssignment?.getColor?.(node?.name) || getSeriesColor(index);

  const renderNode = (nodeProps) => {
    const { x, y, width, height, index, payload } = nodeProps;
    const name = payload?.name ?? payload?.id ?? '';
    const fill = resolveNodeColor(payload, index);
    const showLabel = width > 40 && height > 14;
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
          rx={4}
          ry={4}
        />
        {showLabel ? (
          <text
            x={x + width + 6}
            y={y + height / 2}
            fill="var(--radf-text-muted)"
            fontSize={12}
            dominantBaseline="middle"
          >
            {name}
          </text>
        ) : null}
      </g>
    );
  };

  const renderLink = (linkProps) => {
    const {
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourceControlX,
      targetControlX,
      linkWidth,
      payload,
    } = linkProps;
    const sourceNode = payload?.source;
    const targetNode = payload?.target;
    let stroke = 'var(--radf-border-divider)';
    if (colorBy === 'source' || colorBy === 'node') {
      stroke = resolveNodeColor(sourceNode, sourceNode?.index || 0);
    } else if (colorBy === 'target') {
      stroke = resolveNodeColor(targetNode, targetNode?.index || 0);
    }
    const path = `M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
    return (
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeOpacity={0.35}
        strokeWidth={Math.max(1, linkWidth)}
      />
    );
  };

  if (!sankeyData?.nodes?.length || !sankeyData?.links?.length) {
    return (
      <div className="radf-viz__missing">
        <p className="radf-viz__missing-title">Sankey data required</p>
        <p className="radf-viz__missing-text">
          Provide nodes and links arrays to render a sankey diagram.
        </p>
      </div>
    );
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <Sankey
          data={sankeyData}
          nodePadding={12}
          nodeWidth={16}
          linkCurvature={0.5}
          node={renderNode}
          link={renderLink}
          onClick={handlers.onClick}
        >
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
        </Sankey>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default SankeyChartPanel;
