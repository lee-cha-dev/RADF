# Documentation Sprint — Full Project JSDoc (Codex)

Objective: produce **high-quality JSDoc documentation** for the entire RADF codebase (framework + example app) so new contributors and consumers can understand APIs, contracts, and extension points quickly.

This sprint is organized by branch. Each branch should be a focused PR with clear acceptance criteria.

Conventions:
- Branch name format: `feature/{feature_name}`
- No TypeScript. JSDoc only.
- Do not change runtime behavior except where absolutely necessary to make docs accurate.
- Prefer documenting **public surfaces + extension points** first.
- Keep docs consistent across folders (types, naming, tags).

---

## Global JSDoc Requirements (STRICT)

### What must be documented
- Every **exported**:
  - function
  - class
  - class method (public; private if non-trivial)
  - React component
  - constant that is part of the public contract (configs, registries, schema helpers)
- Module/file headers for all files in `src/framework/core/**`.

### How to document
- Use `@module` at top of file for key modules.
- Use canonical `@typedef` for shared shapes (QuerySpec, ProviderResult, DashboardState, etc.).
- Use `@param`, `@returns`, `@throws` where applicable.
- Use `@example` for consumer-facing APIs and extension points.
- Document side effects: caching, abort behavior, mutations, dispatching, external calls.

### React components
- Define a `Props` typedef:
  - `/** @typedef {Object} MyComponentProps ... */`
- Document the component:
  - `/** @param {MyComponentProps} props */`

### Typedef strategy (single source of truth)
- Create **one canonical typedef file** and reference it everywhere.
- Do **not** create duplicate typedefs across modules.

---

## feature/docs-jsdoc-foundation

### Goal
Create the canonical typedef foundation + documentation standards used across the project.

### Scope / Tasks
- Add a canonical shared typedef module containing:
  - Query layer: `QuerySpec`, `QueryResult`, `ProviderResult`, `DataProvider`, `TransformSpec`
  - Model layer: `Dataset`, `Dimension`, `Metric`, `FieldType`, `Hierarchy`
  - Dashboard layer: `DashboardState`, `DashboardAction`, `DashboardConfig`, `PanelConfig`
  - Viz layer: `VizConfig`, `SeriesConfig`, `AxisConfig`, `PaletteConfig`
  - Interactions: `Selection`, `Filter`, `DrilldownPath`, `BrushRange`
  - Insights: `Insight`, `Analyzer`, `AnalyzerContext`
- Add a short internal “Documentation Standards” block comment at the top of the typedef file:
  - naming rules
  - when to use @example
  - what constitutes public API
- Add top-level module docs to:
  - `src/main.jsx`
  - `src/routes.jsx`
  - `src/App.jsx`

### Files
- New: `src/framework/core/docs/jsdocTypes.js` (canonical location)
- `src/main.jsx`
- `src/routes.jsx`
- `src/App.jsx`

### Acceptance Criteria
- Exactly one canonical typedef file exists.
- Entry points include clear module-level docs (boot flow, registry init, routing).
- No behavior changes.

---

## feature/docs-query-layer

### Goal
Fully document the query system: contracts, lifecycle, caching, transforms.

### Scope / Tasks
Add **complete JSDoc** to:
- `DataProvider.js` (contract)
- `MockDataProvider.js`
- `QuerySpec.js`
- `buildQuerySpec.js`
- `normalizeQuerySpec.js`
- `hashQuerySpec.js`
- `cache.js`
- `useQuery.js`
- `transforms/index.js`
- `transforms/pivot.js`
- `transforms/rolling.js`
- `transforms/sort.js`
- `transforms/yoy.js`

Document explicitly:
- Provider method signatures + return shapes
- `useQuery` lifecycle (cache hit/miss, stale, abort, validation expectations)
- Cache semantics (keying, eviction behavior, limits)
- Transform contracts (inputs/outputs/options) + examples

### Files
- `src/framework/core/query/**`

