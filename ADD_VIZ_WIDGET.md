## Add a new viz/widget to LADF + Lazy Dashboards

This is a practical checklist for adding a new visualization end to end.
It assumes you are adding a new viz component in LADF and exposing it in the
Lazy Dashboards composer. This excludes one-off demos (e.g. `current_sprint/kpi-redesign.html`).

---

### LADF

1) Create the viz component
- Add a new file in `src/framework/core/viz/charts/`, for example:
  - `src/framework/core/viz/charts/MyNewViz.jsx`
- Follow the existing panel pattern (see `LineChartPanel.jsx`, `KpiVariant.jsx`).
- Keep styling on CSS variables (tokenized theme values).

Example skeleton:
```jsx
// src/framework/core/viz/charts/MyNewViz.jsx
import React from 'react';

function MyNewViz({ data = [], encodings = {}, options = {}, panelConfig = null }) {
  return (
    <div className="ladf-my-new-viz">
      {/* render using tokenized styles */}
    </div>
  );
}

export default MyNewViz;
```

2) Register the viz in the registry
- Update `src/framework/core/registry/registerCharts.js`:
  - `import MyNewViz from '../viz/charts/MyNewViz.jsx';`
  - `registerViz('myNewViz', MyNewViz);`

3) Palette behavior (if text-only)
- If the viz is text-only (like KPI), add it to:
  - `src/framework/core/viz/palettes/paletteResolver.js` (TEXT_VIZ_TYPES)
  - `src/framework/core/viz/palettes/colorAssignment.js` (TEXT_VIZ_TYPES)

4) Styles
- If you need new CSS, add to:
  - `src/framework/styles/components/charts.css`
  - Keep class names aligned with the component and use CSS variables.

5) Tests (recommended)
- Add/extend tests under:
  - `src/framework/__tests__/viz/`
- Example pattern: `KpiPanel.test.jsx`

6) Optional docs
- If you maintain docs, update:
  - `README.md` or `visual_overview.md`

---

### Lazy Dashboards (Composer)
Paths below are relative to the Lazy Dashboards repo root.

1) Add manifest entry
- Update `lazy-dashboards/src/authoring/vizManifest.js`
- Define encodings and options so the editor can render the form.

Example manifest entry:
```js
myNewViz: {
  id: 'myNewViz',
  label: 'My New Viz',
  panelType: 'viz',
  supportLevel: 'supported',
  description: 'Short description.',
  encodings: {
    required: [
      { id: 'value', label: 'Value', role: 'metric' },
    ],
    optional: [],
  },
  options: {
    variant: {
      type: 'enum',
      label: 'Variant',
      options: ['standard', 'alt'],
      default: 'standard',
    },
  },
},
```

2) Add option coverage entries
- Update `lazy-dashboards/src/authoring/optionCoverageMatrix.json`
- Include every supported option path for the viz.
- This keeps `manifestValidation` green.

3) Default layout sizing
- Update `lazy-dashboards/src/authoring/authoringModel.js`
- Add to `DEFAULT_LAYOUTS_BY_TYPE`:
  - `myNewViz: { w: 4, h: 2 }`

4) Template bindings (optional but recommended)
- Update `lazy-dashboards/src/data/dashboardTemplates.js`
  - `applyBindingsToWidget` should set sensible defaults for new viz encodings.
  - Add template preview blocks if you want it to show in template previews.

5) Editor UX (only if special behavior)
- If the viz should hide the panel header or be chromeless:
  - `lazy-dashboards/src/components/editor/GridCanvas.jsx`
  - `lazy-dashboards/src/data/dashboardExport.js`

6) Validation
- Required encodings are validated automatically via the manifest:
  - `lazy-dashboards/src/authoring/validation.js`

7) Tests (recommended)
- Manifest coverage test:
  - `lazy-dashboards/src/__tests__/manifestValidation.test.js`
- Add or update compiler/editor tests if needed.

---

### Common gotchas
- Make sure the viz type id matches everywhere:
  - LADF registry id
  - Composer manifest id
  - Any template or compiler references
- If the viz is text-only, opt out of palette assignment.
- Keep CSS tied to variables so light/dark themes stay correct.

---

### Minimal checklist
- LADF: component + register + palettes (if needed) + styles
- Composer: manifest + option coverage + default layout + template bindings
- Preview/export: special header/chromeless logic if needed
