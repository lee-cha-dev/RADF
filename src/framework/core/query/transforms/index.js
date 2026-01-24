/**
 * @module core/query/transforms
 * @description Registry + utilities for query post-processing transforms.
 */

import { pivotRows } from './pivot';
import { rollingRows } from './rolling';
import { sortRows } from './sort';
import { yoyRows } from './yoy';

/**
 * @typedef {import('../../docs/jsdocTypes').TransformSpec} TransformSpec
 */

/**
 * Default transform registry mapping transform ids to handlers.
 *
 * @type {Record<string, (rows: Array<Object>, transform: TransformSpec) => Array<Object>>}
 */
export const TRANSFORM_REGISTRY = {
  sort: sortRows,
  pivot: pivotRows,
  rolling: rollingRows,
  yoy: yoyRows,
};

/**
 * Applies a single transform to a row set.
 *
 * @param {Array<Object>} [rows=[]]
 * @param {TransformSpec} [transform={}]
 * @returns {Array<Object>} Transformed rows.
 */
export const applyTransform = (rows = [], transform = {}) => {
  if (!transform?.type) {
    return Array.isArray(rows) ? [...rows] : [];
  }

  const handler = TRANSFORM_REGISTRY[transform.type];
  if (!handler) {
    return Array.isArray(rows) ? [...rows] : [];
  }

  return handler(rows, transform);
};

/**
 * Applies a list of transforms in sequence.
 *
 * @param {Array<Object>} [rows=[]]
 * @param {TransformSpec[]} [transforms=[]]
 * @returns {Array<Object>} Transformed rows.
 *
 * @example
 * const rows = [
 *   { month: '2024-01', revenue: 120 },
 *   { month: '2024-02', revenue: 150 },
 * ];
 *
 * const output = applyTransforms(rows, [
 *   { type: 'sort', field: 'month', order: 'asc' },
 *   { type: 'rolling', field: 'revenue', window: 2 },
 * ]);
 */
export const applyTransforms = (rows = [], transforms = []) => {
  const list = Array.isArray(rows) ? rows : [];
  if (!Array.isArray(transforms) || transforms.length === 0) {
    return [...list];
  }

  return transforms.reduce((result, transform) => {
    return applyTransform(result, transform);
  }, list);
};

export { pivotRows, rollingRows, sortRows, yoyRows };
