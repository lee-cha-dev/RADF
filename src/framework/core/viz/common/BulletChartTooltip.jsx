/**
 * @module core/viz/common/BulletChartTooltip
 * @description Custom tooltip for BarWithThresholdPanel bullet charts.
 * Displays a comprehensive overview of the hovered row.
 */
import React from 'react';

/**
 * @typedef {Object} BulletChartTooltipProps
 * @property {Object} row - The data row being hovered.
 * @property {string} nameKey - Key for the name/label field.
 * @property {string} valueKey - Key for the primary value field.
 * @property {string} [colorKey] - Key for the category/department field.
 * @property {string} [percentKey] - Key for the percentage field.
 * @property {Object} [thresholdConfig] - Threshold configuration.
 * @property {string} barColor - The color of the bar.
 * @property {boolean} exceedsThreshold - Whether the value exceeds threshold.
 * @property {Object} [position] - Position coordinates { x, y }.
 * @property {boolean} [visible] - Whether tooltip is visible.
 */

/**
 * Format a numeric value for display.
 * @param {number} value - The value to format.
 * @param {string} [suffix] - Optional suffix (e.g., 'h' for hours).
 * @returns {string} Formatted value.
 */
const formatValue = (value, suffix = '') => {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${suffix}`;
};

/**
 * Render a tooltip for bullet chart rows showing comprehensive row data.
 * @param {BulletChartTooltipProps} props - Tooltip props.
 * @returns {JSX.Element|null} Tooltip content.
 */
function BulletChartTooltip({
  row,
  nameKey,
  valueKey,
  colorKey,
  percentKey,
  thresholdConfig,
  barColor,
  exceedsThreshold,
  position,
  visible,
}) {
  if (!visible || !row) {
    return null;
  }

  const name = row[nameKey] || 'Unknown';
  const value = row[valueKey] || 0;
  const category = colorKey ? row[colorKey] : null;
  const percent = percentKey ? row[percentKey] : null;
  const threshold = thresholdConfig?.enabled ? row[thresholdConfig.valueKey] : null;

  const categoryLabel = category
    ? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const style = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : {};

  return (
    <div className="radf-bullet-tooltip" style={style}>
      {/* Header with name and status */}
      <div className="radf-bullet-tooltip__header">
        <span
          className="radf-bullet-tooltip__dot"
          style={{ background: barColor }}
        />
        <span className="radf-bullet-tooltip__name">{name}</span>
        {exceedsThreshold && (
          <span className="radf-bullet-tooltip__exceeded-badge">
            Exceeds Threshold
          </span>
        )}
      </div>

      {/* Category/Department */}
      {categoryLabel && (
        <div className="radf-bullet-tooltip__row">
          <span className="radf-bullet-tooltip__label">Department</span>
          <span className="radf-bullet-tooltip__value">{categoryLabel}</span>
        </div>
      )}

      {/* Primary Value */}
      <div className="radf-bullet-tooltip__row radf-bullet-tooltip__row--primary">
        <span className="radf-bullet-tooltip__label">OT Hours</span>
        <span className="radf-bullet-tooltip__value radf-bullet-tooltip__value--primary">
          {formatValue(value, 'h')}
        </span>
      </div>

      {/* Threshold */}
      {threshold != null && (
        <div className="radf-bullet-tooltip__row">
          <span className="radf-bullet-tooltip__label">
            {thresholdConfig.label || 'Threshold'}
          </span>
          <span className="radf-bullet-tooltip__value">
            {formatValue(threshold, 'h')}
          </span>
        </div>
      )}

      {/* Variance from Threshold */}
      {threshold != null && (
        <div className="radf-bullet-tooltip__row">
          <span className="radf-bullet-tooltip__label">Variance</span>
          <span
            className={[
              'radf-bullet-tooltip__value',
              exceedsThreshold
                ? 'radf-bullet-tooltip__value--negative'
                : 'radf-bullet-tooltip__value--positive',
            ].join(' ')}
          >
            {exceedsThreshold ? '+' : ''}
            {formatValue(value - threshold, 'h')}
          </span>
        </div>
      )}

      {/* Percentage of Total */}
      {percent != null && (
        <div className="radf-bullet-tooltip__row">
          <span className="radf-bullet-tooltip__label">% of Total</span>
          <span className="radf-bullet-tooltip__value">
            {percent.toFixed(1)}%
          </span>
        </div>
      )}

      {/* Exceeded Threshold Warning */}
      {exceedsThreshold && (
        <div className="radf-bullet-tooltip__warning">
          <span className="radf-bullet-tooltip__warning-icon">⚠</span>
          <span className="radf-bullet-tooltip__warning-text">
            This value exceeds the department threshold by{' '}
            {formatValue(value - threshold, 'h')}
          </span>
        </div>
      )}
    </div>
  );
}

export default BulletChartTooltip;
