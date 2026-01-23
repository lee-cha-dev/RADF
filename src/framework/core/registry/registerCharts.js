import { registerViz } from './registry';
import LineChartPanel from '../viz/charts/LineChartPanel.jsx';
import BarChartPanel from '../viz/charts/BarChartPanel.jsx';

const registerCharts = () => {
  registerViz('line', LineChartPanel);
  registerViz('bar', BarChartPanel);
};

export default registerCharts;
