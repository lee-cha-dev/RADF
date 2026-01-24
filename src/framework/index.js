/**
 * RADF public entry point.
 * Importing this module applies RADF styles automatically.
 */
import './styles/framework.entry.css';

export { default as DashboardProvider } from './core/dashboard/DashboardProvider.jsx';
export { useDashboardActions } from './core/dashboard/useDashboardActions.js';
export { useDashboardState } from './core/dashboard/useDashboardState.js';
export * as dashboardSelectors from './core/dashboard/dashboardSelectors.js';

export { buildQuerySpec } from './core/query/buildQuerySpec.js';
export {
  assertDataProvider,
  createDataProvider,
  isDataProvider,
} from './core/query/DataProvider.js';
export { MockDataProvider } from './core/query/MockDataProvider.js';
export { useQuery } from './core/query/useQuery.js';

export { default as registerCharts } from './core/registry/registerCharts.js';
export { default as registerInsights } from './core/registry/registerInsights.js';

export { default as GridLayout } from './core/layout/GridLayout.jsx';
export { default as Panel } from './core/layout/Panel.jsx';
export { default as VizRenderer } from './core/viz/VizRenderer.jsx';

export { createDataset } from './core/model/createDataset.js';
export { createDimension } from './core/model/createDimension.js';
export { createMetric } from './core/model/createMetric.js';
