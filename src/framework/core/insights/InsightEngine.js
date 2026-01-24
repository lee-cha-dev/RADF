/**
 * @module core/insights/InsightEngine
 * @description Normalizes analyzer output into render-ready insights.
 */

/**
 * @typedef {import('../docs/jsdocTypes.js').QuerySpec} QuerySpec
 * @typedef {import('../docs/jsdocTypes.js').DashboardState} DashboardState
 * @typedef {import('../docs/jsdocTypes.js').Insight} Insight
 */

/**
 * @typedef {Object} Analyzer
 * @property {string} id - Stable analyzer identifier.
 * @property {string} label - Human-friendly analyzer label.
 * @property {(context: AnalyzerContext) => Insight[]|Insight|Promise<Insight[]|Insight>} analyze
 *   - Returns zero or more insights based on the input context.
 */

/**
 * @typedef {Object} AnalyzerContext
 * @property {Object[]} rows - Raw query rows.
 * @property {Record<string, unknown>|null} [meta] - Optional provider metadata.
 * @property {QuerySpec|null} [querySpec] - QuerySpec that produced the rows.
 * @property {DashboardState|null} [dashboardState] - Active dashboard state.
 */

const ensureArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const normalizeInsight = ({ insight, fallbackId, analyzerId, analyzerLabel }) => {
  if (!insight || typeof insight !== 'object') {
    return null;
  }
  const title = insight.title || analyzerLabel || 'Insight';
  return {
    id: insight.id || fallbackId,
    title,
    severity: insight.severity || 'info',
    narrative: insight.narrative || '',
    recommendedAction: insight.recommendedAction || null,
    evidence: ensureArray(insight.evidence),
    source: insight.source || analyzerId,
  };
};

/**
 * Insight engine utilities for running analyzers and normalizing results.
 * @type {{ analyze: (params: InsightEngineParams) => Insight[] }}
 * @example
 * import { registerInsight } from '../registry/registry.js';
 * import { InsightEngine } from './InsightEngine.js';
 *
 * const momentumAnalyzer = {
 *   id: 'momentum',
 *   label: 'Momentum',
 *   analyze: ({ rows }) => ({
 *     title: 'Momentum check',
 *     severity: 'info',
 *     narrative: `Reviewed ${rows.length} rows for momentum shifts.`,
 *   }),
 * };
 *
 * registerInsight(momentumAnalyzer.id, momentumAnalyzer);
 *
 * const insights = InsightEngine.analyze({
 *   rows: dataRows,
 *   analyzers: [momentumAnalyzer],
 * });
 */
export const InsightEngine = {
  /**
   * Run analyzers and normalize the resulting insights for rendering.
   * @param {InsightEngineParams} params - Input data and analyzer list.
   * @returns {Insight[]} Normalized insights.
   */
  analyze({ rows = [], meta = null, querySpec = null, dashboardState = null, analyzers = [] }) {
    const payload = { rows, meta, querySpec, dashboardState };
    return analyzers.flatMap((analyzer, analyzerIndex) => {
      if (!analyzer || typeof analyzer.analyze !== 'function') {
        return [];
      }
      const result = analyzer.analyze(payload);
      const list = ensureArray(result);
      return list
        .map((insight, insightIndex) =>
          normalizeInsight({
            insight,
            analyzerId: analyzer.id,
            analyzerLabel: analyzer.label,
            fallbackId: `${analyzer.id || 'insight'}-${analyzerIndex}-${insightIndex}`,
          })
        )
        .filter(Boolean);
    });
  },
};

/**
 * @typedef {Object} InsightEngineParams
 * @property {Object[]} [rows] - Raw result rows.
 * @property {Record<string, unknown>|null} [meta] - Provider metadata.
 * @property {QuerySpec|null} [querySpec] - QuerySpec used to fetch the rows.
 * @property {DashboardState|null} [dashboardState] - Active dashboard state.
 * @property {Analyzer[]} [analyzers] - Analyzer instances to run.
 */
