# Next Sprint — Option B (Git Dependency) with Auto-Styles Included

Goal: RADF can be installed via git and used like:

```js
import { DashboardShell, registerCharts } from "radf-framework";
````

…and RADF styling is applied automatically (no separate CSS imports).

Constraints:

* JavaScript only.
* No inline styles in RADF source (CSS files are fine; packaging bundles them).
* Works as a git dependency: install triggers build and produces `dist/`.
* Default import includes styles. Period.

---

## feature/package-entry-with-auto-styles

### Goal

Create a single public entry that **auto-loads styles** as part of the import.

### Scope / Tasks

* Create `src/framework/public/index.js` (or `src/framework/index.js`) that:

  * imports the framework stylesheet entry once (side-effect import)

    * `import "../styles/framework.entry.css";` (or similar)
  * exports the public API (provider, hooks, registry functions, model helpers, etc.)
* Ensure style import happens exactly once and is safe under bundling.
* Add clear JSDoc at top: “Importing this module applies RADF styles automatically.”

### Files

* New/Update: `src/framework/index.js`
* New: `src/framework/styles/framework.entry.css` (see next feature)

### Acceptance Criteria

* Consumer import of `"radf-framework"` applies RADF base CSS automatically.
* No separate style import required.

---

## feature/package-css-entry-and-ordering

### Goal

Define the single authoritative CSS entry (correct import order) used by the library build.

### Scope / Tasks

* Create `src/framework/styles/framework.entry.css` that imports in order:

  * `tokens.css`
  * `palettes.css`
  * `framework.css`
  * `components/*.css` (charts, filters, grid, insights, panel, table)
  * theme defaults (light + dark) OR pick a default theme class behavior
* Ensure theme class naming is consistent (`radf-theme-*`).

### Files

* New: `src/framework/styles/framework.entry.css`
* Existing: `src/styles/**` (may reference/move or import from there)

### Acceptance Criteria

* One CSS entry defines *all* RADF styling in deterministic order.
* Importing framework entry module results in styles present.

---

## feature/package-build-library-bundled-css

### Goal

Build RADF as a library where CSS is **bundled into the JS import**.

### Scope / Tasks

* Configure Vite library mode to build from `src/framework/index.js`.
* Ensure CSS is emitted and included via the JS import (side-effect import).

  * The bundler will either:

    * inline CSS into JS, or
    * emit a CSS asset but ensure it is referenced/loaded automatically by the JS bundle.
* Externalize peer deps:

  * `react`, `react-dom`, `react-router-dom`, `recharts`
* Add scripts:

  * `build:lib`

### Files

* `vite.config.js` (or `vite.lib.config.js`)
* `package.json` scripts

### Acceptance Criteria

* `npm run build:lib` generates a consumable `dist/` where importing the package applies styles.
* No duplicate React bundling.

---

## feature/package-exports-and-peers

### Goal

Make imports stable and correct for consumers installing via git.

### Scope / Tasks

* Update `package.json`:

  * `exports` maps `.` to the built entry:

    ```json
    "exports": {
      ".": "./dist/index.js"
    }
    ```
  * `peerDependencies` for react ecosystem + recharts
  * `files` whitelist to ship only `dist/**` (optional but recommended)
* Decide CJS support:

  * If you want it: build both ESM and CJS.
  * If not: ESM-only is fine for modern Vite/React apps.

### Files

* `package.json`

### Acceptance Criteria

* `import { ... } from "radf-framework"` works in a consumer Vite React app.
* React is peer dependency (prevents multi-React issues).

---

## feature/package-git-install-prepare

### Goal

Ensure git installs build automatically.

### Scope / Tasks

* Add `"prepare": "npm run build:lib"` to `package.json`.
* Verify it works when installed via:

  * `git+https://...#v0.1.0`

### Files

* `package.json`

### Acceptance Criteria

* `npm i` from git produces `dist/` automatically and is importable immediately.

---

## feature/public-api-curation

### Goal

Curate a high-signal public API so consumers don’t import internal paths.

### Scope / Tasks

* Create a stable export surface from `src/framework/index.js`:

  * Dashboard:

    * `DashboardProvider`, `useDashboardState`, `useDashboardActions`, `dashboardSelectors`
  * Query:

    * `useQuery`, `buildQuerySpec`, `DataProvider`
  * Registry:

    * `registerCharts`, `registerInsights`
  * Viz/Layout (only if intended for consumer composition):

    * `VizRenderer`, `GridLayout`, `Panel` (optional)
  * Model:

    * `createDataset`, `createDimension`, `createMetric`
* Add JSDoc comments for each export.

### Files

* `src/framework/index.js`

### Acceptance Criteria

* A consumer can build a dashboard without importing `src/framework/core/...`.

---

## feature/consumer-smoke-test

### Goal

Prove the actual workflow works end-to-end.

### Scope / Tasks

Do both for a comprehensive smoke test:

* Option A (fast): `scripts/smoke-consumer.mjs`

  * imports `radf-framework` from built output
  * asserts exported symbols exist
* Option B (best): add `examples/consumer-app/` Vite React app that depends on RADF via git or file path

  * renders a minimal dashboard
  * visually confirms styles loaded without extra imports

### Files

* `scripts/smoke-consumer.mjs` OR `examples/consumer-app/**`

### Acceptance Criteria

* Smoke test verifies **styles are present** without consumer CSS import.
* Prevent regressions in exports/build.

---

## feature/docs-option-b-auto-style

### Goal

Document the Option B “just import it” workflow.

### Scope / Tasks

* README section:

  * Install via git dependency
  * Required peer deps
  * Minimal code snippet (no CSS import)
  * Registry initialization
  * Theming (how to set `radf-theme-light/dark` on a wrapper)
* Troubleshooting:

  * “Styles not loading” (should be rare if this sprint is done right)
  * Duplicate React
  * Missing registry entries

### Files

* `README.md`

### Acceptance Criteria

* README matches the new reality: importing RADF includes styles.

---

# Suggested order

1. `feature/package-css-entry-and-ordering`
2. `feature/package-entry-with-auto-styles`
3. `feature/package-build-library-bundled-css`
4. `feature/package-exports-and-peers`
5. `feature/package-git-install-prepare`
6. `feature/public-api-curation`
7. `feature/consumer-smoke-test`
8. `feature/docs-option-b-auto-style`

---

# Definition of Done

* Consumer installs via git dependency and does **not** import CSS explicitly.
* Importing `radf-framework` applies RADF styles automatically.
* Public API is stable and documented.
* Build outputs in `dist/` are correct and React is peer dependency.
