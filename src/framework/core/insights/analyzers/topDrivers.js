/**
 * @module core/insights/analyzers/topDrivers
 * @description Analyzer that identifies top contributing dimension values.
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

/**
 * Surface the highest contributing dimension value in a breakdown.
 * @param {AnalyzerContext} context - Analyzer context.
 * @returns {Insight[]|Insight} Insight result(s).
 */
const analyze = ({ rows, querySpec }) => {
  const dimensionId = querySpec?.dimensions?.[0];
  const measureId = findMeasureId(rows, querySpec);
  if (!dimensionId || !measureId) {
    return [];
  }
  const cleaned = (rows || []).filter((row) => row && row[dimensionId] != null);
  if (cleaned.length < 2) {
    return [];
  }
  const total = cleaned.reduce((sum, row) => sum + Number(row[measureId] || 0), 0);
  if (!total) {
    return [];
  }
  const sorted = [...cleaned].sort((a, b) => (b[measureId] || 0) - (a[measureId] || 0));
  const top = sorted[0];
  const contribution = Number(top[measureId] || 0) / total;
  if (contribution < 0.2) {
    return [];
  }
  const topItems = sorted.slice(0, 3).map((row) => {
    const value = Number(row[measureId] || 0);
    const share = total ? `${((value / total) * 100).toFixed(1)}%` : '0%';
    return `${row[dimensionId]}: ${value.toLocaleString()} (${share})`;
  });

  return {
    title: `Top driver: ${top[dimensionId]}`,
    severity: 'info',
    narrative: `${top[dimensionId]} contributes ${(contribution * 100).toFixed(1)}% of ${measureId}.`,
    recommendedAction: `Validate why ${top[dimensionId]} is outpacing other segments and replicate the drivers if positive.`,
    evidence: topItems,
  };
};

/**
 * Analyzer definition for top-driver detection.
 * @type {{ id: string, label: string, analyze: (context: AnalyzerContext) => Insight[]|Insight }}
 */
export default {
  id: 'topDrivers',
  label: 'Top Drivers',
  analyze,
};
