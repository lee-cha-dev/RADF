import { registerViz } from './registry';
import LineChartPanel from '../viz/charts/LineChartPanel.jsx';
import BarChartPanel from '../viz/charts/BarChartPanel.jsx';
import KpiPanel from '../viz/charts/KpiPanel.jsx';

const registerCharts = () => {
  registerViz('line', LineChartPanel);
  registerViz('bar', BarChartPanel);
  registerViz('kpi', KpiPanel);
};

export default registerCharts;
