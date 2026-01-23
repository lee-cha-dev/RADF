import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
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

function LineChartPanel({ data = [], encodings = {}, options = {}, handlers = {} }) {
  const seriesKeys = resolveSeriesKeys(encodings, data);
  const showLegend = options.legend !== false && seriesKeys.length > 1;
  const showTooltip = options.tooltip !== false;

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
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
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getChartColor(index)}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5, onClick: handlers.onClick }}
              onClick={handlers.onClick}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default LineChartPanel;
