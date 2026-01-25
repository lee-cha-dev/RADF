/**
 * @module app/dashboards/example/example.dimensions
 * @description Example dimension definitions for the tutorial dashboard.
 */

import { createDimension, FIELD_TYPES } from 'radf';

/**
 * Dimension definitions for the example dataset.
 * @type {import('radf').Dimension[]}
 *
 * @example
 * import dimensions from './example.dimensions';
 */
const dimensions = [
  createDimension({
    id: 'date_year',
    label: 'Year',
    type: FIELD_TYPES.DATE,
    hierarchy: 'order_date',
  }),
  createDimension({
    id: 'date_quarter',
    label: 'Quarter',
    type: FIELD_TYPES.DATE,
    hierarchy: 'order_date',
  }),
  createDimension({
    id: 'date_month',
    label: 'Month',
    type: FIELD_TYPES.DATE,
    hierarchy: 'order_date',
  }),
  createDimension({
    id: 'date_day',
    label: 'Day',
    type: FIELD_TYPES.DATE,
    hierarchy: 'order_date',
  }),
  createDimension({
    id: 'region',
    label: 'Region',
    type: FIELD_TYPES.STRING,
  }),
  createDimension({
    id: 'product',
    label: 'Product',
    type: FIELD_TYPES.STRING,
  }),
];

export default dimensions;
