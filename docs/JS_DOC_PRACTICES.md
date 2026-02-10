# JavaScript Documentation Practices

This guide captures practical, widely-used JSDoc patterns for documenting a JavaScript codebase with ESM modules, ESLint, and `// @ts-check`-driven typing.

## When to write docs

- Document all exported functions, components, hooks, and contexts.
- Document config objects expected by users (schemas, options, registry entries).
- Explain non-obvious algorithms, invariants, and edge cases.
- Avoid noise on trivial getters and obvious one-liners.
- Document internal helpers lightly when they hide complexity or risk.

## JSDoc fundamentals

If `eslint-plugin-jsdoc` is enabled, follow its required tags and description rules to keep docs lint-clean.

### Basic function docs

```js
/**
 * Formats a display label for a dashboard title.
 *
 * @param {string} title - The title to format.
 * @param {string} [fallback='Untitled'] - The fallback label.
 * @returns {string} The formatted label.
 */
export const formatTitle = (title, fallback = 'Untitled') =>
  title?.trim() || fallback;
```

### Async functions

```js
/**
 * Loads dashboard metadata from the API.
 *
 * @param {string} dashboardId - The dashboard id to load.
 * @returns {Promise<Object>} The dashboard payload.
 * @throws {Error} When the request fails.
 */
export const fetchDashboard = async (dashboardId) => {
  const response = await fetch(`/api/dashboards/${dashboardId}`);
  if (!response.ok) {
    throw new Error('Failed to load dashboard');
  }
  return response.json();
};
```

### Optional params and defaults

```js
/**
 * Builds a URL for a dataset export.
 *
 * @param {string} datasetId - The dataset id.
 * @param {Object} [options] - The export options.
 * @param {string} [options.format='csv'] - The export format.
 * @param {boolean} [options.includeHeaders=true] - The header flag.
 * @returns {string} The export URL.
 */
export const buildExportUrl = (datasetId, options = {}) => {
  const { format = 'csv', includeHeaders = true } = options;
  return `/api/datasets/${datasetId}/export?format=${format}&headers=${includeHeaders}`;
};
```

### Union types, arrays, and generics

```js
/**
 * Coerces a filter value into a list.
 *
 * @param {string|string[]|number[]} value - The incoming filter value.
 * @returns {Array<string|number>} The normalized list.
 */
export const normalizeFilterValues = (value) =>
  Array.isArray(value) ? value : [value];
```

```js
/**
 * Indexes records by a stable key.
 *
 * @template T
 * @template K
 * @param {T[]} items - The items to index.
 * @param {function(T): K} getKey - The key selector.
 * @returns {Map<K, T>} The items indexed by key.
 */
export const indexBy = (items, getKey) =>
  new Map(items.map((item) => [getKey(item), item]));
```

### Documenting callbacks and signatures

```js
/**
 * @callback LoadDashboardsCallback
 * @param {Error|null} error - The error, if any.
 * @param {Object[]} [result] - The loaded dashboards.
 * @returns {void}
 */

/**
 * Fetches dashboards and invokes a callback with results.
 *
 * @param {LoadDashboardsCallback} done - The completion callback.
 * @returns {void}
 */
export const loadDashboards = (done) => {
  fetch('/api/dashboards')
    .then((response) => response.json())
    .then((data) => done(null, data))
    .catch((error) => done(error));
};
```

### Using @throws only when actually thrown

```js
/**
 * Parses a JSON payload with strict validation.
 *
 * @param {string} payload - The JSON string payload.
 * @returns {Object} The parsed value.
 * @throws {SyntaxError} When the payload is not valid JSON.
 */
export const parsePayload = (payload) => JSON.parse(payload);
```

### @example formatting

```js
/**
 * Builds a query spec for a panel.
 *
 * @param {Object} panelConfig - The panel configuration.
 * @returns {Object} The query spec.
 *
 * @example
 * import { buildQuerySpec } from './query/buildQuerySpec.js';
 *
 * const spec = buildQuerySpec({ id: 'sales', query: { measures: ['revenue'] } });
 * console.log(spec.measures);
 */
export const buildQuerySpec = (panelConfig) => ({
  ...panelConfig.query,
});
```

### @deprecated and @see

Use `@deprecated` when a public API is actively replaced, and point callers to the new path with `@see`.

```js
/**
 * Resolves the legacy panel schema.
 *
 * @deprecated Use {@link resolvePanelSchema} instead.
 * @see resolvePanelSchema
 * @param {Object} panelConfig - The legacy panel config.
 * @returns {Object} The normalized schema.
 */
export const resolveLegacySchema = (panelConfig) => normalize(panelConfig);
```

## JS typing via JSDoc

### `// @ts-check` guidance

Enable `// @ts-check` at the top of files with stable, well-typed boundaries. Avoid it in files that intentionally accept many dynamic shapes or large `any`-like payloads.

```js
// @ts-check

/**
 * @typedef {Object} DashboardConfig
 * @property {string} id - The dashboard id.
 * @property {string} title - The display title.
 */
export const buildDashboardConfig = (config) => config;
```

### @typedef + @property for object shapes

```js
/**
 * @typedef {Object} PanelConfig
 * @property {string} id - The panel id.
 * @property {string} title - The panel title.
 * @property {Object} query - The query definition.
 * @property {string[]} query.measures - The measure list.
 * @property {string[]} [query.dimensions] - The optional dimensions.
 */
```

