import React, { useMemo } from 'react';

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
