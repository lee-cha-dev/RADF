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
import AreaChartPanel from '../viz/charts/AreaChartPanel.jsx';
import BarChartPanel from '../viz/charts/BarChartPanel.jsx';
import BarWithConditionalColoringPanel from '../viz/charts/BarWithConditionalColoringPanel.jsx';
import BulletChart from '../viz/charts/BulletChart.jsx';
import KpiPanel from '../viz/charts/KpiPanel.jsx';
import PieChartPanel from '../viz/charts/PieChartPanel.jsx';
import ScatterChartPanel from '../viz/charts/ScatterChartPanel.jsx';
import ComposedChartPanel from '../viz/charts/ComposedChartPanel.jsx';
import RadarChartPanel from '../viz/charts/RadarChartPanel.jsx';
import TreemapChartPanel from '../viz/charts/TreemapChartPanel.jsx';
import FunnelChartPanel from '../viz/charts/FunnelChartPanel.jsx';
import SankeyChartPanel from '../viz/charts/SankeyChartPanel.jsx';
import RadialBarChartPanel from '../viz/charts/RadialBarChartPanel.jsx';

/**
 * Register the default chart panels.
 * @returns {void}
 */
const registerCharts = () => {
  registerViz('line', LineChartPanel);
  registerViz('area', AreaChartPanel);
  registerViz('bar', BarChartPanel);
  registerViz('barWithConditionalColoring', BarWithConditionalColoringPanel);
  registerViz('bulletChart', BulletChart);
  registerViz('kpi', KpiPanel);
  registerViz('pie', PieChartPanel);
  registerViz('scatter', ScatterChartPanel);
  registerViz('composed', ComposedChartPanel);
  registerViz('radar', RadarChartPanel);
  registerViz('treemap', TreemapChartPanel);
  registerViz('funnel', FunnelChartPanel);
  registerViz('sankey', SankeyChartPanel);
  registerViz('radialBar', RadialBarChartPanel);
};

export default registerCharts;
