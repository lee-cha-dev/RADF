import { useMemo } from 'react';
import { InsightEngine } from './InsightEngine';
import { insightRegistry } from '../registry/registry';

const resolveAnalyzers = (analyzers) => {
  if (Array.isArray(analyzers) && analyzers.length) {
    return analyzers;
  }
  return insightRegistry.list().map((key) => insightRegistry.get(key)).filter(Boolean);
};

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
