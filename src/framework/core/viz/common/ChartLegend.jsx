import React from 'react';
import { getChartColorClass, getChartColorClassByKey } from './chartColors';

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
              entry.dataKey != null
                ? getChartColorClassByKey(entry.dataKey)
                : getChartColorClass(index),
            ].join(' ')}
          />
          <span className="radf-chart-legend__label">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default ChartLegend;
