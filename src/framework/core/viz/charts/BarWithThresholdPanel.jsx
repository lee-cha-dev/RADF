/**
 * @module core/viz/charts/BarWithThresholdPanel
 * @description Horizontal/vertical bar chart with threshold markers, department coloring,
 * and responsive sizing for large datasets.
 */
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';

/**
 * @typedef {Object} ThresholdMarkerConfig
 * @property {boolean} enabled - Whether to show threshold markers.
 * @property {string} valueKey - Data key for threshold value.
 * @property {string} [color] - Marker color (CSS variable or hex).
 * @property {string} [label] - Tooltip label for marker.
 * @property {number} [strokeWidth] - Line width.
 * @property {string} [strokeDasharray] - Dash pattern.
 */

/**
 * @typedef {Object} LeftAnnotationConfig
 * @property {boolean} enabled - Whether to show left annotations.
 * @property {('dot'|'badge')} type - Annotation style.
 * @property {string} colorBy - Data key to color by.
 */

/**
 * @typedef {Object} BarWithThresholdPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (x/y/color).
 * @property {Object} [options] - Chart options.
 * @property {Object} [handlers] - Interaction handlers.
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

const ROW_HEIGHT = 36;
const MIN_CHART_HEIGHT = 200;
const MAX_CHART_HEIGHT = 800;
const LABEL_WIDTH_ESTIMATE = 120;

/**
 * Build a color map for categorical coloring.
 * @param {Array<Object>} data - Data rows.
 * @param {string} colorKey - Key to color by.
 * @param {Object|null} colorAssignment - Palette assignment.
 * @returns {Map<string, string>} Category-to-color map.
 */
const buildCategoryColorMap = (data, colorKey, colorAssignment) => {
  if (!colorKey || !data?.length) {
    return new Map();
  }
  const categories = [...new Set(data.map((row) => row[colorKey]).filter(Boolean))];
  const colorMap = new Map();

  if (colorAssignment?.getColor) {
    categories.forEach((cat) => {
      colorMap.set(cat, colorAssignment.getColor(cat));
    });
  } else {
    categories.forEach((cat, index) => {
      colorMap.set(cat, `var(--radf-series-${(index % 12) + 1})`);
    });
  }
  return colorMap;
};

/**
 * Custom Y-axis tick with optional department dot.
 */
function CustomYAxisTick({ x, y, payload, data, options, colorMap }) {
  const annotations = options?.leftAnnotations;
  const row = data?.find((d) => d[options?.yKey] === payload.value);
  const colorKey = annotations?.colorBy;
  const showDot = annotations?.enabled && annotations?.type === 'dot' && colorKey;
  const dotColor =
    showDot && row?.[colorKey] ? colorMap?.get(row[colorKey]) || 'var(--radf-series-1)' : null;

  return (
    <g transform={`translate(${x},${y})`}>
      {showDot && (
        <circle cx={-12} cy={0} r={5} fill={dotColor} className="radf-bar-threshold__dot" />
      )}
      <text
        x={showDot ? -24 : -8}
        y={0}
        dy={4}
        textAnchor="end"
        fill="var(--radf-text-muted)"
        fontSize={12}
        className="radf-bar-threshold__tick-label"
      >
        {payload.value}
      </text>
    </g>
  );
}

