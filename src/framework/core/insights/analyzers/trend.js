/**
 * @module core/insights/analyzers/trend
 * @description Analyzer that summarizes directional trends in a series.
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
 * @property {Record<string, unknown>|null} [meta] - Provider metadata.
 */

/**
 * Format a value for narrative output.
 * @param {number|null|undefined} value - Numeric value.
 * @returns {string} Locale-aware label.
 */
const formatNumber = (value) => {
  if (value == null || Number.isNaN(value)) {
    return '0';
  }
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

/**
 * Extract numeric values for a measure from rows.
 * @param {Object[]} rows - Raw query rows.
 * @param {string} measureId - Measure field id.
 * @returns {number[]} Filtered numeric values.
 */
const getValues = (rows, measureId) =>
  (rows || [])
    .map((row) => Number(row?.[measureId]))
    .filter((value) => Number.isFinite(value));

/**
 * Summarize the overall directional trend in a series.
 * @param {AnalyzerContext} context - Analyzer context.
 * @returns {Insight[]|Insight} Insight result(s).
 */
const analyze = ({ rows, querySpec, meta }) => {
  const measureId = findMeasureId(rows, querySpec);
  if (!measureId) {
    return [];
  }
  const values = getValues(rows, measureId);
  if (values.length < 2) {
    return [];
  }
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const percent = first !== 0 ? delta / Math.abs(first) : null;
  const direction = delta > 0 ? 'upward' : delta < 0 ? 'downward' : 'flat';
  const magnitude = percent != null ? Math.abs(percent) : null;
  const severity =
    magnitude == null
      ? 'info'
      : magnitude > 0.2
      ? 'positive'
      : magnitude > 0.08
      ? 'info'
      : 'neutral';
  const percentLabel = percent == null ? null : `${Math.abs(percent * 100).toFixed(1)}%`;
  const rowCount = meta?.rowCount ?? rows?.length ?? 0;
  const narrative =
    direction === 'flat'
      ? `The ${measureId} metric stayed flat across ${rowCount} points.`
      : `The ${measureId} metric moved ${direction}, changing ${percentLabel || formatNumber(Math.abs(delta))} from ${formatNumber(first)} to ${formatNumber(last)} across ${rowCount} points.`;

  return {
    title: `Trend is ${direction}`,
    severity,
    narrative,
    recommendedAction:
      direction === 'downward'
        ? 'Investigate recent drivers impacting the downward shift.'
        : direction === 'upward'
        ? 'Sustain the current momentum and identify leading contributors.'
        : 'Monitor for any emerging shifts over the next period.',
    evidence: [
      `Start: ${formatNumber(first)}`,
      `End: ${formatNumber(last)}`,
      percentLabel ? `Net change: ${percentLabel}` : `Net change: ${formatNumber(delta)}`,
    ],
  };
};

/**
 * Analyzer definition for trend summarization.
 * @type {{ id: string, label: string, analyze: (context: AnalyzerContext) => Insight[]|Insight }}
 */
export default {
  id: 'trend',
  label: 'Trend Summary',
  analyze,
};