### Acceptance Criteria
- Every exported function/class/component in query layer has JSDoc.
- `DataProvider` contract is unambiguous.
- At least one `@example` for:
  - implementing a provider
  - using `useQuery` with a QuerySpec
  - applying transforms

---

## feature/docs-dashboard-core

### Goal
Document dashboard state, actions, reducer, selectors, hooks, and provider boundaries.

### Scope / Tasks
Add **complete JSDoc** to:
- `DashboardContext.js`
- `DashboardProvider.jsx`
- `dashboardActions.js`
- `dashboardReducer.js`
- `dashboardSelectors.js`
- `useDashboardActions.js`
- `useDashboardState.js`

Document explicitly:
- Dashboard state shape + invariants
- Action list + payload contracts
- Selector inputs/outputs (and memoization intent)
- Provider responsibilities and composition patterns
- Examples: reading state + dispatching an action

### Files
- `src/framework/core/dashboard/**`

### Acceptance Criteria
- Every exported symbol is documented.
- Actions/reducer/selectors are documented in a way that a consumer can extend safely.
- Includes `@example` usage for provider + hooks.

---

## feature/docs-registry-and-viz

### Goal
Document registry extension points and visualization system.

### Scope / Tasks
Add **complete JSDoc** to:
- `registry/registry.js`
- `registry/registerCharts.js`
- `registry/registerInsights.js`
- `viz/VizRenderer.jsx`
- `viz/charts/BarChartPanel.jsx`
- `viz/charts/LineChartPanel.jsx`
- `viz/charts/KpiPanel.jsx`
- `viz/common/ChartContainer.jsx`
- `viz/common/ChartLegend.jsx`
- `viz/common/ChartTooltip.jsx`
- `viz/common/chartColors.js`
- `viz/legend/Legend.jsx`
- `viz/palettes/colorAssignment.js`
- `viz/palettes/paletteRegistry.js`
- `viz/palettes/paletteResolver.js`
- `viz/palettes/seriesColors.js`

Document explicitly:
- How to register a chart type (inputs/expected render contract)
- Viz config shape and required keys
- Renderer missing-viz behavior
- Palette resolution rules + override hooks

### Files
- `src/framework/core/registry/**`
- `src/framework/core/viz/**`

### Acceptance Criteria
- Clear step-by-step `@example` for adding a custom chart.
- All components have Props typedefs + documented props.

---

## feature/docs-interactions

### Goal
Document interaction utilities and related UI components.

### Scope / Tasks
Add **complete JSDoc** to:
- `brushZoom.js`
- `crossFilter.js`
- `drilldown.js`
- `SelectionChips.jsx`
- `DrillBreadcrumbs.jsx`

Document explicitly:
- Selection/filter shape contracts
- Hierarchy/drill path semantics
- Edge cases (empty selection, multi-select, clearing behavior)
- Examples showing wiring into dashboard state

### Files
- `src/framework/core/interactions/**`

### Acceptance Criteria
- Utility functions read like stable APIs with explicit input/output contracts.
- Components have Props typedefs and show expected integration points.

---

## feature/docs-insights

### Goal
Document insights engine and how to create new analyzers.

### Scope / Tasks
Add **complete JSDoc** to:
- `InsightEngine.js`
- `useInsights.js`
- `InsightsPanel.jsx`
- `analyzers/analysisUtils.js`
- `analyzers/anomaly.js`
- `analyzers/topDrivers.js`
- `analyzers/trend.js`

Document explicitly:
- Analyzer interface (inputs/context/config/output)
- Insight result shape + rendering expectations
- Registration pathway and lifecycle
- Examples: authoring and registering a custom analyzer

### Files
- `src/framework/core/insights/**`

### Acceptance Criteria
- A developer can build a new analyzer using docs alone.
- `@example` included for analyzer implementation + registration.

---

## feature/docs-layout-and-error-handling

### Goal
Document layout primitives and error handling UX.

