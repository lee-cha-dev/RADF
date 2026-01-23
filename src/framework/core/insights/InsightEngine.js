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

export const InsightEngine = {
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
