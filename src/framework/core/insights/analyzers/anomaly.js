/**
 * @module core/insights/analyzers/anomaly
 * @description Analyzer that flags recent anomalies in a time series.
 */

import { findMeasureId } from './analysisUtils.js';

/**
 * @typedef {import('../../docs/jsdocTypes.js').Insight} Insight
 * @typedef {import('../../docs/jsdocTypes.js').QuerySpec} QuerySpec
 */

/**
 * @typedef {Object} AnalyzerContext
 * @property {Object[]} rows - Raw query rows.
 * @property {QuerySpec|null} [querySpec] - QuerySpec used to fetch the data.
 */

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const stdDev = (values, avg) => {
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * Detect a recent anomaly using a z-score against historical values.
 * @param {AnalyzerContext} context - Analyzer context.
 * @returns {Insight[]|Insight} Insight result(s).
 */
const analyze = ({ rows, querySpec }) => {
  const measureId = findMeasureId(rows, querySpec);
  if (!measureId) {
    return [];
  }
  const values = (rows || [])
    .map((row) => Number(row?.[measureId]))
    .filter((value) => Number.isFinite(value));
  if (values.length < 5) {
    return [];
  }
  const last = values[values.length - 1];
  const avg = mean(values.slice(0, -1));
  const deviation = stdDev(values.slice(0, -1), avg);
  if (deviation === 0) {
    return [];
  }
  const zScore = (last - avg) / deviation;
  if (Math.abs(zScore) < 2.2) {
    return [];
  }

  return {
    title: 'Recent anomaly detected',
    severity: zScore > 0 ? 'warning' : 'negative',
    narrative: `The latest ${measureId} value deviates from the recent average by ${Math.abs(zScore).toFixed(1)} standard deviations.`,
    recommendedAction: 'Review the contributing drivers behind this spike or dip.',
    evidence: [
      `Latest value: ${last.toLocaleString()}`,
      `Recent average: ${avg.toFixed(1)}`,
    ],
  };
};

/**
 * Analyzer definition for anomaly detection.
 * @type {{ id: string, label: string, analyze: (context: AnalyzerContext) => Insight[]|Insight }}
 */
export default {
  id: 'anomaly',
  label: 'Anomaly Detection',
  analyze,
};
