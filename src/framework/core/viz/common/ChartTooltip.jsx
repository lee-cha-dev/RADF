/**
 * @module core/viz/common/ChartTooltip
 * @description Tooltip renderer for Recharts charts.
 */
import React from 'react';
import { getChartColorClass } from './chartColors';

/**
 * @typedef {Object} ChartTooltipEntry
 * @property {string} [dataKey] - Series key.
 * @property {string} [name] - Series label.
 * @property {string|number} [value] - Value at the hovered point.
 */

/**
 * @typedef {Object} ChartTooltipProps
 * @property {boolean} [active] - Whether tooltip is active.
 * @property {string|number} [label] - Tooltip label (x-axis value).
 * @property {ChartTooltipEntry[]} [payload] - Recharts tooltip entries.
 */

/**
 * Render a tooltip list for Recharts charts.
 * @param {ChartTooltipProps} props - Tooltip props.
 * @returns {JSX.Element|null} Tooltip content.
 */
function ChartTooltip({ active, label, payload }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="radf-chart-tooltip">
      {label ? <p className="radf-chart-tooltip__label">{label}</p> : null}
      <ul className="radf-chart-tooltip__list">
        {payload.map((item, index) => (
          <li key={item.dataKey || item.name || index} className="radf-chart-tooltip__item">
            <span
              className={[
                'radf-chart-tooltip__swatch',
                getChartColorClass(index),
              ].join(' ')}
            />
            <span className="radf-chart-tooltip__name">{item.name}</span>
            <span className="radf-chart-tooltip__value">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChartTooltip;
