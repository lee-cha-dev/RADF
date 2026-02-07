**Goal**:
```text
We need to create a new part of this project.

It will be a codeless dashboard creation web application.

It will allow the user to drop in a csv/excel file (like powerbi does) and then it will allow them to choose their metrics, dimensions, and build a dashboard that will be rendered live (using RADF) as they choose to add widgets.

This is possible due to the dashboards being created using ONLY config. Note that the user may not need metrics, dimensions, or dataset since they can also just reference the data directly by the column name within the dashboardname.dashboard.js. 

They should still have the option to build these out in case they want specific dimensions, metrics, etc. that are derived from the csv file.

The user should also be able to specify the API that is pulling the data so that a data provider can be generated.

Once completed, the user should be able to export the dashboard. This will create a zip file containing:
- DashboardName/
-- deps/
--- dashboardName.dashboard.js
--- dashboardName.dataset.js
--- dashboardName.dimensions.js
--- dashboardName.metrics.js
-- utils/
--- items just as filter bars is they choose to use one.
-- DashboardName.jsx

This way the user can QUICKLY & EFFICIENTLY spin up a dashboard (it should be created/edited (the files) in real time as they choose and save their options. So, when they press export it saves again and then export the code that REMAINS in a "/CustomDashboards/" directory. 

The user should be able to choose to delete dashboards. They should also have a "dashboards" UI/UX that they see when it opens initially. Which should list all of their created dashboards, allowing them to select them: [delete, edit, export] or double click to open the dashboard editor.

We will need to review EACH OF THE VIZ/other components that take the json config in from the RADF framework to ensure that THE COMPLETE SET OF POSSIBLE CHOICES ARE REPRESENTED IN THE DASHBOARD EDITOR. This will be important due to the sheer NUMBER of possible choices. Having drop downs available based on the widge you are adding/editing on the dashboard will be important since the ui will be handling remembering this.

You should use the themes that are already in place for this dashboard editor. The name of this will be "Lazy Dashboards". It will have light/dark settings & will allow the user to switch to ANY of the themes/palettes that are available via settings menu/sidebar.

It is important to follow good js/react rules. 

There should be an interface component, child components, hooks, stylesheets, etc.
This should follow the same conventions as RADF: no inline styles, no css libraries such as tailwindcss, etc.
This should be separate from the RADF, and should use the package.json to import the RADF library (as seen in the README.md).
This way it can be ran on a server separate from the library as a standalone tool.
---
```

## feature/project_scaffold_lazy_dashboards_app

* Create `examples/lazy-dashboards/` (or similar) with its own `package.json`, Vite config, lint config alignment, and build scripts.
* Ensure it can import RADF via workspace/local path like the other example apps.
* App shell + routing:

    * `/` → Dashboard Library
    * `/editor/:dashboardId` → Dashboard Editor
    * `/settings` (optional) or settings as sidebar modal
* Standardize theme/palette consumption:

    * Use RADF’s existing theme + palette mechanism (no custom divergence).
    * Ensure light/dark and theme switching is global and persists.

---

## feature/local_persistence_and_dashboard_registry

* Implement a local “dashboard registry” backing store:

    * Local filesystem in browser context = IndexedDB or LocalStorage (IndexedDB recommended for larger content).
    * Store:

        * dashboard metadata (id, name, createdAt, updatedAt)
        * authoring model (JSON)
        * compiled runtime config output (optional cache)
        * dataset binding info (csv/xlsx source or external provider config)
* Support CRUD operations:

    * Create dashboard (from blank or from template)
    * Rename
    * Duplicate
    * Delete (with confirmation)
    * Update timestamps on save
* Ensure future-proofing:

    * Store `schemaVersion` in the authoring model for migrations later.

---

## feature/dashboard_library_home_ui

* Initial landing “Dashboards” UI:

    * Card/list view of created dashboards
    * Actions per item: **Edit**, **Export**, **Delete**
    * Double-click opens editor
    * Search + sort (by name, updated)
* Empty state:

    * “Create Dashboard” CTA
    * “Import dataset to start” CTA
* Optional templates:

    * “KPI starter”, “OT sample”, etc. (even if mocked initially)

