/**
 * RADF public entry point.
 * Importing this module applies RADF styles automatically.
 */
import './styles/framework.entry.css';

/** Provider that supplies dashboard state and actions. */
export { default as DashboardProvider } from './core/dashboard/DashboardProvider.jsx';
/** Hook to dispatch dashboard actions. */
export { useDashboardActions } from './core/dashboard/useDashboardActions.js';
/** Hook to read the current dashboard state. */
export { useDashboardState } from './core/dashboard/useDashboardState.js';
/** Selector helpers for dashboard state. */
export * as dashboardSelectors from './core/dashboard/dashboardSelectors.js';

/** Build a normalized query specification from a panel config. */
export { buildQuerySpec } from './core/query/buildQuerySpec.js';
/** Create a DataProvider contract wrapper around an execute function. */
export { createDataProvider as DataProvider } from './core/query/DataProvider.js';
/** Create a DataProvider contract wrapper around an execute function. */
export {
  assertDataProvider,
  createDataProvider,
  isDataProvider,
} from './core/query/DataProvider.js';
/** Mock data provider for local development. */
export { MockDataProvider } from './core/query/MockDataProvider.js';
/** Query hook that executes a QuerySpec against a DataProvider. */
export { useQuery } from './core/query/useQuery.js';

/** Register the default chart visualizations. */
export { default as registerCharts } from './core/registry/registerCharts.js';
/** Register the default insight modules. */
export { default as registerInsights } from './core/registry/registerInsights.js';

/** Grid layout component for arranging dashboard panels. */
export { default as GridLayout } from './core/layout/GridLayout.jsx';
/** Panel chrome component for titles, loading, and empty states. */
export { default as Panel } from './core/layout/Panel.jsx';
/** Visualization renderer for registered viz types. */
export { default as VizRenderer } from './core/viz/VizRenderer.jsx';

/** Create a dataset definition for the semantic layer. */
export { createDataset } from './core/model/createDataset.js';
/** Create a dimension definition for the semantic layer. */
export { createDimension } from './core/model/createDimension.js';
/** Create a metric definition for the semantic layer. */
export { createMetric } from './core/model/createMetric.js';
