# RADF (Recharts Analytics Dashboard Framework)

RADF is a reusable, config-driven React framework for building PowerBI-like analytics dashboards: grids of KPI cards, trend charts, breakdowns, cross-filtering, drilldowns, and insights. It gives you a semantic layer (metrics/dimensions), a query layer, dashboard state management, and Recharts-based visualizations so you can ship consistent dashboards fast in any React app.

**Hard constraints (non-negotiable):**
- **JavaScript only** (no TypeScript)
- **No Tailwind**
- **No inline styles** (no `style={{ ... }}`)
- **Recharts for charts**
- **CSS files + CSS variables** for tokens/themes

---

## Quick Start (Using RADF in your app)

1) **Copy the framework code into your app**
   - From this repo: `src/framework/`
   - Into your app (recommended): `src/components/radf/` or `src/lib/radf/`

2) **Copy global styles**
   - Copy `src/framework/styles/*` into your app (either under the same `radf` folder or your global styles folder).
   - You can keep the `styles/` folder inside the RADF path if you prefer.

3) **Install Recharts**

```bash
npm install recharts
```

4) **Import RADF styles in your app entry point** (`main.jsx` or `index.jsx`) in this order:

```jsx
import './components/radf/styles/tokens.css';
import './components/radf/styles/theme.light.css';
import './components/radf/styles/theme.dark.css';
import './components/radf/styles/framework.css';
import './components/radf/styles/components/grid.css';
import './components/radf/styles/components/panel.css';
import './components/radf/styles/components/charts.css';
import './components/radf/styles/components/filters.css';
import './components/radf/styles/components/insights.css';
import './components/radf/styles/components/table.css';
```

5) **Register the default viz + insight modules** (once at startup):

```jsx
import registerCharts from './components/radf/core/registry/registerCharts.js';
import registerInsights from './components/radf/core/registry/registerInsights.js';

registerCharts();
registerInsights();
```

6) **Theme toggle (light/dark)**
   - Themes are applied by adding a class to the root element (`document.documentElement`).
   - `theme.light.css` and `theme.dark.css` both define `:root.radf-theme-light` and `:root.radf-theme-dark`.

```jsx
const THEME_CLASS = {
  light: 'radf-theme-light',
  dark: 'radf-theme-dark',
};

useEffect(() => {
  const root = document.documentElement;
  root.classList.remove(THEME_CLASS.light, THEME_CLASS.dark);
  root.classList.add(THEME_CLASS[theme]);
}, [theme]);
```

> If your app already has a theme system, map it to these root classes and keep the CSS variable names intact.

---

## Basic Usage Example

Below is a minimal example that wires up a dashboard page with RADF’s provider, layout, and visualization renderer. This example uses the included `MockDataProvider` for local data.

### `DashboardPage.jsx`

```jsx
import React, { useMemo } from 'react';
import DashboardProvider from '../components/radf/core/dashboard/DashboardProvider.jsx';
import { useDashboardState } from '../components/radf/core/dashboard/useDashboardState.js';
import GridLayout from '../components/radf/core/layout/GridLayout.jsx';
import Panel from '../components/radf/core/layout/Panel.jsx';
import VizRenderer from '../components/radf/core/viz/VizRenderer.jsx';
import { buildQuerySpec } from '../components/radf/core/query/buildQuerySpec.js';
import { useQuery } from '../components/radf/core/query/useQuery.js';
import { MockDataProvider } from '../components/radf/core/query/MockDataProvider.js';
import dashboardConfig from './dashboard.config.js';

const VizPanel = ({ panel }) => {
  const dashboardState = useDashboardState();
  const querySpec = useMemo(
    () => buildQuerySpec(panel, dashboardState),
    [panel, dashboardState]
  );

  const { data, loading, error } = useQuery(querySpec, {
    provider: MockDataProvider,
  });

  const isEmpty = !loading && !error && (!data || data.length === 0);
  const status = loading ? 'loading' : error ? 'error' : 'ready';

  return (
    <Panel
      title={panel.title}
      subtitle={panel.subtitle}
      status={status}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="No data returned for this panel."
    >
      <VizRenderer
        vizType={panel.vizType}
        data={data || []}
        encodings={panel.encodings}
        options={panel.options}
      />
    </Panel>
  );
};

const DashboardContent = () => (
  <section className="radf-dashboard">
    <h1 className="radf-dashboard__title">{dashboardConfig.title}</h1>
    <p className="radf-dashboard__subtitle">{dashboardConfig.subtitle}</p>
    <GridLayout
      panels={dashboardConfig.panels}
      renderPanel={(panel) => (
        <VizPanel key={panel.id} panel={panel} />
      )}
    />
  </section>
);

function DashboardPage() {
  return (
    <DashboardProvider
      initialState={{
        dashboardId: dashboardConfig.id,
        datasetId: dashboardConfig.datasetId,
      }}
    >
      <DashboardContent />
    </DashboardProvider>
  );
}

export default DashboardPage;
```

