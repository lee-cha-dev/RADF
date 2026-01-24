/**
 * @module core/viz/charts/KpiPanel
 * @description KPI panel visualization for single metric values.
 */
import React, { useMemo } from 'react';

/**
 * Resolve the numeric field key used to render the KPI.
 * @param {Object} encodings - Encoding map for the visualization.
 * @param {Array<Object>} data - Chart data rows.
 * @returns {string|null} Value key.
 */
const resolveValueKey = (encodings, data) => {
  if (encodings?.value) {
    return encodings.value;
  }
  if (encodings?.y) {
    return encodings.y;
  }
  if (data?.length) {
    return Object.keys(data[0]).find((key) => typeof data[0][key] === 'number');
  }
  return null;
};

/**
 * Format a raw KPI value.
 * @param {*} value - Raw value.
 * @param {string} format - Format identifier (currency, percent, integer).
 * @param {Object} [options] - Formatting options (currency, etc).
 * @returns {string} Formatted value.
 */
const formatValue = (value, format, options = {}) => {
  if (value == null || Number.isNaN(value)) {
    return '--';
  }
  if (typeof value !== 'number') {
    return String(value);
  }
  if (format === 'currency') {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: options.currency || 'USD',
      maximumFractionDigits: 0,
    });
  }
  if (format === 'percent') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (format === 'integer') {
    return Math.round(value).toLocaleString();
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

/**
 * @typedef {Object} KpiPanelProps
 * @property {Array<Object>} [data] - KPI data rows.
 * @property {Object} [encodings] - Encoding map (value/label).
 * @property {Object} [options] - Formatting and display options.
 */

/**
 * Render a KPI panel displaying a single aggregated value.
 * @param {KpiPanelProps} props - KPI props.
 * @returns {JSX.Element} KPI visualization.
 */
function KpiPanel({ data = [], encodings = {}, options = {} }) {
  const valueKey = useMemo(() => resolveValueKey(encodings, data), [encodings, data]);
  const rawValue = valueKey ? data?.[0]?.[valueKey] : null;
  const formattedValue = formatValue(rawValue, options.format, options);
  const label = options.label || encodings?.label;

  return (
    <div className="radf-kpi">
      {label ? <div className="radf-kpi__label">{label}</div> : null}
      <div className="radf-kpi__value">{formattedValue}</div>
      {options.caption ? (
        <div className="radf-kpi__caption">{options.caption}</div>
      ) : null}
    </div>
  );
}

export default KpiPanel;
