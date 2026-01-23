import { pivotRows } from './pivot';
import { rollingRows } from './rolling';
import { sortRows } from './sort';
import { yoyRows } from './yoy';

export const TRANSFORM_REGISTRY = {
  sort: sortRows,
  pivot: pivotRows,
  rolling: rollingRows,
  yoy: yoyRows,
};

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
