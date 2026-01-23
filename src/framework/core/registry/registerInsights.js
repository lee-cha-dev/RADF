import { registerInsight } from './registry';
import trendAnalyzer from '../insights/analyzers/trend.js';
import anomalyAnalyzer from '../insights/analyzers/anomaly.js';
import topDriversAnalyzer from '../insights/analyzers/topDrivers.js';

const registerInsights = () => {
  registerInsight(trendAnalyzer.id, trendAnalyzer);
  registerInsight(anomalyAnalyzer.id, anomalyAnalyzer);
  registerInsight(topDriversAnalyzer.id, topDriversAnalyzer);
};

export default registerInsights;
