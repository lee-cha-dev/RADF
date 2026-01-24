/**
 * @module core/viz/common/ChartLegend
 * @description Legend renderer for Recharts native Legend payloads.
 */
import React from 'react';
import { getChartColorClass } from './chartColors';

/**
 * @typedef {Object} ChartLegendEntry
 * @property {string} [value] - Label displayed in the legend.
 * @property {string} [dataKey] - Data key for the series.
 */

/**
 * @typedef {Object} ChartLegendProps
 * @property {ChartLegendEntry[]} [payload] - Recharts legend payload entries.
 */

/**
 * Render a simple legend list for Recharts charts.
 * @param {ChartLegendProps} props - Legend props.
 * @returns {JSX.Element|null} Legend list.
 */
function ChartLegend({ payload }) {
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <ul className="radf-chart-legend">
      {payload.map((entry, index) => (
        <li key={entry.value || entry.dataKey || index} className="radf-chart-legend__item">
          <span
            className={[
              'radf-chart-legend__swatch',
              getChartColorClass(index),
            ].join(' ')}
          />
          <span className="radf-chart-legend__label">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default ChartLegend;