---

## feature_authoring_model_and_compiler_pipeline

**This is the spine that makes everything manageable.**

* Define an internal **Authoring Model** (editor-friendly JSON):

    * stable widget IDs
    * layout grid positions
    * widget type + binding data
    * widget-specific options in a normalized form
    * dataset binding reference
    * “draft vs valid” state
* Implement a compiler:

    * `authoringModel -> radf dashboard config (runtime)`
    * Generates:

        * `dashboardName.dashboard.js`
        * optional `dataset/metrics/dimensions` modules if enabled
* Validation layer:

    * validate required fields for each widget
    * surface validation errors in the editor UI (field-level)

---

## feature/viz_capabilities_manifest_system

* For each supported RADF widget/viz panel type, define a **capabilities manifest**:

    * required encodings (x/y/value/etc.)
    * optional encodings (color/size/group)
    * options schema:

        * type (bool, number, enum, string)
        * defaults
        * constraints (min/max, allowed values)
        * conditional visibility rules (show only if X enabled)
        * “advanced” flag
    * human labels + help text
* Editor uses manifest to generate property panels dynamically.
* Make manifest versioned and co-located with viz registration logic where possible.
* Start with a limited set:

    * KPI, Table, Bar, Line, Bullet, FilterBar
    * Expand later without rewriting UI.

---

## feature/dataset_import_csv_xlsx

* File drop zone + picker:

    * CSV import
    * XLSX import (first sheet default; allow selecting sheet)
* Parse + normalize data into row objects:

    * stable column names (sanitize headers)
    * handle empty headers / duplicates
    * preview first N rows
* Store imported dataset:

    * Persist raw file bytes? (optional)
    * Persist parsed rows? (likely needed for offline editing)
    * Persist inferred schema stats (see next feature)
* Constraints:

    * Large file handling (limit, warn, sample mode)
    * Memory/perf guardrails

---

## feature/schema_inference_and_field_profiling

* After import, infer per-column metadata:

    * inferred type: number/date/string/bool
    * null %, distinct count, min/max, sample values
    * recommended role: metric vs dimension
* UI:

    * “Fields” panel showing all columns with badges (type, role)
    * allow overriding type/role
    * allow renaming fields (affects export)
* Add coercion rules:

    * numeric parsing (commas, currency, percentages)
    * date parsing (common formats)
* Save inference results into dataset module metadata.

---

## feature/semantic_layer_optional_metrics_dimensions

* Provide optional derived definitions:

    * dimensions: mapped from columns, plus derived categorical bucketing (future)
    * metrics: sum/avg/count/min/max from numeric columns
* UI:

    * “Simple mode”: reference raw columns directly
    * “Semantic mode”: define metrics/dimensions explicitly
    * Toggle per-dashboard (or per dataset)
* Output generation:

    * `dashboardName.metrics.js`
    * `dashboardName.dimensions.js`
    * `dashboardName.dataset.js`
* Ensure the dashboard config can use either:

    * direct column references
    * or semantic references

---

## feature/dashboard_editor_canvas_and_grid_layout

* The editor core:

    * canvas grid with drag/resize widgets
    * add widget flow (picker)
    * select widget → property panel updates
    * multi-select optional later
* Layout model:

    * match RADF’s `layout: {x,y,w,h}` grid model
    * keep collisions rules consistent
* Save behavior:

    * auto-save debounce
    * explicit Save button optional but “autosave” should be real

---

## feature/widget_add_edit_remove_flow

* “Add widget” modal:

    * shows available viz types (from manifest registry)
    * shows prerequisites (needs dataset? needs x/y?)
* Widget lifecycle:

    * create with defaults from manifest
    * edit properties in right panel
    * delete widget (confirmation optional)
* UX considerations:

    * show validation warnings inline
    * don’t block preview render unless config is truly invalid (show error state panels)

---

## feature/live_preview_rendering_via_radf

* Center panel renders the compiled RADF dashboard config live.
* Must support:

    * smooth updates on edits
    * error boundary around preview (never crash editor)
    * “empty state” if no widgets
* Theme/palette preview:

    * settings side panel toggles theme and palette and updates preview instantly
