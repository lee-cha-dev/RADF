import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartContainer from '../common/ChartContainer.jsx';
import ChartTooltip from '../common/ChartTooltip.jsx';
import ChartLegend from '../common/ChartLegend.jsx';
import { getChartColor } from '../common/chartColors';

const resolveSeriesKeys = (encodings, data) => {
  if (!encodings) {
    return [];
  }
  if (Array.isArray(encodings.y)) {
    return encodings.y;
  }
  if (encodings.y) {
    return [encodings.y];
  }
  if (data?.length) {
    return Object.keys(data[0]).filter((key) => key !== encodings.x);
  }
  return [];
};

function BarChartPanel({ data = [], encodings = {}, options = {}, handlers = {} }) {
  const seriesKeys = resolveSeriesKeys(encodings, data);
  const showLegend = options.legend !== false && seriesKeys.length > 1;
  const showTooltip = options.tooltip !== false;
  const isStacked = options.stacked === true;

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="var(--radf-color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey={encodings.x}
            tick={{ fill: 'var(--radf-color-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--radf-color-border)' }}
          />
          <YAxis
            tick={{ fill: 'var(--radf-color-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--radf-color-border)' }}
          />
          {showTooltip ? <Tooltip content={<ChartTooltip />} /> : null}
          {showLegend ? <Legend content={<ChartLegend />} /> : null}
          {seriesKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={getChartColor(index)}
              stackId={isStacked ? 'radf-stack' : undefined}
              radius={[6, 6, 0, 0]}
              onClick={handlers.onClick}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default BarChartPanel;
