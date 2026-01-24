/**
 * @module core/registry/registerInsights
 * @description Registers the built-in insight analyzers with the registry.
 * Call once at application startup.
 * @example
 * import registerInsights from './core/registry/registerInsights.js';
 *
 * registerInsights();
 */
import { registerInsight } from './registry';
import trendAnalyzer from '../insights/analyzers/trend.js';
import anomalyAnalyzer from '../insights/analyzers/anomaly.js';
import topDriversAnalyzer from '../insights/analyzers/topDrivers.js';

/**
 * Register the default insight analyzers.
 * @returns {void}
 */
const registerInsights = () => {
  registerInsight(trendAnalyzer.id, trendAnalyzer);
  registerInsight(anomalyAnalyzer.id, anomalyAnalyzer);
  registerInsight(topDriversAnalyzer.id, topDriversAnalyzer);
};

export default registerInsights;