### @type for constants and refs

```js
/**
 * @type {Map<string, Object>}
 */
export const dashboardCache = new Map();
```

Do not use `@satisfies`; it is TypeScript-only.

### React component prop typing via JSDoc (JSX-friendly)

```jsx
/**
 * @typedef {Object} DashboardHeaderProps
 * @property {string} title - The header title.
 * @property {() => void} onRefresh - The refresh handler.
 */

/**
 * Renders the dashboard header with a refresh control.
 *
 * @param {DashboardHeaderProps} props - The component props.
 * @returns {JSX.Element} The header markup.
 */
export const DashboardHeader = ({ title, onRefresh }) => (
  <header>
    <h1>{title}</h1>
    <button onClick={onRefresh}>Refresh</button>
  </header>
);
```

### Documenting events, handlers, and refs

```jsx
/**
 * Handles a primary button click.
 *
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
const handleClick = (event) => {
  event.preventDefault();
};

/**
 * @type {{ current: HTMLDivElement|null }}
 */
const containerRef = React.useRef(null);
```

## React-specific documentation (JS + JSX)

- Document props, side effects, data dependencies, and assumptions for exported components.
- For hooks, describe expected inputs, dependencies, and return shapes (tuple/object).
- For context providers and custom hooks, document the contract and include a short example.
- Avoid repeating obvious JSX markup descriptions.

```js
/**
 * Provides dashboard state and actions to descendants.
 *
 * @param {{ children: React.ReactNode }} props - The provider props.
 * @returns {JSX.Element} The provider wrapper.
 */
export const DashboardProvider = ({ children }) => (
  <DashboardContext.Provider value={{}}>
    {children}
  </DashboardContext.Provider>
);
```

```js
/**
 * @typedef {Object} DashboardState
 * @property {string|null} dashboardId - The active dashboard id.
 * @property {Object[]} globalFilters - The global filters.
 */

/**
 * Reads dashboard state from context.
 *
 * @returns {DashboardState} The current dashboard state.
 * @throws {Error} When used outside the provider.
 */
export const useDashboardState = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardState must be used within a DashboardProvider');
  }
  return context;
};
```

## Error handling + invariants docs

- Spell out invariants that must hold before calling a function.
- Document errors that can occur and how callers should handle them.
- Describe empty/error-state contracts (nulls, empty arrays, fallbacks).

```js
/**
 * Calculates selection summaries.
 *
 * Invariant: `selections` is always an array (default to empty).
 *
 * @param {Object[]} selections - The selection list.
 * @returns {Object[]} The summaries (empty when no selections).
 */
export const summarizeSelections = (selections) =>
  selections.map((selection) => ({ id: selection.id }));
```

## Style and consistency rules

- Start param descriptions with "The ...".
- Match param names and order to the function signature.
- Keep docs aligned with behavior; update docs when logic changes.
- Keep examples runnable or clearly marked as pseudo.
- Place docs immediately above the symbol they describe.

## Copy/Paste Templates

### Exported function

```js
/**
 * Does one clear thing for callers.
 *
 * @param {string} id - The identifier to use.
 * @param {Object} [options] - The optional settings.
 * @returns {Object} The created result.
 * @throws {Error} When the input is invalid.
 */
export const createThing = (id, options) => ({ id, ...options });
```

### Config typedef

```js
/**
 * @typedef {Object} WidgetConfig
 * @property {string} id - The widget id.
 * @property {string} title - The display title.
 * @property {Object} query - The data query definition.
 */
```

### React component

```jsx
/**
 * @typedef {Object} WidgetProps
 * @property {WidgetConfig} config - The widget configuration.
 * @property {() => void} onRemove - The remove handler.
 */

/**
 * Renders a dashboard widget.
 *
 * @param {WidgetProps} props - The component props.
 * @returns {JSX.Element} The widget markup.
 */
export const Widget = ({ config, onRemove }) => (
  <section>
    <h2>{config.title}</h2>
    <button onClick={onRemove}>Remove</button>
  </section>
);
```

### Custom hook

```js
/**
 * @typedef {function(string|null): void} DashboardIdSetter
 */

/**
 * Returns the active dashboard id and setter.
 *
 * @returns {[string|null, DashboardIdSetter]} The dashboard id tuple.
 */
export const useDashboardId = () => {
  const [dashboardId, setDashboardId] = React.useState(null);
  return [dashboardId, setDashboardId];
};
```

### Registry/plug-in registration

```js
/**
 * @typedef {Object} WidgetDefinition
 * @property {string} id - The unique widget id.
 * @property {function(Object): JSX.Element} render - The render function.
 */

/**
 * Registers a widget with the registry.
 *
 * @param {WidgetDefinition} definition - The widget to register.
 * @returns {void}
 */
export const registerWidget = (definition) => {
  widgetRegistry.set(definition.id, definition);
};
```

## Review checklist (PRs)

- Are all exported APIs documented with accurate @param/@returns?
- Are config shapes and object literals defined with @typedef/@property?
- Do docs mention invariants, errors, and empty-state behavior?
- Are examples runnable and aligned with current code?
- Are internal helpers documented lightly (not excessively)?
