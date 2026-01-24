/**
 * @module core/insights/useInsights
 * @description React hook to compute insights from data and registered analyzers.
 */

import { useMemo } from 'react';
import { InsightEngine } from './InsightEngine';
import { insightRegistry } from '../registry/registry';

/**
 * @typedef {import('../docs/jsdocTypes.js').QuerySpec} QuerySpec
 * @typedef {import('../docs/jsdocTypes.js').DashboardState} DashboardState
 * @typedef {import('../docs/jsdocTypes.js').Insight} Insight
 */

/**
 * @typedef {Object} UseInsightsOptions
 * @property {Object[]} [rows] - Raw data rows.
 * @property {Record<string, unknown>|null} [meta] - Provider metadata.
 * @property {QuerySpec|null} [querySpec] - QuerySpec for the data rows.
 * @property {DashboardState|null} [dashboardState] - Active dashboard state.
 * @property {Object[]} [analyzers] - Custom analyzers to run instead of registry defaults.
 * @property {boolean} [enabled] - Disable insight computation when false.
 */

/**
 * Resolve analyzers from the provided list or the registry.
 * @param {Object[]|undefined} analyzers - Optional analyzers array.
 * @returns {Object[]} Analyzer list to run.
 */
const resolveAnalyzers = (analyzers) => {
  if (Array.isArray(analyzers) && analyzers.length) {
    return analyzers;
  }
  return insightRegistry.list().map((key) => insightRegistry.get(key)).filter(Boolean);
};

/**
 * Compute insights from data + registered analyzers.
 * @param {UseInsightsOptions} [options] - Hook options.
 * @returns {{ insights: Insight[], hasInsights: boolean }} Insight list and status flag.
 */
export const useInsights = ({
  rows = [],
  meta = null,
  querySpec = null,
  dashboardState = null,
  analyzers,
  enabled = true,
} = {}) => {
  const resolvedAnalyzers = useMemo(() => resolveAnalyzers(analyzers), [analyzers]);
  const insights = useMemo(() => {
    if (!enabled) {
      return [];
    }
    return InsightEngine.analyze({
      rows,
      meta,
      querySpec,
      dashboardState,
      analyzers: resolvedAnalyzers,
    });
  }, [rows, meta, querySpec, dashboardState, resolvedAnalyzers, enabled]);

  return {
    insights,
    hasInsights: insights.length > 0,
  };
};
