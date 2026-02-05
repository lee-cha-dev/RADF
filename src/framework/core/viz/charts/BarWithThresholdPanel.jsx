/**
 * @module core/viz/charts/BarWithThresholdPanel
 * @description Bullet chart table with per-row threshold markers, department coloring,
 * and a three-column layout (names | bars | percent).
 */
import React, { useMemo } from 'react';
import ChartContainer from '../common/ChartContainer.jsx';

/**
 * @typedef {Object} BarWithThresholdPanelProps
 * @property {Array<Object>} [data] - Chart data rows.
 * @property {Object} [encodings] - Encoding map (x/y/color).
 * @property {Object} [options] - Chart options.
 * @property {Object} [handlers] - Interaction handlers.
 * @property {Object|null} [colorAssignment] - Palette assignment helper.
 * @property {Set<string>} [hiddenKeys] - Keys hidden via legend toggles.
 */

/**
 * Build a color map for categorical coloring.
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
 * Single bullet row component.
 */
function BulletRow({
  row,
  xKey,
  yKey,
  colorKey,
  colorMap,
  maxValue,
  thresholdConfig,
  percentKey,
  showPercent,
  onClick,
}) {
  const value = row[xKey] || 0;
  const label = row[yKey] || '';
  const category = row[colorKey];
  const barColor = category
    ? colorMap.get(category) || 'var(--radf-accent-primary)'
    : 'var(--radf-accent-primary)';
  const dotColor = barColor;

  const threshold = thresholdConfig?.enabled ? row[thresholdConfig.valueKey] : null;
  const percent = showPercent && percentKey ? row[percentKey] : null;

  const barWidthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const thresholdPercent = threshold != null && maxValue > 0 ? (threshold / maxValue) * 100 : null;

  const exceedsThreshold = threshold != null && value > threshold;

  return (
    <div className="radf-bullet__row" onClick={() => onClick?.(row)} role="button" tabIndex={0}>
      {/* Name column */}
      <div className="radf-bullet__name-cell">
        <span className="radf-bullet__dot" style={{ background: dotColor }} />
        <span className="radf-bullet__name">{label}</span>
      </div>

      {/* Bar column */}
      <div className="radf-bullet__bar-cell">
        <div className="radf-bullet__track">
          {/* Background track */}
          <div className="radf-bullet__track-bg" />

          {/* Value bar */}
          <div
            className={['radf-bullet__bar', exceedsThreshold ? 'radf-bullet__bar--exceeded' : '']
              .filter(Boolean)
              .join(' ')}
            style={{
              width: `${barWidthPercent}%`,
              background: barColor,
            }}
          >
            {/* Value label ON the bar */}
            <span className="radf-bullet__value-label">
              {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}h
            </span>
          </div>

          {/* Threshold marker */}
          {thresholdPercent != null && (
            <div
              className="radf-bullet__threshold"
              style={{
                left: `${thresholdPercent}%`,
                background: thresholdConfig.color || 'var(--radf-accent-warning)',
              }}
            />
          )}
        </div>
      </div>

      {/* Percent column */}
      {showPercent && (
        <div className="radf-bullet__pct-cell">
          {percent != null ? `${percent.toFixed(1)}%` : '—'}
        </div>
      )}
    </div>
  );
}

/**
 * Render a bullet chart table with per-row threshold markers.
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
  const thresholdConfig = options.thresholdMarkers;
  const colorKey = encodings.color || options.colorBy;
  const showPercent = options.showPercentColumn !== false;
  const percentKey = options.percentKey;

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
      label: cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      color: colorMap.get(cat) || 'var(--radf-series-1)',
    }));
  }, [data, colorKey, colorMap]);

  const filteredData = useMemo(() => {
    if (!hiddenKeys?.size || !colorKey) {
      return data;
    }
    return data.filter((row) => !hiddenKeys.has(row[colorKey]));
  }, [data, hiddenKeys, colorKey]);

  const maxValue = useMemo(() => {
    if (!filteredData.length) return 100;
    let max = 0;
    filteredData.forEach((row) => {
      const val = row[xKey] || 0;
      const threshold = thresholdConfig?.enabled ? row[thresholdConfig.valueKey] || 0 : 0;
      max = Math.max(max, val, threshold);
    });
    return max * 1.1;
  }, [filteredData, xKey, thresholdConfig]);

  // X-axis tick values
  const xTicks = useMemo(() => {
    const step = Math.ceil(maxValue / 4 / 50) * 50;
    const ticks = [];
    for (let i = 0; i <= maxValue; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [maxValue]);

  return (
    <ChartContainer>
      <div className="radf-bullet">
        {/* Header row */}
        <div className="radf-bullet__header">
          <div className="radf-bullet__name-cell" />
          <div className="radf-bullet__bar-cell">
            <span className="radf-bullet__axis-label">OT Hours</span>
          </div>
          {showPercent && (
            <div className="radf-bullet__pct-cell radf-bullet__pct-header">% of Total</div>
          )}
        </div>

        {/* Data rows */}
        <div className="radf-bullet__body">
          {filteredData.map((row, index) => (
            <BulletRow
              key={row[yKey] || index}
              row={row}
              xKey={xKey}
              yKey={yKey}
              colorKey={colorKey}
              colorMap={colorMap}
              maxValue={maxValue}
              thresholdConfig={thresholdConfig}
              percentKey={percentKey}
              showPercent={showPercent}
              onClick={handlers.onClick}
            />
          ))}
        </div>

        {/* X-axis */}
        <div className="radf-bullet__axis">
          <div className="radf-bullet__name-cell" />
          <div className="radf-bullet__bar-cell">
            <div className="radf-bullet__axis-ticks">
              {xTicks.map((tick) => (
                <span
                  key={tick}
                  className="radf-bullet__tick"
                  style={{ left: `${(tick / maxValue) * 100}%` }}
                >
                  {tick.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
          {showPercent && <div className="radf-bullet__pct-cell" />}
        </div>

        {/* Legend */}
        {(legendItems.length > 0 || thresholdConfig?.enabled) && (
          <div className="radf-bullet__legend">
            <ul className="radf-bullet__legend-list">
              {legendItems.map((item) => {
                const isHidden = hiddenKeys?.has(item.key);
                return (
                  <li
                    key={item.key}
                    className={[
                      'radf-bullet__legend-item',
                      isHidden ? 'radf-bullet__legend-item--hidden' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className="radf-bullet__legend-button"
                      onClick={() => handlers.onLegendToggle?.(item.key)}
                    >
                      <span
                        className="radf-bullet__legend-swatch"
                        style={{ background: item.color }}
                      />
                      <span className="radf-bullet__legend-label">{item.label}</span>
                    </button>
                  </li>
                );
              })}
              {thresholdConfig?.enabled && (
                <li className="radf-bullet__legend-item radf-bullet__legend-item--threshold">
                  <span
                    className="radf-bullet__legend-line"
                    style={{
                      background: thresholdConfig.color || 'var(--radf-accent-warning)',
                    }}
                  />
                  <span className="radf-bullet__legend-label">
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