/**
 * Render a bar chart with threshold markers and category coloring.
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
  const isHorizontal = options.orientation === 'horizontal';
  const showTooltip = options.tooltip !== false;
  const thresholdConfig = options.thresholdMarkers;
  const colorKey = encodings.color || options.colorBy;

  const xKey = isHorizontal ? encodings.x : encodings.y;
  const yKey = isHorizontal ? encodings.y : encodings.x;

  const colorMap = useMemo(
    () => buildCategoryColorMap(data, colorKey, colorAssignment),
    [data, colorKey, colorAssignment]
  );

  const legendItems = useMemo(() => {
    if (!colorKey || !data?.length) {
      return [];
    }
    const categories = [...new Set(data.map((row) => row[colorKey]).filter(Boolean))];
    return categories.map((cat) => ({
      key: cat,
      label: cat,
      color: colorMap.get(cat) || 'var(--radf-series-1)',
    }));
  }, [data, colorKey, colorMap]);

  const filteredData = useMemo(() => {
    if (!hiddenKeys?.size || !colorKey) {
      return data;
    }
    return data.filter((row) => !hiddenKeys.has(row[colorKey]));
  }, [data, hiddenKeys, colorKey]);

  const chartHeight = useMemo(() => {
    const rowCount = filteredData.length || 1;
    const calculated = rowCount * ROW_HEIGHT + 60;
    return Math.max(MIN_CHART_HEIGHT, Math.min(MAX_CHART_HEIGHT, calculated));
  }, [filteredData.length]);

  const thresholdLines = useMemo(() => {
    if (!thresholdConfig?.enabled || !thresholdConfig?.valueKey) {
      return [];
    }
    const thresholdMap = new Map();
    filteredData.forEach((row) => {
      const dept = row[colorKey];
      const threshold = row[thresholdConfig.valueKey];
      if (dept && threshold != null && !thresholdMap.has(dept)) {
        thresholdMap.set(dept, threshold);
      }
    });
    return Array.from(thresholdMap.entries()).map(([dept, value]) => ({
      dept,
      value,
      color: thresholdConfig.color || 'var(--radf-accent-warning)',
    }));
  }, [filteredData, colorKey, thresholdConfig]);

  const xAxisDomain = useMemo(() => {
    if (!filteredData.length) return [0, 100];
    let max = 0;
    filteredData.forEach((row) => {
      const val = row[xKey] || 0;
      const threshold = thresholdConfig?.enabled ? row[thresholdConfig.valueKey] || 0 : 0;
      max = Math.max(max, val, threshold);
    });
    return [0, Math.ceil(max * 1.1)];
  }, [filteredData, xKey, thresholdConfig]);

  const yAxisWidth = useMemo(() => {
    if (!filteredData.length) return LABEL_WIDTH_ESTIMATE;
    const maxLabelLength = Math.max(...filteredData.map((row) => String(row[yKey] || '').length));
    const annotationOffset = options.leftAnnotations?.enabled ? 30 : 0;
    return Math.min(200, Math.max(80, maxLabelLength * 7 + annotationOffset));
  }, [filteredData, yKey, options.leftAnnotations]);

  return (
    <ChartContainer>
      <div className="radf-bar-threshold">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={filteredData}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={{
              top: 8,
              right: 24,
              left: isHorizontal ? 8 : 0,
              bottom: 8,
            }}
          >
            <CartesianGrid
              stroke="var(--radf-chart-grid)"
              strokeDasharray="3 3"
              horizontal={!isHorizontal}
              vertical={isHorizontal}
            />

            {isHorizontal ? (
              <>
                <XAxis
                  type="number"
                  domain={xAxisDomain}
                  tick={{ fill: 'var(--radf-text-muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--radf-border-divider)' }}
                  tickLine={{ stroke: 'var(--radf-border-divider)' }}
                  tickFormatter={(val) => val.toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey={yKey}
                  width={yAxisWidth}
                  tick={(props) => (
                    <CustomYAxisTick
                      {...props}
                      data={filteredData}
                      options={{ ...options, yKey }}
                      colorMap={colorMap}
                    />
                  )}
                  axisLine={{ stroke: 'var(--radf-border-divider)' }}
                  tickLine={false}
                  interval={0}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xKey}
                  tick={{ fill: 'var(--radf-text-muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--radf-border-divider)' }}
                  tickLine={{ stroke: 'var(--radf-border-divider)' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  type="number"
                  domain={xAxisDomain}
                  tick={{ fill: 'var(--radf-text-muted)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--radf-border-divider)' }}
                  tickLine={{ stroke: 'var(--radf-border-divider)' }}
                  tickFormatter={(val) => val.toLocaleString()}
                />
              </>
            )}

            {showTooltip && (
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'var(--radf-accent-primary-soft)', opacity: 0.3 }}
              />
            )}

            {thresholdLines.map(({ dept, value, color }) => (
              <ReferenceLine
                key={`threshold-${dept}`}
                x={isHorizontal ? value : undefined}
                y={!isHorizontal ? value : undefined}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="6 4"
                isFront
                label={{
                  value: '',
                  position: 'top',
                }}
              />
            ))}

            <Bar
              dataKey={xKey}
              radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              onClick={handlers.onClick}
              maxBarSize={28}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {filteredData.map((row, index) => {
                const category = row[colorKey];
                const barColor = category
                  ? colorMap.get(category) || 'var(--radf-accent-primary)'
                  : 'var(--radf-accent-primary)';

                const exceedsThreshold =
                  thresholdConfig?.enabled &&
                  row[thresholdConfig.valueKey] != null &&
                  row[xKey] > row[thresholdConfig.valueKey];

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={barColor}
                    fillOpacity={exceedsThreshold ? 1 : 0.85}
                    stroke={exceedsThreshold ? 'var(--radf-accent-danger)' : 'none'}
                    strokeWidth={exceedsThreshold ? 2 : 0}
                    className="radf-bar-threshold__cell"
                  />
                );
              })}
              {options.showPercentColumn && options.percentKey && (
                <LabelList
                  dataKey={options.percentKey}
                  position={isHorizontal ? 'right' : 'top'}
                  formatter={(val) => (typeof val === 'number' ? `${val.toFixed(1)}%` : val)}
                  fill="var(--radf-text-muted)"
                  fontSize={10}
                  offset={8}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {legendItems.length > 0 && (
          <div className="radf-bar-threshold__legend">
            <ul className="radf-bar-threshold__legend-list">
              {legendItems.map((item) => {
                const isHidden = hiddenKeys?.has(item.key);
                return (
                  <li
                    key={item.key}
                    className={[
                      'radf-bar-threshold__legend-item',
                      isHidden ? 'radf-bar-threshold__legend-item--hidden' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className="radf-bar-threshold__legend-button"
                      onClick={() => handlers.onLegendToggle?.(item.key)}
                    >
                      <span
                        className="radf-bar-threshold__legend-swatch"
                        style={{ background: item.color }}
                      />
                      <span className="radf-bar-threshold__legend-label">{item.label}</span>
                    </button>
                  </li>
                );
              })}
              {thresholdConfig?.enabled && (
                <li className="radf-bar-threshold__legend-item radf-bar-threshold__legend-item--threshold">
                  <span
                    className="radf-bar-threshold__legend-line"
                    style={{
                      background: thresholdConfig.color || 'var(--radf-accent-warning)',
                    }}
                  />
                  <span className="radf-bar-threshold__legend-label">
                    {thresholdConfig.label || 'Threshold'}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </ChartContainer>
  );
}

export default BarWithThresholdPanel;
