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

## Forking & Extending RADF

If you want to fork RADF, extend the framework, or contribute changes back, start with:

- [docs/FORKING.md](docs/FORKING.md) — fork workflow, local setup, and validating a fork in a consumer app.
- [docs/EXTENDING.md](docs/EXTENDING.md) — adding dashboards, panels, viz types, insights, providers, and themes.
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — scripts, tests, and contributor hygiene.

## Themes

### Built-in Themes

RADF includes 12 professionally designed themes, each available in both light and dark variants:

#### Default Themes
- **`radf-theme-light`** / **`radf-theme-dark`** - Clean, modern default theme with blue accents

#### Additional Themes
- **`radf-theme-nord-light`** / **`radf-theme-nord-dark`** - Arctic-inspired with cool blues and muted colors
- **`radf-theme-dracula-light`** / **`radf-theme-dracula-dark`** - High-contrast purple and pink theme, popular in developer tools
- **`radf-theme-solarized-light`** / **`radf-theme-solarized-dark`** - Precision colors for readability with warm earth tones
- **`radf-theme-monokai-light`** / **`radf-theme-monokai-dark`** - Vibrant, high contrast with cyan and pink accents
- **`radf-theme-gruvbox-light`** / **`radf-theme-gruvbox-dark`** - Warm, retro aesthetic with earthy browns and greens
- **`radf-theme-material-light`** / **`radf-theme-material-dark`** - Google's Material Design color palette
- **`radf-theme-one-light`** / **`radf-theme-one-dark`** - Atom editor's balanced color scheme
- **`radf-theme-tokyo-light`** / **`radf-theme-tokyo-dark`** - Modern Japanese-inspired with purple and blue tones
- **`radf-theme-catppuccin-light`** / **`radf-theme-catppuccin-dark`** - Pastel colors with soft, cozy aesthetics
- **`radf-theme-horizon-light`** / **`radf-theme-horizon-dark`** - Warm pink-tinted with cyan and magenta accents

### Applying Themes

RADF themes are applied by adding a root class to `document.documentElement`. Here's how to toggle between themes:

```jsx
const THEMES = {
  light: 'radf-theme-light',
  dark: 'radf-theme-dark',
  nordLight: 'radf-theme-nord-light',
  nordDark: 'radf-theme-nord-dark',
  draculaDark: 'radf-theme-dracula-dark',
  tokyoDark: 'radf-theme-tokyo-dark',
  // ... add other themes as needed
};

const [currentTheme, setCurrentTheme] = useState('light');

useEffect(() => {
  const root = document.documentElement;
  // Remove all theme classes
  Object.values(THEMES).forEach(theme => root.classList.remove(theme));
  // Add the current theme
  root.classList.add(THEMES[currentTheme]);
}, [currentTheme]);
```

### Theme Palette and CSS Variables

All RADF themes use a consistent set of CSS custom properties (variables) that components reference. This allows themes to be swapped without changing component code. The palette structure is:

#### Surface Colors
```css
--radf-surface-bg        /* Main background */
--radf-surface-1         /* Primary surface (cards, panels) */
--radf-surface-2         /* Secondary surface (nested elements) */
--radf-surface-3         /* Tertiary surface */
--radf-surface-well      /* Recessed areas */
--radf-surface-overlay   /* Modals, popovers */
--radf-surface-muted     /* Muted backgrounds */
```

#### Border Colors
```css
--radf-border-subtle     /* Light borders */
--radf-border-strong     /* Emphasized borders */
--radf-border-divider    /* Section dividers */
--radf-border-focus      /* Focus states */
```

#### Text Colors
```css
--radf-text-primary      /* Main text */
--radf-text-secondary    /* Secondary text */
--radf-text-muted        /* De-emphasized text */
--radf-text-inverse      /* Text on dark backgrounds */
```

#### Accent Colors
```css
--radf-accent-primary      /* Primary brand color */
--radf-accent-secondary    /* Secondary brand color */
--radf-accent-success      /* Success states */
--radf-accent-warning      /* Warning states */
--radf-accent-danger       /* Error/danger states */
--radf-accent-primary-soft /* Transparent primary (backgrounds) */
--radf-accent-secondary-soft /* Transparent secondary (backgrounds) */
```