* Performance:

    * compile debounce (don’t rebuild on every keystroke)
    * memoization for dataset transforms

---

## feature/filterbar_and_interactions_basic

* If user adds a FilterBar widget:

    * allow selecting filterable fields
    * generate needed utils in `/utils/` during export
* Hook up filter state:

    * global filter context for the dashboard preview
    * widgets respond to filters
* Considerations:

    * keep it aligned with RADF’s existing filter conventions
    * avoid custom forked logic inside Lazy Dashboards

---

## feature/external_api_provider_config_and_generator

* UI to specify a data source that is not file-based:

    * base URL
    * method (v1: GET only)
    * headers / query params
    * response path selector (e.g., `data.items`)
    * refresh interval (optional)
* Generate a data provider module compatible with RADF.
* Considerations:

    * CORS messaging (user education)
    * safe storage of headers (don’t pretend secrets are safe in browser)
    * allow switching between local file dataset and api dataset

---

## feature/export_zip_and_customdashboards_directory_sync

* Export creates a zip containing:

    * `DashboardName/`

        * `deps/`

            * `dashboardName.dashboard.js`
            * `dashboardName.dataset.js`
            * `dashboardName.dimensions.js`
            * `dashboardName.metrics.js`
        * `utils/`

            * filter utils if enabled
        * `DashboardName.jsx`

* Also maintain a local working output directory:

    * `/CustomDashboards/<DashboardName>/...`
    * Update in real time as user edits (compile + write)

* Considerations:

    * browser app cannot write to filesystem directly unless using File System Access API
    * if running in Node/Electron/desktop wrapper, direct writes are easy
    * decide “web-only” vs “desktop-capable”:

        * web-only: export zip is primary “write”
        * desktop: keep `/CustomDashboards/` always synced

---

## feature/dashboard_delete_and_cleanup

* Delete from library:

    * removes registry entry
    * removes authoring model + dataset bindings
    * removes compiled output cache
    * if syncing to `/CustomDashboards/`, deletes directory too
* Confirmations + undo option (optional)

---

## feature/theme_palette_settings_menu

* Settings sidebar:

    * light/dark toggle (default to system, persist override)
    * theme selection from RADF theme registry
    * palette selection (if separate concept)
* Ensure this matches existing RADF behavior:

    * no new theme system invented
* Persist settings globally for Lazy Dashboards app.

---

## feature/option_coverage_audit_and_editor_parity

* Inventory all RADF viz components and their config options.
* For each viz type:

    * ensure manifest includes all supported options
    * mark advanced/rare ones accordingly
* Provide “expert mode” escape hatch:

    * raw JSON editor for a widget (optional)
    * shows compiled config for transparency
* Considerations:

    * avoid blocking v1 on total parity
    * enforce parity for the “supported widget set” first

---

## feature/error_states_validation_and_guardrails

* Editor must never hard crash due to bad config.
* Implement:

    * per-widget validation messages
    * preview error boundary rendering a friendly panel
    * warnings for huge datasets, unsupported types, etc.
* Import errors:

    * malformed CSV, empty file, inconsistent rows

---

## feature/templates_and_starters

* Provide “starter dashboards”:

    * basic KPI + bar + table layout
    * auto-bind fields based on schema inference
* Helps users get value in 30 seconds.

---

## feature/testing_and_release_hardening

* Tests:

    * schema inference unit tests
    * compiler output snapshot tests
    * manifest validation tests
* Lint + build pipelines aligned with RADF.
* Export zip correctness verification.

---

### Recommended “knockout order” (fastest path to a demo)

1. `feature/project_scaffold_lazy_dashboards_app`
2. `feature/local_persistence_and_dashboard_registry` + `feature/dashboard_library_home_ui`
3. `feature/dataset_import_csv_xlsx` + `feature/schema_inference_and_field_profiling`
4. `feature_authoring_model_and_compiler_pipeline`
5. `feature/viz_capabilities_manifest_system` (KPI + Bar first)
6. `feature/dashboard_editor_canvas_and_grid_layout` + `feature/live_preview_rendering_via_radf`
7. `feature/export_zip_and_customdashboards_directory_sync`