### Scope / Tasks
Add **complete JSDoc** to:
- `layout/EmptyState.jsx`
- `layout/ErrorBoundary.jsx`
- `layout/ErrorState.jsx`
- `layout/GridLayout.jsx`
- `layout/LoadingState.jsx`
- `layout/Panel.jsx`
- `layout/PanelBody.jsx`
- `layout/PanelHeader.jsx`

Document explicitly:
- Responsibilities per component
- Required/optional props
- Styling expectations (CSS classes used)
- ErrorBoundary reset behavior and when it triggers

### Files
- `src/framework/core/layout/**`

### Acceptance Criteria
- Every exported component has Props typedef + JSDoc.
- ErrorBoundary docs explain integration clearly.

---

## feature/docs-model-layer

### Goal
Document semantic/model helpers and schemas (dataset/metric/dimension).

### Scope / Tasks
Add **complete JSDoc** to:
- `createDataset.js`
- `createDimension.js`
- `createMetric.js`
- `fieldTypes.js`
- `hierarchies.js`

Document explicitly:
- Required fields + validation behavior
- How datasets/dimensions/metrics are meant to be composed
- Examples: define dataset + metric + dimension and reference them from a dashboard

### Files
- `src/framework/core/model/**`

### Acceptance Criteria
- Consumers can define schemas correctly using docs alone.
- Includes at least one full “define & use” `@example`.

---

## feature/docs-example-app

### Goal
Turn the example app into a “living tutorial” with clear, documented wiring.

### Scope / Tasks
Add **complete JSDoc** to:
- `src/app/pages/DashboardPage.jsx`
- `src/app/dashboards/example/ExampleFilterBar.jsx`
- `src/app/dashboards/example/example.dashboard.js`
- `src/app/dashboards/example/example.dataset.js`
- `src/app/dashboards/example/example.dimensions.js`
- `src/app/dashboards/example/example.metrics.js`

Document explicitly:
- How dashboard config is structured
- How filters + interactions map into query specs
- How to clone the example to create a new dashboard

### Files
- `src/app/**`

### Acceptance Criteria
- A new dashboard can be created by copying the example with minimal guesswork.
- Example modules explain intent, not just mechanics.

---

## feature/docs-readme-extension-points

### Goal
Add a concise, high-signal README section pointing to extension points and “how to customize RADF.”

### Scope / Tasks
- Add “API / Extension Points” section:
  - Data Providers
  - QuerySpec + transforms
  - Registry (charts + insights)
  - Themes
  - Interactions + drilldowns
- Link to relevant modules (paths) and mention canonical typedef file location.

### Files
- `README.md`

### Acceptance Criteria
- README clearly directs a consumer where to start for each customization path.
- No marketing fluff; keep it actionable.

---

# Suggested branch execution order
1. `feature/docs-jsdoc-foundation`
2. `feature/docs-query-layer`
3. `feature/docs-dashboard-core`
4. `feature/docs-registry-and-viz`
5. `feature/docs-interactions`
6. `feature/docs-insights`
7. `feature/docs-layout-and-error-handling`
8. `feature/docs-model-layer`
9. `feature/docs-example-app`
10. `feature/docs-readme-extension-points`

---

# Definition of Done (Documentation Sprint)

- Every file in `src/framework/core/**` has:
  - module header (or clear top-level summary)
  - JSDoc for **each exported class/function/component**
  - JSDoc for **class methods** (public; private if non-trivial)
  - Props typedefs for React components
  - shared typedef references used consistently (single canonical typedef file)
- Every file listed in sprint branches above has complete JSDoc coverage for exports.
- `@example` present for all major extension points:
  - provider implementation
  - `useQuery` usage
  - registering a chart
  - registering an analyzer
  - defining dataset/metrics/dimensions
- README includes an “API / Extension Points” section.
- No behavior changes unless required to fix doc inaccuracies (and if so, documented in PR notes).
