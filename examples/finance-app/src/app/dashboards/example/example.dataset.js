/**
 * @module app/dashboards/example/example.dataset
 * @description Example dataset definition used by the tutorial dashboard.
 */

import { createDataset, createHierarchy } from 'radf';
import dimensions from './example.dimensions';
import metrics from './example.metrics';

/**
 * Drilldown hierarchy for date dimensions used in the example dashboard.
 * @type {import('radf').Hierarchy[]}
 */
const hierarchies = [
  createHierarchy({
    id: 'order_date',
    type: 'date',
    label: 'Order Date',
    levels: ['date_year', 'date_quarter', 'date_month', 'date_day'],
  }),
];

/**
 * Dataset with dimensions, metrics, and hierarchies for the example dashboard.
 * @type {import('radf').Dataset}
 *
 * @example
 * import exampleDataset from './example.dataset';
 * // Register this dataset with your provider or semantic layer registry.
 */
const exampleDataset = createDataset({
  id: 'example_dataset',
  label: 'Example Dataset',
  dimensions,
  metrics,
  hierarchies,
  defaultGrain: 'date_month',
  timezone: 'UTC',
});

export default exampleDataset;
