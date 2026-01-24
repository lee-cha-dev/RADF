/**
 * @module core/registry/registry
 * @description Registry utilities for visualization and insight modules.
 * Consumers can register new implementations to extend RADF without
 * modifying core renderer logic.
 * @example
 * // 1) Create a chart component that follows the viz contract.
 * const CustomChart = ({ data, encodings, options, handlers, colorAssignment }) => {
 *   return (
 *     <div>
 *       Custom chart with {data.length} rows.
 *     </div>
 *   );
 * };
 *
 * // 2) Register the chart once at app startup.
 * import { registerViz } from './core/registry/registry.js';
 *
 * registerViz('custom-chart', CustomChart);
 *
 * // 3) Use vizType: 'custom-chart' in a dashboard panel config.
 */

/**
 * @typedef {Object} Registry
 * @property {string} label - Human-readable registry label for error messages.
 * @property {(key: string, component: any) => any} register - Register a component.
 * @property {(key: string) => any} get - Get a component by key.
 * @property {(key: string) => boolean} has - Check if a key is registered.
 * @property {() => string[]} list - List registered keys.
 */

/**
 * Create a simple in-memory registry.
 * @param {string} [label='registry'] - Label used in error messages.
 * @returns {Registry} Registry instance with CRUD helpers.
 */
const createRegistry = (label = 'registry') => {
  const entries = new Map();

  /**
   * Register a component under a key.
   * @param {string} key - Unique key to register.
   * @param {*} component - Component or analyzer to store.
   * @returns {*} The registered component.
   */
  const register = (key, component) => {
    if (!key) {
      throw new Error(`${label} key is required.`);
    }
    if (!component) {
      throw new Error(`${label} component is required.`);
    }
    entries.set(key, component);
    return component;
  };

  return {
    label,
    register,
    get: (key) => entries.get(key),
    has: (key) => entries.has(key),
    list: () => Array.from(entries.keys()),
  };
};

/**
 * Registry for visualization components keyed by vizType.
 * @type {Registry}
 */
export const vizRegistry = createRegistry('vizRegistry');
/**
 * Registry for insight analyzers keyed by analyzer id.
 * @type {Registry}
 */
export const insightRegistry = createRegistry('insightRegistry');

/**
 * Register a visualization component.
 * @param {string} vizType - Visualization type key.
 * @param {*} component - React component that renders the viz.
 * @returns {*} The registered component.
 */
export const registerViz = (vizType, component) => vizRegistry.register(vizType, component);
/**
 * Register an insight analyzer.
 * @param {string} insightType - Analyzer id.
 * @param {*} analyzer - Analyzer definition object.
 * @returns {*} The registered analyzer.
 */
export const registerInsight = (insightType, analyzer) =>
  insightRegistry.register(insightType, analyzer);

export { createRegistry };