### `dashboard.config.js`

```js
const dashboardConfig = {
  id: 'sales-overview',
  title: 'Sales Overview',
  subtitle: 'Revenue and growth at a glance',
  datasetId: 'sales_dataset',
  panels: [
    {
      id: 'kpi-revenue',
      panelType: 'viz',
      vizType: 'kpi',
      title: 'Total Revenue',
      subtitle: 'Last 30 days',
      layout: { x: 1, y: 1, w: 4, h: 1 },
      datasetId: 'sales_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: [],
      },
      encodings: { value: 'total_revenue', label: 'Total Revenue' },
      options: { format: 'currency', caption: 'All regions' },
    },
    {
      id: 'trend-revenue',
      panelType: 'viz',
      vizType: 'line',
      title: 'Revenue Trend',
      subtitle: 'Monthly revenue',
      layout: { x: 1, y: 2, w: 8, h: 2 },
      datasetId: 'sales_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: ['order_month'],
      },
      encodings: { x: 'order_month', y: 'total_revenue' },
      options: { tooltip: true, legend: false },
    },
  ],
};

export default dashboardConfig;
```

### Minimal `MockDataProvider` usage

RADF includes a mock provider you can use during integration. For production, supply your own provider (see “Data Providers” below).

---

## How to Add a Dashboard

1) **Create semantic layer files** (dataset + metrics + dimensions):
   - `your-dashboard.dataset.js`
   - `your-dashboard.metrics.js`
   - `your-dashboard.dimensions.js`
2) **Create a dashboard config** with layout + panels (`your-dashboard.dashboard.js`).
3) **Load the config on your page** and pass it into `DashboardProvider` and `GridLayout`.

Reference the example dashboard in `src/app/dashboards/example/` for structure.

---

## How to Add a Panel

1) Pick a `vizType` registered in `core/registry/registerCharts.js` (`kpi`, `line`, `bar`, etc.).
2) Define the `query` object:
   - `measures: []`
   - `dimensions: []`
3) Provide `encodings` that map query fields to chart axes.
4) (Optional) Configure interactions:

```js
interactions: {
  crossFilter: { field: 'region', label: 'Region' },
  drilldown: { dimension: 'order_month', to: 'order_day' },
  brushZoom: { field: 'order_day', applyToGlobal: true }
}
```

---

## How to Add Metrics & Dimensions

RADF’s semantic layer lives in `core/model/` and lets you define reusable business logic.

```js
import { createMetric } from './components/radf/core/model/createMetric.js';
import { createDimension } from './components/radf/core/model/createDimension.js';

export const totalRevenue = createMetric({
  id: 'total_revenue',
  label: 'Total Revenue',
  format: 'currency',
  query: { field: 'revenue', op: 'SUM' },
});

export const orderMonth = createDimension({
  id: 'order_month',
  label: 'Order Month',
  type: 'date',
  hierarchy: ['order_year', 'order_quarter', 'order_month', 'order_day'],
});
```

**Hierarchies power drilldowns.** If you define `hierarchy` on a dimension, drilldown interactions can step through the levels in order.

---

## Data Providers

RADF queries data through a `DataProvider` object with an `execute` method:

```js
const myProvider = {
  async execute(querySpec, { signal }) {
    // querySpec includes datasetId, measures, dimensions, filters, etc.
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(querySpec),
      signal,
    });

    const json = await response.json();
    return { rows: json.rows, meta: json.meta };
  },
};
```

**Key requirements:**
- Must accept `execute(querySpec, { signal })` (AbortController is required).
- `useQuery` caches results based on a stable QuerySpec hash; it will reuse cached responses and refetch when stale.

---

## Theming & Styling

- **Tokens + themes:** `styles/tokens.css` defines spacing, typography, radii, and base tokens. Theme files (`theme.light.css`, `theme.dark.css`) define the color palette via CSS variables.
- **Custom palettes:** override variables in your theme file (or define a new theme file) without changing component CSS.
- **Panel elevation & borders:** look in `styles/components/panel.css` and `styles/framework.css` for shadow and border variables.

---

## Constraints / Known Limitations

- JavaScript only (no TypeScript)
- No Tailwind
- No inline styles
- Recharts determines chart capabilities and limits

---

## Repo structure (consumer relevant)

Only a few folders matter when you embed RADF into your app:

- `core/dashboard/` — Provider, reducer, selectors, hooks
- `core/query/` — QuerySpec, hashing, caching, `useQuery`, DataProvider contract
- `core/viz/` — `VizRenderer` + registered chart panels
- `core/layout/` — Grid, panel chrome, loading/empty/error states
- `styles/` — tokens, themes, and component CSS

---

## License

TBD (MIT recommended if open source)