#### Shadows & Gradients
```css
--radf-shadow-low          /* Subtle elevation */
--radf-shadow-med          /* Medium elevation */
--radf-shadow-high         /* High elevation */
--radf-shadow-inset        /* Inset shadows */
--radf-app-gradient        /* App background gradient */
--radf-panel-gradient      /* Panel background gradient */
--radf-panel-header-gradient /* Panel header gradient */
```

#### Semantic Aliases
```css
--radf-color-bg            /* Maps to surface-bg */
--radf-color-surface       /* Maps to surface-2 */
--radf-color-surface-alt   /* Maps to surface-1 */
--radf-color-text          /* Maps to text-primary */
--radf-color-muted         /* Maps to text-muted */
--radf-color-border        /* Maps to border-subtle */
--radf-color-accent        /* Maps to accent-primary */
--radf-color-accent-weak   /* Maps to accent-primary-soft */
```

### Creating Custom Themes

You can create your own themes by defining CSS variables in your app's stylesheet. Custom themes follow the naming convention `radf-theme-{name}-{light|dark}`:

**In your `app.css`:**

```css
:root.radf-theme-custom-dark {
  /* Surface colors */
  --radf-surface-bg: #1a1a2e;
  --radf-surface-1: #16213e;
  --radf-surface-2: #0f3460;
  --radf-surface-3: #533483;
  --radf-surface-well: #16213e;
  --radf-surface-overlay: #0f3460;
  --radf-surface-muted: #16213e;

  /* Border colors */
  --radf-border-subtle: #0f3460;
  --radf-border-strong: #533483;
  --radf-border-divider: #0f3460;
  --radf-border-focus: #e94560;

  /* Text colors */
  --radf-text-primary: #eaeaea;
  --radf-text-secondary: #d1d1d1;
  --radf-text-muted: #a8a8a8;
  --radf-text-inverse: #1a1a2e;

  /* Accent colors */
  --radf-accent-primary: #e94560;
  --radf-accent-secondary: #f39c12;
  --radf-accent-success: #2ecc71;
  --radf-accent-warning: #f39c12;
  --radf-accent-danger: #e74c3c;
  --radf-accent-primary-soft: rgba(233, 69, 96, 0.16);
  --radf-accent-secondary-soft: rgba(243, 156, 18, 0.16);

  /* Shadows */
  --radf-shadow-low: 0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(0, 0, 0, 0.4);
  --radf-shadow-med: 0 16px 32px rgba(0, 0, 0, 0.55), 0 6px 14px rgba(0, 0, 0, 0.4);
  --radf-shadow-high: 0 24px 50px rgba(0, 0, 0, 0.6), 0 10px 24px rgba(0, 0, 0, 0.45);
  --radf-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.04), inset 0 -1px 0 rgba(0, 0, 0, 0.4);

  /* Gradients */
  --radf-app-gradient: radial-gradient(circle at top, rgba(233, 69, 96, 0.1), transparent 55%),
    linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  --radf-panel-gradient: linear-gradient(180deg, #16213e 0%, #0f3460 100%);
  --radf-panel-header-gradient: linear-gradient(180deg, #0f3460 0%, #16213e 100%);

  /* Chart grid */
  --radf-chart-grid: rgba(168, 168, 168, 0.2);

  /* Semantic aliases (required) */
  --radf-color-bg: var(--radf-surface-bg);
  --radf-color-surface: var(--radf-surface-2);
  --radf-color-surface-alt: var(--radf-surface-1);
  --radf-color-text: var(--radf-text-primary);
  --radf-color-muted: var(--radf-text-muted);
  --radf-color-border: var(--radf-border-subtle);
  --radf-color-accent: var(--radf-accent-primary);
  --radf-color-accent-weak: var(--radf-accent-primary-soft);
}
```

**Then apply your custom theme:**

```jsx
useEffect(() => {
  document.documentElement.classList.add('radf-theme-custom-dark');
}, []);
```

**Important:** When creating custom themes, you must define all CSS variables listed above. The semantic aliases at the end are required for component compatibility.

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