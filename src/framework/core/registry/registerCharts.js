/**
 * @module core/registry/registerCharts
 * @description Registers the built-in chart components with the visualization registry.
 * Call once at application startup.
 * @example
 * import registerCharts from './core/registry/registerCharts.js';
 *
 * registerCharts();
 */
import { registerViz } from './registry';
import LineChartPanel from '../viz/charts/LineChartPanel.jsx';
import BarChartPanel from '../viz/charts/BarChartPanel.jsx';
import BarWithConditionalColoringPanel from '../viz/charts/BarWithConditionalColoringPanel.jsx';
import BarWithThresholdPanel from '../viz/charts/BarWithThresholdPanel.jsx';
import KpiPanel from '../viz/charts/KpiPanel.jsx';

/**
 * Register the default chart panels.
 * @returns {void}
 */
const registerCharts = () => {
  registerViz('line', LineChartPanel);
  registerViz('bar', BarChartPanel);
  registerViz('barWithConditionalColoring', BarWithConditionalColoringPanel);
  registerViz('barWithThreshold', BarWithThresholdPanel);
  registerViz('kpi', KpiPanel);
};

export default registerCharts;
