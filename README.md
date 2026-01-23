# README.md — Recharts Analytics Dashboard Framework (RADF)

PowerBI-style analytics dashboards built with:
- **React (JavaScript only)** — **NO TypeScript**
- **Recharts** for charting
- **Plain CSS files** — **NO Tailwind**, **NO inline styles**
- Config-driven dashboards + semantic layer + query layer + interactions + insights

This repo is designed so an AI can build it incrementally using the feature-branch plan.

---

## Non-Negotiables (Hard Constraints)

1. **JavaScript ONLY** (no `.ts`, no `.tsx`, no TS configs)
2. **No Tailwind**
3. **No inline styling** (`style={{...}}` is forbidden)
4. All components must use `className` and reference CSS files
5. Charts must be implemented using **Recharts**
6. Data fetching must support **AbortController**
7. Must prevent fetch storms: stable QuerySpec hashing + caching + memoization

---

## Project Goal

Create a reusable dashboard framework that provides PowerBI-like capabilities:
- Config-driven dashboards (add a new dashboard mostly by config + definitions)
- Semantic layer (metrics/dimensions/hierarchies) reusable across dashboards
- Query layer (QuerySpec -> provider -> transforms -> cache)
- Interactions:
  - cross-filtering (click a chart filters other charts)
  - drilldown (month -> day, hierarchy navigation)
  - brush/zoom for time-series
- Insight engine (pluggable analyzers producing insight cards)
- Theme system (light/dark via CSS variables)

---

## Quick Start

