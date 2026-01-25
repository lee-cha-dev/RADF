# RADF (Recharts Analytics Dashboard Framework)

RADF is a config-driven React framework for building analytic dashboards (KPIs, trends, breakdowns, and insights) with Recharts. It ships as a package you can install directly from Git and includes a single CSS entrypoint for tokens, themes, and component styles.

## Install

```bash
npm install radf@"git+https://github.com/lee-cha-dev/RADF.git"
```

## Include styles (required)

Import the RADF stylesheet once in your app entry (e.g. `main.jsx`):

```jsx
import 'radf/styles.css';
```

This single import includes tokens, themes, and component styles. CSS is required for layout, theming, and panel chrome.

## Minimal usage

```jsx
import React, { useEffect, useMemo } from 'react';
import {
  DashboardProvider,
  GridLayout,
  Panel,
  VizRenderer,
  buildQuerySpec,
  registerCharts,
  registerInsights,
  useDashboardState,
  useQuery,
  MockDataProvider,
} from 'radf';
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
      renderPanel={(panel) => <VizPanel key={panel.id} panel={panel} />}
    />
  </section>
);

const App = () => {
  useEffect(() => {
    registerCharts();
    registerInsights();
  }, []);

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
};

export default App;
```

### Theme toggling

RADF themes are applied by root classes. Add one of these classes to `document.documentElement`:

- `radf-theme-light`
- `radf-theme-dark`

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

## Consumer example

A runnable consumer app lives at `examples/consumer-app` and installs RADF via the Git dependency. It imports `radf/styles.css` and renders a dashboard using the public API.

## How to run tests

```bash
npm run lint
npm run test
npm run build:lib
npm run smoke:consumer
npm run test:css
```

`npm run test:css` builds the library, installs the packed tarball into the consumer app, starts Vite preview, and runs Playwright to assert computed styles are applied.

## Package surface

Public exports are available from the package root:

```js
import {
  DashboardProvider,
  GridLayout,
  Panel,
  VizRenderer,
  InsightsPanel,
  registerCharts,
  registerInsights,
  buildQuerySpec,
  useQuery,
  MockDataProvider,
} from 'radf';
```

Styles are available from:

```js
import 'radf/styles.css';
```

## Constraints

- JavaScript only (no TypeScript)
- No Tailwind
- No inline styles
- Recharts is the chart library
- CSS variables power tokens + themes
