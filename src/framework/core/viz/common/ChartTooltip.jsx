import React from 'react';
import { getChartColorClass } from './chartColors';

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