```bash
npm install
npm run dev
````

Expected result:

* App boots to a “Framework Loaded” page initially
* Later branches will wire in example dashboards and interactions

---

## How Work Is Organized

All work is split into **feature branches**.
The AI should implement branches in order, merging each branch into `main` only after its acceptance criteria are met.

> Branch naming: `feature/<name>`
> Each branch has a specific deliverable scope. Do NOT implement future-branch features early unless required by the current branch.

---

## AI Work Instructions (Branch-by-Branch)

### Operating Rules for the AI

* Implement ONLY the branch you are currently assigned.
* Keep framework code **generic**: no domain-specific naming (e.g., “overtime”) inside `src/framework/`.
* Domain/example-specific naming belongs in `src/app/dashboards/example/`.
* No fake “business logic” metrics unless explicitly defined in example dashboard files.
* Prefer composable functions, pure reducers, and pure transforms.
* Memoize derived objects passed to hooks to avoid rerender/fetch loops.

---

## Branch Plan (Execution Order)

### 1) `feature/repo-bootstrap`

**Objective:** Create a runnable React app skeleton with the target folder structure and CSS pipeline.

**Must implement:**

* React app setup (prefer Vite)
* Base folder structure under `src/framework` and `src/app`
* `App.jsx`, basic routing stub, `DashboardPage.jsx` placeholder
* Global CSS imports:

  * `src/framework/styles/tokens.css`
  * `src/framework/styles/theme.light.css`
  * `src/framework/styles/theme.dark.css`
  * `src/framework/styles/framework.css`
* Theme toggle should switch which theme file is applied (simple implementation OK)

**Acceptance criteria:**

* `npm install && npm run dev` works
* No TS, no Tailwind, no inline styles
* Page renders “Framework Loaded”

---

### 2) `feature/core-dashboard-provider`

**Objective:** Implement dashboard state container + actions + selectors.

**Must implement:**

* `DashboardProvider.jsx` (useReducer + Context)
* `dashboardReducer.js`, `dashboardActions.js`, `dashboardSelectors.js`
* Hooks:

  * `useDashboardState.js`
  * `useDashboardActions.js`

**State must include:**

* `dashboardId`, `datasetId`
* `globalFilters`
* `selections` (cross-filters)
* `drillPath`
* `panelStateById`

**Acceptance criteria:**

* Can set a global filter
* Can add/remove a selection
* Can push/pop drill path entries
* Reducer is pure (no side effects)

---

### 3) `feature/semantic-layer`

**Objective:** Define dataset/metric/dimension contracts and builder helpers.

**Must implement:**

* `createDataset.js`, `createMetric.js`, `createDimension.js`
* `hierarchies.js`, `fieldTypes.js`
* Example definitions under `src/app/dashboards/example/`:

  * `example.dataset.js`
  * `example.metrics.js`
  * `example.dimensions.js`

**Acceptance criteria:**

* Dataset exposes stable IDs and field catalog
* Metrics/dimensions are plain JS objects (optionally with JSDoc)

---

### 4) `feature/query-layer-foundation`

**Objective:** Implement QuerySpec, builder, normalization, hashing.

**Must implement:**

* `QuerySpec.js` helpers/schema conventions
* `buildQuerySpec.js`
* `normalizeQuerySpec.js`
* `hashQuerySpec.js` (stable: key order cannot change hash)
* `cache.js` basic in-memory cache object

**Acceptance criteria:**

* Identical semantic queries always produce identical hash
* QuerySpec merges:

  * globalFilters
  * selections
  * drillPath
  * panel query
* No refetch storms caused by object identity churn (memoize QuerySpec construction)

---

### 5) `feature/data-provider-and-useQuery`

**Objective:** DataProvider abstraction + MockDataProvider + `useQuery`.

**Must implement:**

* `DataProvider.js` interface-like module
* Mock provider (runnable demo data)
* `useQuery.js`:

  * uses cache by hash
  * supports AbortController cancellation
  * supports SWR behavior (serve cached, then refresh if stale)

**Acceptance criteria:**

* Rapid filter changes abort previous request
* Cached responses prevent repeated identical network calls
* Mock provider returns deterministic output for same QuerySpec

---

### 6) `feature/transforms`

**Objective:** Pure reusable transforms.

**Must implement:**

* `transforms/index.js`
* `sort.js`, `pivot.js`, `rolling.js`, `yoy.js`

**Acceptance criteria:**

* Transforms are pure functions
* Panel configs can declare transforms

---

### 7) `feature/layout-panels`

**Objective:** Grid layout + panel chrome.

**Must implement:**

* `GridLayout.jsx`, `Panel.jsx`, `PanelHeader.jsx`, `PanelBody.jsx`
* UI state components:

  * `LoadingState.jsx`, `EmptyState.jsx`, `ErrorState.jsx`
* CSS:

  * `grid.css`, `panel.css`

**Acceptance criteria:**

* Dashboard config places panels correctly
* Panel chrome is consistent
* All styling in CSS files

---

### 8) `feature/viz-registry-and-core-charts`

**Objective:** VizRenderer + registry + initial Recharts panels.

**Must implement:**

* `registry.js`, `registerCharts.js`
* `VizRenderer.jsx`
* Recharts panels:

  * `LineChartPanel.jsx`
  * `BarChartPanel.jsx`
* Common components:

  * `ChartContainer.jsx`, `ChartTooltip.jsx`, `ChartLegend.jsx`
* CSS: `charts.css`

**Acceptance criteria:**

* Panels render data provided by hooks/controllers
* Charts do not fetch data
* Tooltips/legend are consistent

---

### 9) `feature/interactions-crossfilter`

**Objective:** Cross-filtering end-to-end.

**Must implement:**

* `crossFilter.js` utilities
* Chart click handlers emit selection filters
* Selection chips UI (recommended but can be minimal)

**Acceptance criteria:**

* Click bar filters line panel
* Clear selection removes cross-filter and triggers refetch correctly

---

### 10) `feature/interactions-drilldown`

**Objective:** Drilldown + drillPath.

**Must implement:**

* `drilldown.js` utilities
* Panel config supports:

  * `interactions.drilldown: { dimension, to }`
* Breadcrumb UI (recommended)

**Acceptance criteria:**

* Drilldown changes dimension grain and filters appropriately
* Breadcrumb allows stepping back

---

### 11) `feature/interactions-brushzoom`

**Objective:** Brush/zoom for time-series.

**Must implement:**

* `brushZoom.js`
* Recharts Brush in line panel
* Debounced commit, optional “Apply to global range”

**Acceptance criteria:**

* Brush adjusts visible window
* Optional: applies global filter without stormy dispatches

---

### 12) `feature/insight-engine`

**Objective:** Pluggable insight analyzers + insight panel.

**Must implement:**

* `InsightEngine.js`, `useInsights.js`
* Analyzers:

  * `trend.js` (required)
  * `anomaly.js` (optional initial)
  * `topDrivers.js` (optional initial)
* `InsightsPanel` rendering cards
* CSS: `insights.css`

**Acceptance criteria:**

* Insights derived from panel data and query meta
* At least one analyzer produces meaningful output

---

### 13) `feature/example-dashboard`

**Objective:** Complete example dashboard proving the framework.

**Must implement:**

* `example.dashboard.js` with layout and panel configs
* A dashboard page that loads this config and renders:

  * KPI
  * line trend
  * bar breakdown
  * insights panel
* Filter bar UI (date range + selection chips)
* Theme toggle wired

**Acceptance criteria:**

* Cross-filter works
* Drilldown works
* Insights show
* Theme works
* MockDataProvider makes it runnable

---

### 14) `feature/docs-and-hardening`

**Objective:** Documentation + guardrails.

**Must implement:**

* Docs in `/docs` or README sections:

  * How to add dashboard
  * How to add metric/dimension
  * How to add chart panel
  * How to add insight analyzer
* Error boundaries (recommended)
* Optional tests for transforms and hashing

**Acceptance criteria:**

* A new dashboard can be added following docs without modifying core framework

---

## How to Add a New Dashboard (Target UX)

When the framework is complete:

1. Create folder: `src/app/dashboards/<name>/`
2. Add:

   * `<name>.dataset.js`
   * `<name>.metrics.js`
   * `<name>.dimensions.js`
   * `<name>.dashboard.js`
3. Register dashboard in app router (or dashboard registry)

You should not need to edit framework internals for typical dashboards.

---

## Developer Docs (Docs & Hardening)

### How to Add a New Dashboard
1. Create a new folder under `src/app/dashboards/<name>/`.
2. Add dataset + semantic definitions:
   * `<name>.dataset.js`
   * `<name>.metrics.js`
   * `<name>.dimensions.js`
3. Add a dashboard config file: `<name>.dashboard.js` with layout + panel config.
4. (Optional) add local styling in `<name>.css` and import it from your dashboard page.
5. Register the dashboard in the app router (or a registry) so it can be navigated to.

Reference implementation: `src/app/dashboards/example/`. 

### How to Add a Metric or Dimension
1. Open your dashboard's `*.metrics.js` or `*.dimensions.js` file.
2. Use the helper creators in `src/framework/core/model/`:
   * `createMetric({ id, label, format, query | compute, ... })`
   * `createDimension({ id, label, type, hierarchy, formatter })`
3. Export the new definitions and include them in your dataset's field catalog.
4. Update panel configs to reference the new IDs in `measures` / `dimensions`.

### How to Add a Chart Panel
1. Create a new chart component in `src/framework/core/viz/charts/` (Recharts only).
2. Add a registry entry in `src/framework/core/registry/registerCharts.js`.
3. Ensure your panel only receives `data`, `encodings`, and `options` props.
4. Add a panel config with `panelType: "viz"` and `vizType` pointing to your registry key.

### How to Add an Insight Analyzer
1. Create a new analyzer in `src/framework/core/insights/analyzers/`.
2. Export a function that receives `{ rows, meta, querySpec, dashboardState }`.
3. Return a list of insight objects: `{ id, title, severity, narrative, ... }`.
4. Register it in `src/framework/core/registry/registerInsights.js`.
5. Add an insights panel in your dashboard config with `panelType: "insights"`.

---

## Guardrails Checklist (Before Merging Any Branch)

* [ ] No TypeScript files or TS config
* [ ] No Tailwind
* [ ] No inline styles
* [ ] Reducers are pure
* [ ] QuerySpec hashing stable
* [ ] Requests abort correctly
* [ ] Components and styles follow folder conventions
* [ ] Example remains runnable

---

## License

TBD (MIT recommended if open source)
