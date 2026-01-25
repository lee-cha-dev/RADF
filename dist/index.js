import Tr, { createContext as we, useReducer as Sa, useMemo as A, useContext as Ee, useRef as ja, useState as Se, useCallback as je, useEffect as Re } from "react";
import { ResponsiveContainer as Ne, LineChart as Ra, CartesianGrid as ke, XAxis as Te, YAxis as De, Tooltip as Pe, Line as Na, Brush as ka, BarChart as Ta, Bar as ne, Cell as Da } from "recharts";
const Pa = `/* ---- tokens.css ---- */
:root {
  --radf-font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  --radf-font-size-base: 16px;
  --radf-font-weight-semibold: 600;
  --radf-font-weight-bold: 700;
  --radf-line-height: 1.5;

  --radf-space-1: 4px;
  --radf-space-2: 8px;
  --radf-space-3: 12px;
  --radf-space-4: 16px;
  --radf-space-5: 20px;
  --radf-space-6: 24px;
  --radf-space-7: 28px;
  --radf-space-8: 32px;

  --radf-radius-sm: 6px;
  --radf-radius-md: 10px;
  --radf-radius-lg: 16px;

  --radf-focus-ring-size: 3px;
  --radf-focus-ring-offset: 2px;
}


/* ---- palettes.css ---- */
:root.radf-palette-analytics,
.radf-palette-analytics {
  --radf-series-1: #4e79a7;
  --radf-series-2: #f28e2b;
  --radf-series-3: #e15759;
  --radf-series-4: #76b7b2;
  --radf-series-5: #59a14f;
  --radf-series-6: #edc949;
  --radf-series-7: #af7aa1;
  --radf-series-8: #ff9da7;
  --radf-series-9: #9c755f;
  --radf-series-10: #bab0ab;
  --radf-series-11: #7f86b7;
  --radf-series-12: #1f77b4;
  --radf-seq-1: #f7fbff;
  --radf-seq-2: #deebf7;
  --radf-seq-3: #c6dbef;
  --radf-seq-4: #9ecae1;
  --radf-seq-5: #6baed6;
  --radf-seq-6: #4292c6;
  --radf-seq-7: #2171b5;
  --radf-seq-8: #08519c;
  --radf-seq-9: #08306b;
  --radf-div-neg-4: #a50026;
  --radf-div-neg-3: #d73027;
  --radf-div-neg-2: #f46d43;
  --radf-div-neg-1: #fdae61;
  --radf-div-zero: #ffffbf;
  --radf-div-pos-1: #d9ef8b;
  --radf-div-pos-2: #a6d96a;
  --radf-div-pos-3: #66bd63;
  --radf-div-pos-4: #1a9850;
}

:root.radf-palette-tableau10,
.radf-palette-tableau10 {
  --radf-series-1: #4e79a7;
  --radf-series-2: #f28e2b;
  --radf-series-3: #e15759;
  --radf-series-4: #76b7b2;
  --radf-series-5: #59a14f;
  --radf-series-6: #edc949;
  --radf-series-7: #af7aa1;
  --radf-series-8: #ff9da7;
  --radf-series-9: #9c755f;
  --radf-series-10: #bab0ab;
  --radf-series-11: #86bc86;
  --radf-series-12: #d4a6c8;
  --radf-seq-1: #f7fbff;
  --radf-seq-2: #deebf7;
  --radf-seq-3: #c6dbef;
  --radf-seq-4: #9ecae1;
  --radf-seq-5: #6baed6;
  --radf-seq-6: #4292c6;
  --radf-seq-7: #2171b5;
  --radf-seq-8: #08519c;
  --radf-seq-9: #08306b;
  --radf-div-neg-4: #a50026;
  --radf-div-neg-3: #d73027;
  --radf-div-neg-2: #f46d43;
  --radf-div-neg-1: #fdae61;
  --radf-div-zero: #ffffbf;
  --radf-div-pos-1: #d9ef8b;
  --radf-div-pos-2: #a6d96a;
  --radf-div-pos-3: #66bd63;
  --radf-div-pos-4: #1a9850;
}

:root.radf-palette-set2,
.radf-palette-set2 {
  --radf-series-1: #66c2a5;
  --radf-series-2: #fc8d62;
  --radf-series-3: #8da0cb;
  --radf-series-4: #e78ac3;
  --radf-series-5: #a6d854;
  --radf-series-6: #ffd92f;
  --radf-series-7: #e5c494;
  --radf-series-8: #b3b3b3;
  --radf-series-9: #a6cee3;
  --radf-series-10: #1f78b4;
  --radf-series-11: #b2df8a;
  --radf-series-12: #33a02c;
  --radf-seq-1: #f7fcf5;
  --radf-seq-2: #e5f5e0;
  --radf-seq-3: #c7e9c0;
  --radf-seq-4: #a1d99b;
  --radf-seq-5: #74c476;
  --radf-seq-6: #41ab5d;
  --radf-seq-7: #238b45;
  --radf-seq-8: #006d2c;
  --radf-seq-9: #00441b;
  --radf-div-neg-4: #8c510a;
  --radf-div-neg-3: #bf812d;
  --radf-div-neg-2: #dfc27d;
  --radf-div-neg-1: #f6e8c3;
  --radf-div-zero: #f5f5f5;
  --radf-div-pos-1: #c7eae5;
  --radf-div-pos-2: #80cdc1;
  --radf-div-pos-3: #35978f;
  --radf-div-pos-4: #01665e;
}

:root.radf-palette-dark2,
.radf-palette-dark2 {
  --radf-series-1: #1b9e77;
  --radf-series-2: #d95f02;
  --radf-series-3: #7570b3;
  --radf-series-4: #e7298a;
  --radf-series-5: #66a61e;
  --radf-series-6: #e6ab02;
  --radf-series-7: #a6761d;
  --radf-series-8: #666666;
  --radf-series-9: #1f78b4;
  --radf-series-10: #b2df8a;
  --radf-series-11: #fb9a99;
  --radf-series-12: #cab2d6;
  --radf-seq-1: #f7fbff;
  --radf-seq-2: #deebf7;
  --radf-seq-3: #c6dbef;
  --radf-seq-4: #9ecae1;
  --radf-seq-5: #6baed6;
  --radf-seq-6: #4292c6;
  --radf-seq-7: #2171b5;
  --radf-seq-8: #08519c;
  --radf-seq-9: #08306b;
  --radf-div-neg-4: #b2182b;
  --radf-div-neg-3: #d6604d;
  --radf-div-neg-2: #f4a582;
  --radf-div-neg-1: #fddbc7;
  --radf-div-zero: #f7f7f7;
  --radf-div-pos-1: #d1e5f0;
  --radf-div-pos-2: #92c5de;
  --radf-div-pos-3: #4393c3;
  --radf-div-pos-4: #2166ac;
}

:root.radf-palette-okabe-ito,
.radf-palette-okabe-ito {
  --radf-series-1: #e69f00;
  --radf-series-2: #56b4e9;
  --radf-series-3: #009e73;
  --radf-series-4: #f0e442;
  --radf-series-5: #0072b2;
  --radf-series-6: #d55e00;
  --radf-series-7: #cc79a7;
  --radf-series-8: #000000;
  --radf-series-9: #999999;
  --radf-series-10: #bdbdbd;
  --radf-series-11: #80b1d3;
  --radf-series-12: #fdb462;
  --radf-seq-1: #f7fbff;
  --radf-seq-2: #deebf7;
  --radf-seq-3: #c6dbef;
  --radf-seq-4: #9ecae1;
  --radf-seq-5: #6baed6;
  --radf-seq-6: #4292c6;
  --radf-seq-7: #2171b5;
  --radf-seq-8: #08519c;
  --radf-seq-9: #08306b;
  --radf-div-neg-4: #8c510a;
  --radf-div-neg-3: #bf812d;
  --radf-div-neg-2: #dfc27d;
  --radf-div-neg-1: #f6e8c3;
  --radf-div-zero: #f5f5f5;
  --radf-div-pos-1: #c7eae5;
  --radf-div-pos-2: #80cdc1;
  --radf-div-pos-3: #35978f;
  --radf-div-pos-4: #01665e;
}

:root.radf-palette-viridis,
.radf-palette-viridis {
  --radf-series-1: #440154;
  --radf-series-2: #482878;
  --radf-series-3: #3e4989;
  --radf-series-4: #31688e;
  --radf-series-5: #26828e;
  --radf-series-6: #1f9e89;
  --radf-series-7: #35b779;
  --radf-series-8: #6ece58;
  --radf-series-9: #b5de2b;
  --radf-series-10: #fde725;
  --radf-series-11: #9bd93c;
  --radf-series-12: #2a788e;
  --radf-seq-1: #440154;
  --radf-seq-2: #482878;
  --radf-seq-3: #3e4989;
  --radf-seq-4: #31688e;
  --radf-seq-5: #26828e;
  --radf-seq-6: #1f9e89;
  --radf-seq-7: #35b779;
  --radf-seq-8: #6ece58;
  --radf-seq-9: #fde725;
  --radf-div-neg-4: #3b4cc0;
  --radf-div-neg-3: #688aef;
  --radf-div-neg-2: #9ecae1;
  --radf-div-neg-1: #dce7f1;
  --radf-div-zero: #f7f7f7;
  --radf-div-pos-1: #fde0b2;
  --radf-div-pos-2: #f9a65a;
  --radf-div-pos-3: #ed6a5a;
  --radf-div-pos-4: #b40426;
}

:root.radf-palette-rdylgn,
.radf-palette-rdylgn {
  --radf-series-1: #d73027;
  --radf-series-2: #fc8d59;
  --radf-series-3: #fee08b;
  --radf-series-4: #d9ef8b;
  --radf-series-5: #91cf60;
  --radf-series-6: #1a9850;
  --radf-series-7: #fdae61;
  --radf-series-8: #66bd63;
  --radf-series-9: #e0f3f8;
  --radf-series-10: #abdda4;
  --radf-series-11: #a50026;
  --radf-series-12: #006837;
  --radf-seq-1: #fff7ec;
  --radf-seq-2: #fee8c8;
  --radf-seq-3: #fdd49e;
  --radf-seq-4: #fdbb84;
  --radf-seq-5: #fc8d59;
  --radf-seq-6: #ef6548;
  --radf-seq-7: #d7301f;
  --radf-seq-8: #b30000;
  --radf-seq-9: #7f0000;
  --radf-div-neg-4: #a50026;
  --radf-div-neg-3: #d73027;
  --radf-div-neg-2: #f46d43;
  --radf-div-neg-1: #fdae61;
  --radf-div-zero: #ffffbf;
  --radf-div-pos-1: #d9ef8b;
  --radf-div-pos-2: #a6d96a;
  --radf-div-pos-3: #66bd63;
  --radf-div-pos-4: #1a9850;
}


/* ---- framework.css ---- */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--radf-font-family);
  font-size: var(--radf-font-size-base);
  line-height: var(--radf-line-height);
  background: var(--radf-app-gradient, var(--radf-color-bg));
  color: var(--radf-text-primary, var(--radf-color-text));
  min-height: 100vh;
}

::selection {
  background: var(--radf-accent-primary-soft, var(--radf-color-accent-weak));
  color: var(--radf-text-primary, var(--radf-color-text));
}

button,
input,
select,
textarea {
  font-family: inherit;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
.radf-button:focus-visible,
.radf-selection-chip:focus-visible,
.radf-filter-bar__chip:focus-visible,
.radf-filter-bar__button:focus-visible,
.radf-selection-bar__clear:focus-visible,
.radf-drill__crumb:focus-visible,
.radf-drill__reset:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--radf-focus-ring-size)
    var(--radf-border-focus, var(--radf-color-accent));
}

.radf-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-6);
}

.radf-app__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--radf-space-5) var(--radf-space-6);
  background: linear-gradient(180deg, var(--radf-surface-1), var(--radf-surface-2));
  border-bottom: 1px solid var(--radf-border-divider, var(--radf-color-border));
  box-shadow: var(--radf-shadow-low);
}

.radf-app__branding {
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-1);
}

.radf-app__title {
  font-weight: var(--radf-font-weight-bold);
  font-size: 1.35rem;
  letter-spacing: -0.01em;
}

.radf-app__subtitle {
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-size: 0.95rem;
}

.radf-app__content {
  padding: 0 var(--radf-space-6) var(--radf-space-8);
  width: 100%;
  margin: 0 auto;
}

.radf-button {
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  background: linear-gradient(180deg, var(--radf-surface-1), var(--radf-surface-2));
  color: var(--radf-text-primary, var(--radf-color-text));
  padding: var(--radf-space-2) var(--radf-space-4);
  border-radius: var(--radf-radius-md);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
    color 0.2s ease, background 0.2s ease;
  box-shadow: var(--radf-shadow-low);
}

.radf-button:hover {
  border-color: var(--radf-border-strong, var(--radf-color-border));
  transform: translateY(-1px);
  box-shadow: var(--radf-shadow-med);
}

.radf-button:active {
  transform: translateY(0);
  box-shadow: var(--radf-shadow-low);
}

.radf-button--primary {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--radf-accent-primary) 92%, #ffffff 8%),
    var(--radf-accent-primary)
  );
  color: var(--radf-text-inverse, #ffffff);
  border-color: transparent;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
}

.radf-button--primary:hover {
  color: var(--radf-text-inverse, #ffffff);
}

.radf-dashboard {
  background: linear-gradient(180deg, var(--radf-surface-1), var(--radf-surface-2));
  border-radius: var(--radf-radius-lg);
  padding: var(--radf-space-6);
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  box-shadow: var(--radf-shadow-high);
  position: relative;
}

.radf-dashboard::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--radf-shadow-inset);
  pointer-events: none;
}

.radf-dashboard__title {
  margin: 0 0 var(--radf-space-2);
  font-size: 1.75rem;
  font-weight: var(--radf-font-weight-bold);
  letter-spacing: -0.02em;
}

.radf-dashboard__subtitle {
  margin: 0;
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--radf-space-7);
  background: var(--radf-surface-1);
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  border-radius: var(--radf-radius-lg);
  box-shadow: var(--radf-shadow-med);
  min-height: 320px;
}

.radf-error-boundary__content {
  text-align: center;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-3);
}

.radf-error-boundary__title {
  margin: 0;
  font-size: 1.5rem;
}

.radf-error-boundary__message {
  margin: 0;
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-error-boundary__action {
  align-self: center;
}


/* ---- components/charts.css ---- */
.radf-chart {
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-3);
  width: 100%;
}

.radf-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--radf-space-3);
}

.radf-chart__heading {
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-1);
}

.radf-chart__title {
  margin: 0;
  font-weight: var(--radf-font-weight-semibold);
  color: var(--radf-text-secondary, var(--radf-color-text));
}

.radf-chart__subtitle {
  margin: 0;
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-size: 0.85rem;
}

.radf-chart__canvas {
  width: 100%;
  min-height: 280px;
  background: var(--radf-surface-well, var(--radf-color-surface));
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  border-radius: var(--radf-radius-md);
  padding: var(--radf-space-3);
  box-shadow: var(--radf-shadow-inset);
}

.radf-chart__canvas .recharts-responsive-container {
  width: 100%;
  height: 100%;
}

.radf-chart__footer {
  font-size: 0.8rem;
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-chart__brush .recharts-brush-traveller {
  fill: var(--radf-accent-primary);
  stroke: var(--radf-accent-primary);
}

.radf-brush {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--radf-space-3);
}

.radf-brush__range {
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-1);
}

.radf-brush__label {
  font-weight: var(--radf-font-weight-semibold);
  color: var(--radf-text-primary, var(--radf-color-text));
}

.radf-brush__value {
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-brush__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--radf-space-2);
}

.radf-brush__button {
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  background: var(--radf-surface-1);
  color: var(--radf-text-primary, var(--radf-color-text));
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: var(--radf-shadow-low);
}

.radf-brush__button--primary {
  border-color: transparent;
  background: var(--radf-accent-primary-soft);
  color: var(--radf-accent-primary);
}

.radf-brush__button:hover {
  border-color: var(--radf-border-strong, var(--radf-color-border));
  transform: translateY(-1px);
}

.radf-brush__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.radf-chart-tooltip {
  background: var(--radf-surface-overlay, var(--radf-color-surface));
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  border-radius: var(--radf-radius-md);
  box-shadow: var(--radf-shadow-high);
  padding: var(--radf-space-3);
  min-width: 160px;
}

.radf-chart-tooltip__label {
  margin: 0 0 var(--radf-space-2);
  font-weight: var(--radf-font-weight-semibold);
  color: var(--radf-text-primary, var(--radf-color-text));
}

.radf-chart-tooltip__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-1);
}

.radf-chart-tooltip__item {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: var(--radf-space-2);
  align-items: center;
  font-size: 0.85rem;
}

.radf-chart-tooltip__swatch,
.radf-chart-legend__swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.radf-chart-tooltip__name {
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-chart-tooltip__value {
  font-weight: var(--radf-font-weight-semibold);
}

.radf-chart-legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--radf-space-3);
  padding: 0;
  margin: var(--radf-space-2) 0 0;
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-size: 0.85rem;
}

.radf-chart-legend__item {
  display: inline-flex;
  align-items: center;
  gap: var(--radf-space-2);
}

.radf-chart-legend__label {
  color: var(--radf-text-secondary, var(--radf-color-text));
  font-weight: 500;
}

.radf-viz__missing {
  border: 1px dashed var(--radf-border-subtle, var(--radf-color-border));
  border-radius: var(--radf-radius-sm);
  padding: var(--radf-space-4);
  text-align: center;
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-viz__missing-title {
  margin: 0 0 var(--radf-space-1);
  font-weight: var(--radf-font-weight-semibold);
  color: var(--radf-text-primary, var(--radf-color-text));
}

.radf-viz__missing-text {
  margin: 0;
  font-size: 0.85rem;
}

.radf-kpi {
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-2);
  padding: var(--radf-space-4);
  border-radius: var(--radf-radius-lg);
  background: var(--radf-panel-gradient, var(--radf-color-surface));
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  box-shadow: var(--radf-shadow-low);
}

.radf-kpi__label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7rem;
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-weight: var(--radf-font-weight-semibold);
}

.radf-kpi__value {
  font-size: 2rem;
  font-weight: var(--radf-font-weight-bold);
  color: var(--radf-text-primary, var(--radf-color-text));
}

.radf-kpi__caption {
  font-size: 0.85rem;
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-chart-color-0 {
  background: var(--radf-series-1);
}

.radf-chart-color-1 {
  background: var(--radf-series-2);
}

.radf-chart-color-2 {
  background: var(--radf-series-3);
}

.radf-chart-color-3 {
  background: var(--radf-series-4);
}

.radf-chart-color-4 {
  background: var(--radf-series-5);
}

.radf-chart-color-5 {
  background: var(--radf-series-6);
}

.radf-chart-color-6 {
  background: var(--radf-series-7);
}

.radf-chart-color-7 {
  background: var(--radf-series-8);
}

.radf-chart-color-8 {
  background: var(--radf-series-9);
}

.radf-chart-color-9 {
  background: var(--radf-series-10);
}

.radf-chart-color-10 {
  background: var(--radf-series-11);
}

.radf-chart-color-11 {
  background: var(--radf-series-12);
}


/* ---- components/filters.css ---- */
.radf-selection-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  padding: 12px 16px;
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  border-radius: 14px;
  background: var(--radf-surface-1);
  box-shadow: var(--radf-shadow-low);
}

.radf-selection-bar__title {
  font-weight: 600;
  color: var(--radf-text-primary, var(--radf-color-text));
}

.radf-selection-bar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.radf-selection-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--radf-accent-primary-soft);
  color: var(--radf-accent-primary);
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.radf-selection-chip__label {
  font-weight: 600;
}

.radf-selection-chip__remove {
  font-weight: 700;
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-selection-bar__clear {
  margin-left: auto;
  border: none;
  background: none;
  color: var(--radf-accent-primary);
  font-weight: 600;
  cursor: pointer;
}

.radf-selection-bar__clear:hover,
.radf-selection-chip:hover {
  transform: translateY(-1px);
}

.radf-drill {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  background: var(--radf-surface-1);
  box-shadow: var(--radf-shadow-low);
}

.radf-drill__title {
  font-weight: 600;
  color: var(--radf-text-primary, var(--radf-color-text));
}

.radf-drill__crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.radf-drill__crumb {
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  background: var(--radf-surface-2);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--radf-text-secondary, var(--radf-color-text));
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.radf-drill__crumb:hover {
  border-color: var(--radf-accent-primary);
  color: var(--radf-accent-primary);
  transform: translateY(-1px);
}

.radf-drill__reset {
  margin-left: auto;
  border: none;
  background: none;
  color: var(--radf-accent-primary);
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 720px) {
  .radf-selection-bar__clear {
    margin-left: 0;
  }

  .radf-drill__reset {
    margin-left: 0;
  }
}


/* ---- components/grid.css ---- */
.radf-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: minmax(180px, auto);
  gap: var(--radf-space-5);
  align-items: stretch;
}

.radf-grid__item {
  min-width: 0;
}

.radf-grid__item--col-start-1 {
  grid-column-start: 1;
}

.radf-grid__item--col-start-2 {
  grid-column-start: 2;
}

.radf-grid__item--col-start-3 {
  grid-column-start: 3;
}

.radf-grid__item--col-start-4 {
  grid-column-start: 4;
}

.radf-grid__item--col-start-5 {
  grid-column-start: 5;
}

.radf-grid__item--col-start-6 {
  grid-column-start: 6;
}

.radf-grid__item--col-start-7 {
  grid-column-start: 7;
}

.radf-grid__item--col-start-8 {
  grid-column-start: 8;
}

.radf-grid__item--col-start-9 {
  grid-column-start: 9;
}

.radf-grid__item--col-start-10 {
  grid-column-start: 10;
}

.radf-grid__item--col-start-11 {
  grid-column-start: 11;
}

.radf-grid__item--col-start-12 {
  grid-column-start: 12;
}

.radf-grid__item--col-span-1 {
  grid-column-end: span 1;
}

.radf-grid__item--col-span-2 {
  grid-column-end: span 2;
}

.radf-grid__item--col-span-3 {
  grid-column-end: span 3;
}

.radf-grid__item--col-span-4 {
  grid-column-end: span 4;
}

.radf-grid__item--col-span-5 {
  grid-column-end: span 5;
}

.radf-grid__item--col-span-6 {
  grid-column-end: span 6;
}

.radf-grid__item--col-span-7 {
  grid-column-end: span 7;
}

.radf-grid__item--col-span-8 {
  grid-column-end: span 8;
}

.radf-grid__item--col-span-9 {
  grid-column-end: span 9;
}

.radf-grid__item--col-span-10 {
  grid-column-end: span 10;
}

.radf-grid__item--col-span-11 {
  grid-column-end: span 11;
}

.radf-grid__item--col-span-12 {
  grid-column-end: span 12;
}

.radf-grid__item--row-start-1 {
  grid-row-start: 1;
}

.radf-grid__item--row-start-2 {
  grid-row-start: 2;
}

.radf-grid__item--row-start-3 {
  grid-row-start: 3;
}

.radf-grid__item--row-start-4 {
  grid-row-start: 4;
}

.radf-grid__item--row-start-5 {
  grid-row-start: 5;
}

.radf-grid__item--row-start-6 {
  grid-row-start: 6;
}

.radf-grid__item--row-start-7 {
  grid-row-start: 7;
}

.radf-grid__item--row-start-8 {
  grid-row-start: 8;
}

.radf-grid__item--row-start-9 {
  grid-row-start: 9;
}

.radf-grid__item--row-start-10 {
  grid-row-start: 10;
}

.radf-grid__item--row-start-11 {
  grid-row-start: 11;
}

.radf-grid__item--row-start-12 {
  grid-row-start: 12;
}

.radf-grid__item--row-span-1 {
  grid-row-end: span 1;
}

.radf-grid__item--row-span-2 {
  grid-row-end: span 2;
}

.radf-grid__item--row-span-3 {
  grid-row-end: span 3;
}

.radf-grid__item--row-span-4 {
  grid-row-end: span 4;
}

.radf-grid__item--row-span-5 {
  grid-row-end: span 5;
}

.radf-grid__item--row-span-6 {
  grid-row-end: span 6;
}

.radf-grid__item--row-span-7 {
  grid-row-end: span 7;
}

.radf-grid__item--row-span-8 {
  grid-row-end: span 8;
}

.radf-grid__item--row-span-9 {
  grid-row-end: span 9;
}

.radf-grid__item--row-span-10 {
  grid-row-end: span 10;
}

.radf-grid__item--row-span-11 {
  grid-row-end: span 11;
}

.radf-grid__item--row-span-12 {
  grid-row-end: span 12;
}


/* ---- components/insights.css ---- */
.radf-insights {
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-4);
}

.radf-insight-card {
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  border-radius: var(--radf-radius-lg);
  padding: var(--radf-space-4);
  background: var(--radf-panel-gradient, var(--radf-color-surface));
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-3);
  box-shadow: var(--radf-shadow-low);
}

.radf-insight-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--radf-space-3);
}

.radf-insight-card__title {
  margin: 0;
  font-size: 1rem;
  font-weight: var(--radf-font-weight-semibold);
}

.radf-insight-card__source {
  margin: var(--radf-space-1) 0 0;
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-size: 0.85rem;
}

.radf-insight-card__badge {
  padding: 2px var(--radf-space-2);
  border-radius: var(--radf-radius-sm);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid currentColor;
}

.radf-insight-card__narrative {
  margin: 0;
  color: var(--radf-text-secondary, var(--radf-color-text));
  font-size: 0.95rem;
}

.radf-insight-card__action {
  margin: 0;
  color: var(--radf-text-secondary, var(--radf-color-text));
  font-size: 0.9rem;
}

.radf-insight-card__evidence {
  margin: 0;
  padding-left: var(--radf-space-4);
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-size: 0.85rem;
}

.radf-insight-card__evidence-item {
  margin-bottom: var(--radf-space-1);
}

.radf-insight-card--positive {
  border-color: color-mix(in srgb, var(--radf-accent-success) 55%, transparent);
  color: var(--radf-accent-success);
}

.radf-insight-card--negative {
  border-color: color-mix(in srgb, var(--radf-accent-danger) 55%, transparent);
  color: var(--radf-accent-danger);
}

.radf-insight-card--warning {
  border-color: color-mix(in srgb, var(--radf-accent-warning) 60%, transparent);
  color: var(--radf-accent-warning);
}

.radf-insight-card--neutral {
  border-color: color-mix(in srgb, var(--radf-text-muted) 60%, transparent);
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-insight-card--info {
  border-color: color-mix(in srgb, var(--radf-accent-secondary) 55%, transparent);
  color: var(--radf-accent-secondary);
}


/* ---- components/panel.css ---- */
.radf-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--radf-panel-gradient, var(--radf-color-surface));
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  border-radius: var(--radf-radius-lg);
  box-shadow: var(--radf-shadow-med);
  overflow: hidden;
  position: relative;
}

.radf-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: var(--radf-shadow-inset);
  pointer-events: none;
}

.radf-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--radf-space-4) var(--radf-space-5);
  border-bottom: 1px solid var(--radf-border-divider, var(--radf-color-border));
  gap: var(--radf-space-3);
  background: var(--radf-panel-header-gradient, var(--radf-surface-3));
  position: relative;
  z-index: 1;
}

.radf-panel__heading {
  display: flex;
  flex-direction: column;
  gap: var(--radf-space-1);
}

.radf-panel__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: var(--radf-font-weight-bold);
  letter-spacing: -0.01em;
}

.radf-panel__subtitle {
  margin: 0;
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-size: 0.88rem;
}

.radf-panel__actions {
  display: flex;
  gap: var(--radf-space-2);
}

.radf-panel__body {
  flex: 1;
  padding: var(--radf-space-4) var(--radf-space-5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.radf-panel__content {
  width: 100%;
}

.radf-panel__footer {
  padding: var(--radf-space-3) var(--radf-space-5);
  border-top: 1px solid var(--radf-border-divider, var(--radf-color-border));
  color: var(--radf-text-muted, var(--radf-color-muted));
  font-size: 0.85rem;
  background: var(--radf-surface-1);
}

.radf-panel__state {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--radf-space-2);
  color: var(--radf-text-muted, var(--radf-color-muted));
}

.radf-panel__state-icon {
  font-size: 1.6rem;
}

.radf-panel__state-title {
  margin: 0;
  font-weight: var(--radf-font-weight-semibold);
  color: var(--radf-text-primary, var(--radf-color-text));
}

.radf-panel__state-text {
  margin: 0;
  font-size: 0.9rem;
}

.radf-panel__state--error .radf-panel__state-title {
  color: var(--radf-accent-danger);
}

.radf-panel__state--error .radf-panel__state-text {
  color: color-mix(in srgb, var(--radf-accent-danger) 70%, #ffffff 30%);
}

.radf-panel__state--loading .radf-panel__state-icon {
  animation: radf-spin 1.6s linear infinite;
}

@keyframes radf-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}


/* ---- components/table.css ---- */
.radf-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--radf-surface-1);
  border: 1px solid var(--radf-border-subtle, var(--radf-color-border));
  border-radius: var(--radf-radius-lg);
  overflow: hidden;
  box-shadow: var(--radf-shadow-low);
}

.radf-table thead {
  background: var(--radf-panel-header-gradient, var(--radf-surface-3));
  color: var(--radf-text-secondary, var(--radf-color-text));
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
}

.radf-table th,
.radf-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--radf-border-divider, var(--radf-color-border));
}

.radf-table th {
  font-weight: var(--radf-font-weight-semibold);
}

.radf-table tbody tr {
  transition: background 0.2s ease, transform 0.2s ease;
}

.radf-table tbody tr:hover {
  background: var(--radf-surface-muted, var(--radf-color-surface));
}

.radf-table tbody tr:last-child td {
  border-bottom: none;
}

.radf-table--compact th,
.radf-table--compact td {
  padding: 10px 12px;
}

.radf-table--sticky thead th {
  position: sticky;
  top: 0;
  z-index: 1;
}


/* ---- theme.light.css ---- */
:root.radf-theme-light {
  --radf-surface-bg: #f3f5fb;
  --radf-surface-1: #ffffff;
  --radf-surface-2: #f9fafc;
  --radf-surface-3: #eef2f7;
  --radf-surface-well: #f5f7fb;
  --radf-surface-overlay: #ffffff;
  --radf-surface-muted: #eef2f7;

  --radf-border-subtle: #e2e8f0;
  --radf-border-strong: #cbd5f5;
  --radf-border-divider: #d8dee9;
  --radf-border-focus: #2563eb;

  --radf-text-primary: #0f172a;
  --radf-text-secondary: #1f2937;
  --radf-text-muted: #64748b;
  --radf-text-inverse: #f8fafc;

  --radf-accent-primary: #2563eb;
  --radf-accent-secondary: #14b8a6;
  --radf-accent-success: #16a34a;
  --radf-accent-warning: #d97706;
  --radf-accent-danger: #dc2626;
  --radf-accent-primary-soft: rgba(37, 99, 235, 0.12);
  --radf-accent-secondary-soft: rgba(20, 184, 166, 0.12);

  --radf-shadow-low: 0 1px 2px rgba(15, 23, 42, 0.08), 0 1px 1px rgba(15, 23, 42, 0.04);
  --radf-shadow-med: 0 10px 24px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(15, 23, 42, 0.08);
  --radf-shadow-high: 0 20px 45px rgba(15, 23, 42, 0.16), 0 8px 20px rgba(15, 23, 42, 0.1);
  --radf-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(15, 23, 42, 0.03);

  --radf-app-gradient: radial-gradient(circle at top, rgba(37, 99, 235, 0.08), transparent 55%),
    linear-gradient(180deg, #f7f9fe 0%, #eef2f7 100%);
  --radf-panel-gradient: linear-gradient(180deg, #ffffff 0%, #f5f7fb 100%);
  --radf-panel-header-gradient: linear-gradient(180deg, #f7f9ff 0%, #eef2f7 100%);

  --radf-chart-grid: rgba(148, 163, 184, 0.35);

  --radf-color-bg: var(--radf-surface-bg);
  --radf-color-surface: var(--radf-surface-2);
  --radf-color-surface-alt: var(--radf-surface-1);
  --radf-color-text: var(--radf-text-primary);
  --radf-color-muted: var(--radf-text-muted);
  --radf-color-border: var(--radf-border-subtle);
  --radf-color-accent: var(--radf-accent-primary);
  --radf-color-accent-weak: var(--radf-accent-primary-soft);

}

:root.fecc-theme-light {
  --radf-surface-bg: #f8f9fa;
  --radf-surface-1: #e9ecef;
  --radf-surface-2: #ffffff;
  --radf-surface-3: #f3f4f6;
  --radf-surface-well: #f8f9fa;
  --radf-surface-overlay: #ffffff;
  --radf-surface-muted: #e9ecef;

  --radf-border-subtle: #d1d5db;
  --radf-border-strong: #b9c0ca;
  --radf-border-divider: #d1d5db;
  --radf-border-focus: #186329;

  --radf-text-primary: #111827;
  --radf-text-secondary: #0f172a;
  --radf-text-muted: #64748b;
  --radf-text-inverse: #f8fafc;

  --radf-accent-primary: #186329;
  --radf-accent-secondary: #1c7330;
  --radf-accent-success: #16a34a;
  --radf-accent-warning: #f97316;
  --radf-accent-danger: #dc2626;
  --radf-accent-primary-soft: rgba(24, 99, 41, 0.12);
  --radf-accent-secondary-soft: rgba(28, 115, 48, 0.12);

  --radf-shadow-low: 0 1px 2px rgba(17, 24, 39, 0.08), 0 1px 1px rgba(17, 24, 39, 0.04);
  --radf-shadow-med: 0 10px 24px rgba(17, 24, 39, 0.12), 0 4px 10px rgba(17, 24, 39, 0.08);
  --radf-shadow-high: 0 20px 45px rgba(17, 24, 39, 0.16), 0 8px 20px rgba(17, 24, 39, 0.1);
  --radf-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(17, 24, 39, 0.03);

  --radf-app-gradient: radial-gradient(circle at top, rgba(24, 99, 41, 0.08), transparent 55%),
  linear-gradient(180deg, #f8f9fa 0%, #f3f4f6 100%);
  --radf-panel-gradient: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  --radf-panel-header-gradient: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);

  --radf-chart-grid: rgba(100, 116, 139, 0.3);

  --radf-color-bg: var(--radf-surface-bg);
  --radf-color-surface: var(--radf-surface-2);
  --radf-color-surface-alt: var(--radf-surface-1);
  --radf-color-text: var(--radf-text-primary);
  --radf-color-muted: var(--radf-text-muted);
  --radf-color-border: var(--radf-border-subtle);
  --radf-color-accent: var(--radf-accent-primary);
  --radf-color-accent-weak: var(--radf-accent-primary-soft);

}


/* ---- theme.dark.css ---- */
:root.radf-theme-dark {
  --radf-surface-bg: #0b111d;
  --radf-surface-1: #111826;
  --radf-surface-2: #151f30;
  --radf-surface-3: #1a2436;
  --radf-surface-well: #101826;
  --radf-surface-overlay: #151f30;
  --radf-surface-muted: #182233;

  --radf-border-subtle: #1f2a3d;
  --radf-border-strong: #2b3a55;
  --radf-border-divider: #223048;
  --radf-border-focus: #38bdf8;

  --radf-text-primary: #f8fafc;
  --radf-text-secondary: #e2e8f0;
  --radf-text-muted: #94a3b8;
  --radf-text-inverse: #0f172a;

  --radf-accent-primary: #38bdf8;
  --radf-accent-secondary: #a78bfa;
  --radf-accent-success: #22c55e;
  --radf-accent-warning: #f59e0b;
  --radf-accent-danger: #f87171;
  --radf-accent-primary-soft: rgba(56, 189, 248, 0.16);
  --radf-accent-secondary-soft: rgba(167, 139, 250, 0.16);

  --radf-shadow-low: 0 1px 2px rgba(2, 6, 23, 0.5), 0 1px 1px rgba(2, 6, 23, 0.4);
  --radf-shadow-med: 0 16px 32px rgba(2, 6, 23, 0.55), 0 6px 14px rgba(2, 6, 23, 0.4);
  --radf-shadow-high: 0 24px 50px rgba(2, 6, 23, 0.6), 0 10px 24px rgba(2, 6, 23, 0.45);
  --radf-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.04), inset 0 -1px 0 rgba(0, 0, 0, 0.4);

  --radf-app-gradient: radial-gradient(circle at top, rgba(56, 189, 248, 0.1), transparent 55%),
  linear-gradient(180deg, #0b111d 0%, #0b1220 100%);
  --radf-panel-gradient: linear-gradient(180deg, #182334 0%, #141c2b 100%);
  --radf-panel-header-gradient: linear-gradient(180deg, #1f2b42 0%, #172133 100%);

  --radf-chart-grid: rgba(148, 163, 184, 0.2);

  --radf-color-bg: var(--radf-surface-bg);
  --radf-color-surface: var(--radf-surface-2);
  --radf-color-surface-alt: var(--radf-surface-1);
  --radf-color-text: var(--radf-text-primary);
  --radf-color-muted: var(--radf-text-muted);
  --radf-color-border: var(--radf-border-subtle);
  --radf-color-accent: var(--radf-accent-primary);
  --radf-color-accent-weak: var(--radf-accent-primary-soft);

}

:root.fecc-theme-dark {
  --radf-surface-bg: #292c34;
  --radf-surface-1: #2C2F3A;
  --radf-surface-2: #1f2128;
  --radf-surface-3: #353846;
  --radf-surface-well: #1f2128;
  --radf-surface-overlay: #1f2128;
  --radf-surface-muted: #2C2F3A;

  --radf-border-subtle: #4b5563;
  --radf-border-strong: #6b7280;
  --radf-border-divider: #4b5563;
  --radf-border-focus: #186329;

  --radf-text-primary: #f8fafc;
  --radf-text-secondary: #ffffff;
  --radf-text-muted: #94a3b8;
  --radf-text-inverse: #0f172a;

  --radf-accent-primary: #186329;
  --radf-accent-secondary: #1c7330;
  --radf-accent-success: #22c55e;
  --radf-accent-warning: #fbbf24;
  --radf-accent-danger: #ef4444;
  --radf-accent-primary-soft: rgba(24, 99, 41, 0.2);
  --radf-accent-secondary-soft: rgba(28, 115, 48, 0.2);

  --radf-shadow-low: 0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(0, 0, 0, 0.4);
  --radf-shadow-med: 0 16px 32px rgba(0, 0, 0, 0.55), 0 6px 14px rgba(0, 0, 0, 0.4);
  --radf-shadow-high: 0 24px 50px rgba(0, 0, 0, 0.6), 0 10px 24px rgba(0, 0, 0, 0.45);
  --radf-shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.04), inset 0 -1px 0 rgba(0, 0, 0, 0.4);

  --radf-app-gradient: radial-gradient(circle at top, rgba(24, 99, 41, 0.1), transparent 55%),
  linear-gradient(180deg, #292c34 0%, #1f2128 100%);
  --radf-panel-gradient: linear-gradient(180deg, #1f2128 0%, #1a1d25 100%);
  --radf-panel-header-gradient: linear-gradient(180deg, #292c34 0%, #1f2128 100%);

  --radf-chart-grid: rgba(148, 163, 184, 0.2);

  --radf-color-bg: var(--radf-surface-bg);
  --radf-color-surface: var(--radf-surface-2);
  --radf-color-surface-alt: var(--radf-surface-1);
  --radf-color-text: var(--radf-text-primary);
  --radf-color-muted: var(--radf-text-muted);
  --radf-color-border: var(--radf-border-subtle);
  --radf-color-accent: var(--radf-accent-primary);
  --radf-color-accent-weak: var(--radf-accent-primary-soft);

}


/* ---- framework.entry.css ---- */
@import './tokens.css';
@import './palettes.css';
@import './framework.css';
@import './components/grid.css';
@import './components/panel.css';
@import './components/charts.css';
@import './components/filters.css';
@import './components/insights.css';
@import './components/table.css';
@import './theme.light.css';
@import './theme.dark.css';

`;
var jr = { exports: {} }, er = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var te;
function Ia() {
  if (te) return er;
  te = 1;
  var r = Tr, e = Symbol.for("react.element"), a = Symbol.for("react.fragment"), n = Object.prototype.hasOwnProperty, t = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, d = { key: !0, ref: !0, __self: !0, __source: !0 };
  function o(i, c, u) {
    var p, m = {}, g = null, N = null;
    u !== void 0 && (g = "" + u), c.key !== void 0 && (g = "" + c.key), c.ref !== void 0 && (N = c.ref);
    for (p in c) n.call(c, p) && !d.hasOwnProperty(p) && (m[p] = c[p]);
    if (i && i.defaultProps) for (p in c = i.defaultProps, c) m[p] === void 0 && (m[p] = c[p]);
    return { $$typeof: e, type: i, key: g, ref: N, props: m, _owner: t.current };
  }
  return er.Fragment = a, er.jsx = o, er.jsxs = o, er;
}
var ar = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var se;
function $a() {
  return se || (se = 1, process.env.NODE_ENV !== "production" && function() {
    var r = Tr, e = Symbol.for("react.element"), a = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), t = Symbol.for("react.strict_mode"), d = Symbol.for("react.profiler"), o = Symbol.for("react.provider"), i = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), u = Symbol.for("react.suspense"), p = Symbol.for("react.suspense_list"), m = Symbol.for("react.memo"), g = Symbol.for("react.lazy"), N = Symbol.for("react.offscreen"), T = Symbol.iterator, h = "@@iterator";
    function w(s) {
      if (s === null || typeof s != "object")
        return null;
      var l = T && s[T] || s[h];
      return typeof l == "function" ? l : null;
    }
    var x = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function R(s) {
      {
        for (var l = arguments.length, b = new Array(l > 1 ? l - 1 : 0), v = 1; v < l; v++)
          b[v - 1] = arguments[v];
        S("error", s, b);
      }
    }
    function S(s, l, b) {
      {
        var v = x.ReactDebugCurrentFrame, E = v.getStackAddendum();
        E !== "" && (l += "%s", b = b.concat([E]));
        var j = b.map(function(y) {
          return String(y);
        });
        j.unshift("Warning: " + l), Function.prototype.apply.call(console[s], console, j);
      }
    }
    var O = !1, P = !1, q = !1, C = !1, dr = !1, Ir;
    Ir = Symbol.for("react.module.reference");
    function Je(s) {
      return !!(typeof s == "string" || typeof s == "function" || s === n || s === d || dr || s === t || s === u || s === p || C || s === N || O || P || q || typeof s == "object" && s !== null && (s.$$typeof === g || s.$$typeof === m || s.$$typeof === o || s.$$typeof === i || s.$$typeof === c || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      s.$$typeof === Ir || s.getModuleId !== void 0));
    }
    function Qe(s, l, b) {
      var v = s.displayName;
      if (v)
        return v;
      var E = l.displayName || l.name || "";
      return E !== "" ? b + "(" + E + ")" : b;
    }
    function $r(s) {
      return s.displayName || "Context";
    }
    function V(s) {
      if (s == null)
        return null;
      if (typeof s.tag == "number" && R("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof s == "function")
        return s.displayName || s.name || null;
      if (typeof s == "string")
        return s;
      switch (s) {
        case n:
          return "Fragment";
        case a:
          return "Portal";
        case d:
          return "Profiler";
        case t:
          return "StrictMode";
        case u:
          return "Suspense";
        case p:
          return "SuspenseList";
      }
      if (typeof s == "object")
        switch (s.$$typeof) {
          case i:
            var l = s;
            return $r(l) + ".Consumer";
          case o:
            var b = s;
            return $r(b._context) + ".Provider";
          case c:
            return Qe(s, s.render, "ForwardRef");
          case m:
            var v = s.displayName || null;
            return v !== null ? v : V(s.type) || "Memo";
          case g: {
            var E = s, j = E._payload, y = E._init;
            try {
              return V(y(j));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var B = Object.assign, H = 0, Or, Lr, Fr, zr, Ar, Cr, Mr;
    function Vr() {
    }
    Vr.__reactDisabledLog = !0;
    function Xe() {
      {
        if (H === 0) {
          Or = console.log, Lr = console.info, Fr = console.warn, zr = console.error, Ar = console.group, Cr = console.groupCollapsed, Mr = console.groupEnd;
          var s = {
            configurable: !0,
            enumerable: !0,
            value: Vr,
            writable: !0
          };
          Object.defineProperties(console, {
            info: s,
            log: s,
            warn: s,
            error: s,
            group: s,
            groupCollapsed: s,
            groupEnd: s
          });
        }
        H++;
      }
    }
    function Ze() {
      {
        if (H--, H === 0) {
          var s = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: B({}, s, {
              value: Or
            }),
            info: B({}, s, {
              value: Lr
            }),
            warn: B({}, s, {
              value: Fr
            }),
            error: B({}, s, {
              value: zr
            }),
            group: B({}, s, {
              value: Ar
            }),
            groupCollapsed: B({}, s, {
              value: Cr
            }),
            groupEnd: B({}, s, {
              value: Mr
            })
          });
        }
        H < 0 && R("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var br = x.ReactCurrentDispatcher, mr;
    function ir(s, l, b) {
      {
        if (mr === void 0)
          try {
            throw Error();
          } catch (E) {
            var v = E.stack.trim().match(/\n( *(at )?)/);
            mr = v && v[1] || "";
          }
        return `
` + mr + s;
      }
    }
    var vr = !1, or;
    {
      var He = typeof WeakMap == "function" ? WeakMap : Map;
      or = new He();
    }
    function qr(s, l) {
      if (!s || vr)
        return "";
      {
        var b = or.get(s);
        if (b !== void 0)
          return b;
      }
      var v;
      vr = !0;
      var E = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var j;
      j = br.current, br.current = null, Xe();
      try {
        if (l) {
          var y = function() {
            throw Error();
          };
          if (Object.defineProperty(y.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(y, []);
            } catch (L) {
              v = L;
            }
            Reflect.construct(s, [], y);
          } else {
            try {
              y.call();
            } catch (L) {
              v = L;
            }
            s.call(y.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (L) {
            v = L;
          }
          s();
        }
      } catch (L) {
        if (L && v && typeof L.stack == "string") {
          for (var _ = L.stack.split(`
`), $ = v.stack.split(`
`), k = _.length - 1, D = $.length - 1; k >= 1 && D >= 0 && _[k] !== $[D]; )
            D--;
          for (; k >= 1 && D >= 0; k--, D--)
            if (_[k] !== $[D]) {
              if (k !== 1 || D !== 1)
                do
                  if (k--, D--, D < 0 || _[k] !== $[D]) {
                    var z = `
` + _[k].replace(" at new ", " at ");
                    return s.displayName && z.includes("<anonymous>") && (z = z.replace("<anonymous>", s.displayName)), typeof s == "function" && or.set(s, z), z;
                  }
                while (k >= 1 && D >= 0);
              break;
            }
        }
      } finally {
        vr = !1, br.current = j, Ze(), Error.prepareStackTrace = E;
      }
      var U = s ? s.displayName || s.name : "", K = U ? ir(U) : "";
      return typeof s == "function" && or.set(s, K), K;
    }
    function ra(s, l, b) {
      return qr(s, !1);
    }
    function ea(s) {
      var l = s.prototype;
      return !!(l && l.isReactComponent);
    }
    function fr(s, l, b) {
      if (s == null)
        return "";
      if (typeof s == "function")
        return qr(s, ea(s));
      if (typeof s == "string")
        return ir(s);
      switch (s) {
        case u:
          return ir("Suspense");
        case p:
          return ir("SuspenseList");
      }
      if (typeof s == "object")
        switch (s.$$typeof) {
          case c:
            return ra(s.render);
          case m:
            return fr(s.type, l, b);
          case g: {
            var v = s, E = v._payload, j = v._init;
            try {
              return fr(j(E), l, b);
            } catch {
            }
          }
        }
      return "";
    }
    var rr = Object.prototype.hasOwnProperty, Br = {}, Kr = x.ReactDebugCurrentFrame;
    function lr(s) {
      if (s) {
        var l = s._owner, b = fr(s.type, s._source, l ? l.type : null);
        Kr.setExtraStackFrame(b);
      } else
        Kr.setExtraStackFrame(null);
    }
    function aa(s, l, b, v, E) {
      {
        var j = Function.call.bind(rr);
        for (var y in s)
          if (j(s, y)) {
            var _ = void 0;
            try {
              if (typeof s[y] != "function") {
                var $ = Error((v || "React class") + ": " + b + " type `" + y + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof s[y] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw $.name = "Invariant Violation", $;
              }
              _ = s[y](l, y, v, b, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (k) {
              _ = k;
            }
            _ && !(_ instanceof Error) && (lr(E), R("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", v || "React class", b, y, typeof _), lr(null)), _ instanceof Error && !(_.message in Br) && (Br[_.message] = !0, lr(E), R("Failed %s type: %s", b, _.message), lr(null));
          }
      }
    }
    var na = Array.isArray;
    function gr(s) {
      return na(s);
    }
    function ta(s) {
      {
        var l = typeof Symbol == "function" && Symbol.toStringTag, b = l && s[Symbol.toStringTag] || s.constructor.name || "Object";
        return b;
      }
    }
    function sa(s) {
      try {
        return Yr(s), !1;
      } catch {
        return !0;
      }
    }
    function Yr(s) {
      return "" + s;
    }
    function Ur(s) {
      if (sa(s))
        return R("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", ta(s)), Yr(s);
    }
    var Wr = x.ReactCurrentOwner, da = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Gr, Jr;
    function ia(s) {
      if (rr.call(s, "ref")) {
        var l = Object.getOwnPropertyDescriptor(s, "ref").get;
        if (l && l.isReactWarning)
          return !1;
      }
      return s.ref !== void 0;
    }
    function oa(s) {
      if (rr.call(s, "key")) {
        var l = Object.getOwnPropertyDescriptor(s, "key").get;
        if (l && l.isReactWarning)
          return !1;
      }
      return s.key !== void 0;
    }
    function fa(s, l) {
      typeof s.ref == "string" && Wr.current;
    }
    function la(s, l) {
      {
        var b = function() {
          Gr || (Gr = !0, R("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", l));
        };
        b.isReactWarning = !0, Object.defineProperty(s, "key", {
          get: b,
          configurable: !0
        });
      }
    }
    function ca(s, l) {
      {
        var b = function() {
          Jr || (Jr = !0, R("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", l));
        };
        b.isReactWarning = !0, Object.defineProperty(s, "ref", {
          get: b,
          configurable: !0
        });
      }
    }
    var ua = function(s, l, b, v, E, j, y) {
      var _ = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: e,
        // Built-in properties that belong on the element
        type: s,
        key: l,
        ref: b,
        props: y,
        // Record the component responsible for creating this element.
        _owner: j
      };
      return _._store = {}, Object.defineProperty(_._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(_, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: v
      }), Object.defineProperty(_, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: E
      }), Object.freeze && (Object.freeze(_.props), Object.freeze(_)), _;
    };
    function pa(s, l, b, v, E) {
      {
        var j, y = {}, _ = null, $ = null;
        b !== void 0 && (Ur(b), _ = "" + b), oa(l) && (Ur(l.key), _ = "" + l.key), ia(l) && ($ = l.ref, fa(l, E));
        for (j in l)
          rr.call(l, j) && !da.hasOwnProperty(j) && (y[j] = l[j]);
        if (s && s.defaultProps) {
          var k = s.defaultProps;
          for (j in k)
            y[j] === void 0 && (y[j] = k[j]);
        }
        if (_ || $) {
          var D = typeof s == "function" ? s.displayName || s.name || "Unknown" : s;
          _ && la(y, D), $ && ca(y, D);
        }
        return ua(s, _, $, E, v, Wr.current, y);
      }
    }
    var hr = x.ReactCurrentOwner, Qr = x.ReactDebugCurrentFrame;
    function Y(s) {
      if (s) {
        var l = s._owner, b = fr(s.type, s._source, l ? l.type : null);
        Qr.setExtraStackFrame(b);
      } else
        Qr.setExtraStackFrame(null);
    }
    var _r;
    _r = !1;
    function xr(s) {
      return typeof s == "object" && s !== null && s.$$typeof === e;
    }
    function Xr() {
      {
        if (hr.current) {
          var s = V(hr.current.type);
          if (s)
            return `

Check the render method of \`` + s + "`.";
        }
        return "";
      }
    }
    function ba(s) {
      return "";
    }
    var Zr = {};
    function ma(s) {
      {
        var l = Xr();
        if (!l) {
          var b = typeof s == "string" ? s : s.displayName || s.name;
          b && (l = `

Check the top-level render call using <` + b + ">.");
        }
        return l;
      }
    }
    function Hr(s, l) {
      {
        if (!s._store || s._store.validated || s.key != null)
          return;
        s._store.validated = !0;
        var b = ma(l);
        if (Zr[b])
          return;
        Zr[b] = !0;
        var v = "";
        s && s._owner && s._owner !== hr.current && (v = " It was passed a child from " + V(s._owner.type) + "."), Y(s), R('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', b, v), Y(null);
      }
    }
    function re(s, l) {
      {
        if (typeof s != "object")
          return;
        if (gr(s))
          for (var b = 0; b < s.length; b++) {
            var v = s[b];
            xr(v) && Hr(v, l);
          }
        else if (xr(s))
          s._store && (s._store.validated = !0);
        else if (s) {
          var E = w(s);
          if (typeof E == "function" && E !== s.entries)
            for (var j = E.call(s), y; !(y = j.next()).done; )
              xr(y.value) && Hr(y.value, l);
        }
      }
    }
    function va(s) {
      {
        var l = s.type;
        if (l == null || typeof l == "string")
          return;
        var b;
        if (typeof l == "function")
          b = l.propTypes;
        else if (typeof l == "object" && (l.$$typeof === c || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        l.$$typeof === m))
          b = l.propTypes;
        else
          return;
        if (b) {
          var v = V(l);
          aa(b, s.props, "prop", v, s);
        } else if (l.PropTypes !== void 0 && !_r) {
          _r = !0;
          var E = V(l);
          R("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", E || "Unknown");
        }
        typeof l.getDefaultProps == "function" && !l.getDefaultProps.isReactClassApproved && R("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function ga(s) {
      {
        for (var l = Object.keys(s.props), b = 0; b < l.length; b++) {
          var v = l[b];
          if (v !== "children" && v !== "key") {
            Y(s), R("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", v), Y(null);
            break;
          }
        }
        s.ref !== null && (Y(s), R("Invalid attribute `ref` supplied to `React.Fragment`."), Y(null));
      }
    }
    var ee = {};
    function ae(s, l, b, v, E, j) {
      {
        var y = Je(s);
        if (!y) {
          var _ = "";
          (s === void 0 || typeof s == "object" && s !== null && Object.keys(s).length === 0) && (_ += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var $ = ba();
          $ ? _ += $ : _ += Xr();
          var k;
          s === null ? k = "null" : gr(s) ? k = "array" : s !== void 0 && s.$$typeof === e ? (k = "<" + (V(s.type) || "Unknown") + " />", _ = " Did you accidentally export a JSX literal instead of a component?") : k = typeof s, R("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", k, _);
        }
        var D = pa(s, l, b, E, j);
        if (D == null)
          return D;
        if (y) {
          var z = l.children;
          if (z !== void 0)
            if (v)
              if (gr(z)) {
                for (var U = 0; U < z.length; U++)
                  re(z[U], s);
                Object.freeze && Object.freeze(z);
              } else
                R("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              re(z, s);
        }
        if (rr.call(l, "key")) {
          var K = V(s), L = Object.keys(l).filter(function(Ea) {
            return Ea !== "key";
          }), yr = L.length > 0 ? "{key: someKey, " + L.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!ee[K + yr]) {
            var wa = L.length > 0 ? "{" + L.join(": ..., ") + ": ...}" : "{}";
            R(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, yr, K, wa, K), ee[K + yr] = !0;
          }
        }
        return s === n ? ga(D) : va(D), D;
      }
    }
    function ha(s, l, b) {
      return ae(s, l, b, !0);
    }
    function _a(s, l, b) {
      return ae(s, l, b, !1);
    }
    var xa = _a, ya = ha;
    ar.Fragment = n, ar.jsx = xa, ar.jsxs = ya;
  }()), ar;
}
process.env.NODE_ENV === "production" ? jr.exports = Ia() : jr.exports = $a();
var f = jr.exports;
const I = {
  SET_CONTEXT: "dashboard/SET_CONTEXT",
  SET_GLOBAL_FILTERS: "dashboard/SET_GLOBAL_FILTERS",
  ADD_SELECTION: "dashboard/ADD_SELECTION",
  REMOVE_SELECTION: "dashboard/REMOVE_SELECTION",
  CLEAR_SELECTIONS: "dashboard/CLEAR_SELECTIONS",
  PUSH_DRILL: "dashboard/PUSH_DRILL",
  POP_DRILL: "dashboard/POP_DRILL",
  SET_PANEL_STATE: "dashboard/SET_PANEL_STATE"
}, Oa = ({ dashboardId: r, datasetId: e }) => ({
  type: I.SET_CONTEXT,
  payload: { dashboardId: r, datasetId: e }
}), La = (r) => ({
  type: I.SET_GLOBAL_FILTERS,
  payload: { filters: r }
}), Fa = (r) => ({
  type: I.ADD_SELECTION,
  payload: { selection: r }
}), za = (r) => ({
  type: I.REMOVE_SELECTION,
  payload: { selectionId: r }
}), Aa = () => ({
  type: I.CLEAR_SELECTIONS
}), Ca = (r) => ({
  type: I.PUSH_DRILL,
  payload: { entry: r }
}), Ma = () => ({
  type: I.POP_DRILL
}), Va = (r, e) => ({
  type: I.SET_PANEL_STATE,
  payload: { panelId: r, nextState: e }
}), qa = (r = {}) => ({
  dashboardId: null,
  datasetId: null,
  globalFilters: [],
  selections: [],
  drillPath: [],
  panelStateById: {},
  ...r
}), Ba = (r, e, a) => ({
  ...r,
  [e]: {
    ...r[e] || {},
    ...a
  }
}), Ka = (r, e) => {
  switch (e.type) {
    case I.SET_CONTEXT:
      return {
        ...r,
        dashboardId: e.payload.dashboardId ?? r.dashboardId,
        datasetId: e.payload.datasetId ?? r.datasetId
      };
    case I.SET_GLOBAL_FILTERS:
      return {
        ...r,
        globalFilters: e.payload.filters
      };
    case I.ADD_SELECTION:
      return {
        ...r,
        selections: [...r.selections, e.payload.selection]
      };
    case I.REMOVE_SELECTION:
      return {
        ...r,
        selections: r.selections.filter(
          (a) => a.id !== e.payload.selectionId
        )
      };
    case I.CLEAR_SELECTIONS:
      return {
        ...r,
        selections: []
      };
    case I.PUSH_DRILL:
      return {
        ...r,
        drillPath: [...r.drillPath, e.payload.entry]
      };
    case I.POP_DRILL:
      return {
        ...r,
        drillPath: r.drillPath.slice(0, -1)
      };
    case I.SET_PANEL_STATE:
      return {
        ...r,
        panelStateById: Ba(
          r.panelStateById,
          e.payload.panelId,
          e.payload.nextState
        )
      };
    default:
      return r;
  }
}, Ie = we(null), $e = we(null), Ya = (r) => ({
  setDashboardContext: (e) => r(Oa(e)),
  setGlobalFilters: (e) => r(La(e)),
  addSelection: (e) => r(Fa(e)),
  removeSelection: (e) => r(za(e)),
  clearSelections: () => r(Aa()),
  pushDrillPath: (e) => r(Ca(e)),
  popDrillPath: () => r(Ma()),
  setPanelState: (e, a) => r(Va(e, a))
}), Vt = ({ children: r, initialState: e }) => {
  const [a, n] = Sa(
    Ka,
    qa(e)
  ), t = A(() => Ya(n), [n]);
  return /* @__PURE__ */ f.jsx(Ie.Provider, { value: a, children: /* @__PURE__ */ f.jsx($e.Provider, { value: t, children: r }) });
}, qt = () => {
  const r = Ee($e);
  if (!r)
    throw new Error("useDashboardActions must be used within a DashboardProvider");
  return r;
}, Bt = () => {
  const r = Ee(Ie);
  if (!r)
    throw new Error("useDashboardState must be used within a DashboardProvider");
  return r;
}, Ua = (r = {}) => ({
  datasetId: r.datasetId ?? null,
  measures: Array.isArray(r.measures) ? [...r.measures] : [],
  dimensions: Array.isArray(r.dimensions) ? [...r.dimensions] : [],
  filters: Array.isArray(r.filters) ? [...r.filters] : [],
  timeRange: r.timeRange ?? null,
  grain: r.grain ?? null,
  sort: r.sort ?? null,
  limit: r.limit ?? null,
  offset: r.offset ?? null,
  timezone: r.timezone ?? null,
  transforms: Array.isArray(r.transforms) ? [...r.transforms] : []
}), F = (r) => r ? Array.isArray(r) ? r : [r] : [], Wa = ({ panelId: r, field: e, value: a }) => `${r || "panel"}:${e}:${String(a)}`, Ga = ({
  panelId: r,
  field: e,
  value: a,
  op: n = "IN",
  label: t
}) => {
  if (!e)
    return null;
  const d = Array.isArray(a) ? a : [a], o = t ? `${t}: ${d.join(", ")}` : `${e}: ${d.join(", ")}`;
  return {
    id: Wa({ panelId: r, field: e, value: d.join("|") }),
    sourcePanelId: r || null,
    label: o,
    /** @type {Filter} */
    filter: {
      field: e,
      op: n,
      values: d
    }
  };
}, Oe = (r, e) => {
  var n, t, d;
  if (!r || !e)
    return null;
  if (r.payload && r.payload[e] !== void 0)
    return r.payload[e];
  if ((n = r.payload) != null && n.payload && r.payload.payload[e] !== void 0)
    return r.payload.payload[e];
  const a = (d = (t = r.activePayload) == null ? void 0 : t[0]) == null ? void 0 : d.payload;
  return a && a[e] !== void 0 ? a[e] : r.activeLabel !== void 0 && e === r.activeLabelField ? r.activeLabel : r[e] !== void 0 ? r[e] : null;
}, Kt = ({
  event: r,
  panelId: e,
  field: a,
  op: n,
  label: t
}) => {
  const d = Oe(r, a);
  return d == null ? null : Ga({
    panelId: e,
    field: a,
    value: d,
    op: n,
    label: t
  });
}, Le = (r) => {
  var a, n;
  if (!r)
    return "";
  if (r.label)
    return r.label;
  const e = ((a = r.filter) == null ? void 0 : a.values) || [];
  return `${((n = r.filter) == null ? void 0 : n.field) || "Filter"}: ${e.join(", ")}`;
}, Yt = (r = [], e) => e ? r.some((a) => a.id === e.id) : !1, Ja = ({ panelId: r, dimension: e, value: a }) => `${r || "panel"}:${e}:${String(a)}`, Qa = ({
  panelId: r,
  dimension: e,
  to: a,
  value: n,
  label: t
}) => {
  if (!e || n === void 0 || n === null)
    return null;
  const d = t ? `${t}: ${n}` : `${e}: ${n}`;
  return {
    id: Ja({ panelId: r, dimension: e, value: n }),
    sourcePanelId: r || null,
    dimension: e,
    to: a,
    value: n,
    label: d,
    /** @type {Filter} */
    filter: {
      field: e,
      op: "IN",
      values: [n]
    }
  };
}, Ut = ({
  event: r,
  panelId: e,
  dimension: a,
  to: n,
  label: t
}) => {
  const d = Oe(r, a);
  return d == null ? null : Qa({
    panelId: e,
    dimension: a,
    to: n,
    value: d,
    label: t
  });
}, Xa = ({
  dimensions: r = [],
  drillPath: e = [],
  drilldownConfig: a
}) => !a || !e.length ? r : e.reduce((n, t) => !(t != null && t.dimension) || !(t != null && t.to) ? n : n.map(
  (d) => d === t.dimension ? t.to : d
), [...r]), Wt = (r = [], e) => e ? r.some((a) => a.id === e.id) : !1, Dr = (r) => r ? r.label ? r.label : `${r.dimension || "Dimension"}: ${r.value}` : "", Za = (r) => r ? r.filter ? r.filter : r.filters ? r.filters : r.dimension && r.value !== void 0 ? {
  field: r.dimension,
  op: "IN",
  values: [r.value]
} : null : null, Ha = ({ globalFilters: r, selections: e, drillPath: a, panelFilters: n }) => {
  const t = (e || []).flatMap((o) => o.filter ? F(o.filter) : o.filters ? F(o.filters) : []), d = (a || []).flatMap(
    (o) => F(Za(o))
  );
  return [
    ...F(r),
    ...t,
    ...d,
    ...F(n)
  ].filter(Boolean);
}, rn = (r = {}, e = {}) => {
  var o;
  const a = r.query || {}, n = r.datasetId ?? e.datasetId ?? null, t = a.dimensions || [], d = Ha({
    globalFilters: e.globalFilters,
    selections: e.selections,
    drillPath: e.drillPath,
    panelFilters: a.filters
  });
  return Ua({
    datasetId: n,
    measures: a.measures || [],
    dimensions: Xa({
      dimensions: t,
      drillPath: e.drillPath,
      drilldownConfig: (o = r.interactions) == null ? void 0 : o.drilldown
    }),
    filters: d,
    timeRange: a.timeRange ?? e.timeRange ?? null,
    grain: a.grain ?? null,
    sort: a.sort ?? null,
    limit: a.limit ?? null,
    offset: a.offset ?? null,
    timezone: a.timezone ?? e.timezone ?? null,
    transforms: a.transforms || []
  });
}, Q = (r) => Array.isArray(r) ? r : [], de = (r, e = "Filter") => {
  if (!r)
    return e;
  const a = Q(r.values), n = a.length ? a.join(", ") : "Any";
  return `${r.field || e} ${r.op || "IN"} ${n}`;
}, Fe = (r) => r ? r.filter ? r.filter : r.filters ? r.filters : r.dimension && r.value !== void 0 ? {
  field: r.dimension,
  op: "IN",
  values: [r.value]
} : null : null, en = (r = []) => r.flatMap((e) => e.filter ? F(e.filter) : e.filters ? F(e.filters) : []), an = (r = []) => r.flatMap((e) => F(Fe(e))), nn = (r) => r.dashboardId, tn = (r) => r.datasetId, sn = (r) => r.globalFilters, dn = (r) => r.selections, on = (r) => r.drillPath, fn = (r) => r.panelStateById, ln = (r, e) => r.panelStateById[e] || {}, cn = (r, e = null) => {
  var d;
  const a = [];
  return F(r.globalFilters).forEach((o, i) => {
    a.push({
      id: `global-${o.field || "filter"}-${i}`,
      source: "global",
      field: o.field,
      op: o.op,
      values: Q(o.values),
      label: de(o, "Global filter")
    });
  }), (r.selections || []).forEach((o) => {
    F(o.filter || o.filters).forEach((c, u) => {
      a.push({
        id: `selection-${o.id || u}`,
        source: "selection",
        field: c.field,
        op: c.op,
        values: Q(c.values),
        label: o.label || Le(o)
      });
    });
  }), (r.drillPath || []).forEach((o, i) => {
    F(Fe(o)).forEach((u) => {
      a.push({
        id: `drill-${o.id || i}`,
        source: "drill",
        field: u.field,
        op: u.op,
        values: Q(u.values),
        label: o.label || Dr(o)
      });
    });
  }), F((d = e == null ? void 0 : e.query) == null ? void 0 : d.filters).forEach((o, i) => {
    a.push({
      id: `panel-${(e == null ? void 0 : e.id) || "panel"}-${i}`,
      source: "panel",
      field: o.field,
      op: o.op,
      values: Q(o.values),
      label: de(o, "Panel filter")
    });
  }), a;
}, un = (r) => (r.drillPath || []).map((e, a) => ({
  id: e.id || `${e.dimension || "dimension"}-${a}`,
  label: e.label || Dr(e),
  entry: e,
  index: a
})), pn = (r) => (r.selections || []).map((e) => {
  const a = F(e.filter || e.filters), n = a.map((d) => d.field).filter(Boolean), t = a.flatMap((d) => Q(d.values));
  return {
    selectionId: e.id,
    sourcePanelId: e.sourcePanelId ?? null,
    label: e.label || Le(e),
    fields: n,
    values: t
  };
}), bn = (r, e) => rn(e, r), mn = (r) => en(r.selections), vn = (r) => an(r.drillPath), Gt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  selectActiveFiltersSummary: cn,
  selectDashboardId: nn,
  selectDatasetId: tn,
  selectDerivedQueryInputs: bn,
  selectDrillBreadcrumbs: un,
  selectDrillFilters: vn,
  selectDrillPath: on,
  selectGlobalFilters: sn,
  selectPanelState: ln,
  selectPanelStateById: fn,
  selectSelectedEntities: pn,
  selectSelectionFilters: mn,
  selectSelections: dn
}, Symbol.toStringTag, { value: "Module" })), gn = (r, { validateResult: e } = {}) => ({
  execute: r,
  validateResult: e
}), hn = (r) => !!(r && typeof r.execute == "function"), _n = (r) => {
  if (!hn(r))
    throw new Error("DataProvider must implement execute(querySpec, options)");
  return r;
}, xn = (r, e) => new Promise((a, n) => {
  if (e != null && e.aborted) {
    n(new DOMException("Aborted", "AbortError"));
    return;
  }
  const t = setTimeout(a, r);
  e && e.addEventListener(
    "abort",
    () => {
      clearTimeout(t), n(new DOMException("Aborted", "AbortError"));
    },
    { once: !0 }
  );
}), yn = (r) => {
  let e = r;
  return () => {
    e += 1831565813;
    let a = Math.imul(e ^ e >>> 15, e | 1);
    return a ^= a + Math.imul(a ^ a >>> 7, a | 61), ((a ^ a >>> 14) >>> 0) / 4294967296;
  };
}, wn = (r) => {
  const e = JSON.stringify({
    datasetId: r.datasetId,
    measures: r.measures,
    dimensions: r.dimensions,
    filters: r.filters,
    grain: r.grain,
    timeRange: r.timeRange
  });
  let a = 2166136261;
  for (let n = 0; n < e.length; n += 1)
    a ^= e.charCodeAt(n), a = Math.imul(a, 16777619);
  return a >>> 0;
}, ur = (r) => Array.isArray(r) ? r : [], ze = (r) => r ? Array.isArray(r) ? { start: r[0], end: r[1] } : r.start || r.end ? { start: r.start ?? null, end: r.end ?? null } : null : null, ie = (r) => {
  if (!r)
    return null;
  const e = new Date(r);
  return Number.isNaN(e.getTime()) ? null : e;
}, En = (r) => r.toISOString().slice(0, 10), Sn = (r, e, a) => Math.min(a, Math.max(e, r)), jn = (r) => {
  const a = ur(r).find(
    (d) => {
      var o, i;
      return d && d.op === "BETWEEN" && Array.isArray(d.values) && d.values.length >= 2 && (((o = d.field) == null ? void 0 : o.includes("date")) || ((i = d.field) == null ? void 0 : i.includes("day")));
    }
  );
  if (!a)
    return null;
  const [n, t] = a.values;
  return !n && !t ? null : { start: n ?? null, end: t ?? null };
}, nr = {
  category: ["Alpha", "Beta", "Gamma", "Delta"],
  region: ["North", "South", "East", "West"],
  segment: ["Consumer", "SMB", "Enterprise"]
}, Rn = (r) => nr[r] ? nr[r] : r != null && r.includes("region") ? nr.region : r != null && r.includes("segment") ? nr.segment : r != null && r.includes("category") ? nr.category : ["A", "B", "C", "D"].map((a, n) => `${r || "dim"}-${a}${n + 1}`), Nn = ({ measures: r, dimensions: e, timeRange: a, random: n }) => {
  const t = ur(e);
  if (!t.length)
    return [
      r.reduce((c, u, p) => (c[u] = Math.round(500 + n() * 500 + p * 40), c), {})
    ];
  const d = [], o = t.map((c) => {
    if (c != null && c.includes("date") || c != null && c.includes("day")) {
      const u = ze(a), p = ie(u == null ? void 0 : u.start) ?? new Date(Date.now() - 6 * 864e5), m = ie(u == null ? void 0 : u.end) ?? /* @__PURE__ */ new Date(), g = Sn(Math.ceil((m - p) / 864e5) + 1, 2, 14);
      return Array.from({ length: g }, (N, T) => {
        const h = new Date(p);
        return h.setDate(h.getDate() + T), En(h);
      });
    }
    return Rn(c);
  }), i = (c, u) => {
    if (c >= t.length) {
      const m = { ...u };
      r.forEach((g, N) => {
        const T = n() * 0.3 + 0.85;
        m[g] = Math.round(200 * T + N * 50 + n() * 120);
      }), d.push(m);
      return;
    }
    const p = t[c];
    o[c].forEach((m, g) => {
      i(c + 1, {
        ...u,
        [p]: m,
        [`${p}_order`]: g
      });
    });
  };
  return i(0, {}), d;
}, kn = async (r, { signal: e } = {}) => {
  const a = wn(r), n = yn(a), t = 180 + Math.floor(n() * 220);
  await xn(t, e);
  const d = ur(r.measures), o = ur(r.dimensions), i = ze(r.timeRange) ?? jn(r.filters), c = Nn({
    measures: d,
    dimensions: o,
    timeRange: i,
    random: n
  }), u = c.reduce((p, m) => (d.forEach((g) => {
    p[g] = (p[g] || 0) + (m[g] || 0);
  }), p), {});
  return {
    rows: c,
    meta: {
      total: u,
      rowCount: c.length,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}, Jt = gn(kn), pr = (r) => !!(r && typeof r == "object" && !Array.isArray(r)), sr = (r) => pr(r) ? Object.keys(r).sort().reduce((e, a) => {
  const n = r[a];
  return n === void 0 || (e[a] = Array.isArray(n) ? n.map((t) => sr(t)) : pr(n) ? sr(n) : n), e;
}, {}) : r, Tn = (r) => {
  if (!Array.isArray(r))
    return r;
  const e = r.map(
    (n) => pr(n) ? sr(n) : n
  );
  return e.every(
    (n) => n === null || ["string", "number", "boolean"].includes(typeof n)
  ) ? [...e].sort() : e;
}, Dn = (r) => {
  if (!pr(r))
    return r;
  const e = Tn(
    r.values ?? (r.value !== void 0 ? [r.value] : [])
  );
  return {
    ...r,
    values: e
  };
}, Pn = (r) => Array.isArray(r) ? r.filter(Boolean).map((a) => Dn(a)).map((a) => ({
  sortKey: JSON.stringify(a),
  filter: a
})).sort((a, n) => a.sortKey.localeCompare(n.sortKey)).map((a) => a.filter) : [], oe = (r) => Array.isArray(r) ? [...r.filter(Boolean)].sort() : [], In = (r = {}) => ({
  datasetId: r.datasetId ?? null,
  measures: oe(r.measures),
  dimensions: oe(r.dimensions),
  filters: Pn(r.filters),
  timeRange: r.timeRange ?? null,
  grain: r.grain ?? null,
  sort: sr(r.sort ?? null),
  limit: r.limit ?? null,
  offset: r.offset ?? null,
  timezone: r.timezone ?? null,
  transforms: Array.isArray(r.transforms) ? r.transforms.map((e) => sr(e)) : []
}), Rr = (r) => Array.isArray(r) ? `[${r.map((e) => Rr(e)).join(",")}]` : r && typeof r == "object" ? `{${Object.keys(r).sort().map((a) => `${JSON.stringify(a)}:${Rr(r[a])}`).join(",")}}` : JSON.stringify(r), $n = (r) => {
  let e = 5381;
  for (let a = 0; a < r.length; a += 1)
    e = e * 33 ^ r.charCodeAt(a);
  return (e >>> 0).toString(16);
}, On = (r = {}) => {
  const e = In(r), a = Rr(e);
  return `qs_${$n(a)}`;
}, Ln = () => /* @__PURE__ */ new Map(), fe = (r, e, a) => {
  r.has(e) && r.delete(e), r.set(e, a);
}, Fn = ({ maxSize: r = 500 } = {}) => {
  const e = Ln(), a = () => {
    if (r <= 0) {
      e.clear();
      return;
    }
    for (; e.size > r; ) {
      const n = e.keys().next().value;
      e.delete(n);
    }
  };
  return {
    get: (n) => {
      if (!e.has(n))
        return;
      const t = e.get(n);
      return fe(e, n, t), t;
    },
    set: (n, t) => (fe(e, n, t), a(), t),
    has: (n) => e.has(n),
    delete: (n) => e.delete(n),
    clear: () => e.clear(),
    entries: () => Array.from(e.entries()),
    size: () => e.size,
    prune: a
  };
}, zn = Fn(), Nr = () => Date.now(), Ae = (r) => !!(r && typeof r == "object" && !Array.isArray(r)), An = (r) => {
  const e = [];
  return Array.isArray(r == null ? void 0 : r.rows) || e.push("rows must be an array"), (r == null ? void 0 : r.meta) != null && !Ae(r.meta) && e.push("meta must be an object when provided"), e;
}, Cn = (r, e, a) => {
  if (!r)
    return [];
  try {
    const n = r(e, a);
    return n == null || n === !0 ? [] : n === !1 ? ["custom validation failed"] : typeof n == "string" ? [n] : Array.isArray(n) ? n : typeof n == "object" && n.valid === !1 ? Array.isArray(n.errors) ? n.errors : typeof n.error == "string" ? [n.error] : ["custom validation failed"] : [];
  } catch (n) {
    return [(n == null ? void 0 : n.message) || "custom validation threw an error"];
  }
}, Mn = (r) => ({
  rows: Array.isArray(r == null ? void 0 : r.rows) ? r.rows : [],
  meta: Ae(r == null ? void 0 : r.meta) ? r.meta : null
}), le = (r) => ({
  status: (r == null ? void 0 : r.status) ?? "idle",
  data: (r == null ? void 0 : r.data) ?? null,
  meta: (r == null ? void 0 : r.meta) ?? null,
  error: (r == null ? void 0 : r.error) ?? null,
  updatedAt: (r == null ? void 0 : r.updatedAt) ?? null
}), ce = (r, e) => !(r != null && r.updatedAt) || e === 0 ? !0 : e === 1 / 0 ? !1 : Nr() - r.updatedAt > e, Qt = (r, {
  provider: e,
  cache: a = zn,
  staleTime: n = 3e4,
  enabled: t = !0,
  onSuccess: d,
  onError: o,
  validateResult: i,
  strictResultValidation: c = !1
} = {}) => {
  const u = A(() => _n(e), [e]), p = A(() => On(r), [r]), m = ja(null), [g, N] = Se(
    () => le(a.get(p))
  ), T = je(async (h) => {
    const w = a.get(h);
    if (w != null && w.promise)
      return w.promise;
    const x = new AbortController();
    m.current = x;
    const R = u.execute(r, { signal: x.signal }).then((S) => {
      const O = i || (u == null ? void 0 : u.validateResult), P = [
        ...An(S),
        ...Cn(O, S, r)
      ].filter(Boolean);
      if (P.length > 0) {
        const dr = `Invalid provider result: ${P.join("; ")}`;
        if (c)
          throw new Error(dr);
        console.warn(dr, { result: S, querySpec: r });
      }
      const q = Mn(S), C = {
        status: "success",
        data: P.length > 0 ? [] : q.rows,
        meta: P.length > 0 ? null : q.meta,
        error: null,
        updatedAt: Nr()
      };
      return a.set(h, C), a.prune && a.prune(), N(C), d && d(C), C;
    }).catch((S) => {
      if ((S == null ? void 0 : S.name) === "AbortError")
        return null;
      const O = {
        status: "error",
        data: null,
        meta: null,
        error: S,
        updatedAt: Nr()
      };
      return a.set(h, O), a.prune && a.prune(), N(O), o && o(S), O;
    }).finally(() => {
      const S = a.get(h);
      (S == null ? void 0 : S.promise) === R && a.set(h, { ...S, promise: null });
    });
    return a.set(h, {
      status: (w == null ? void 0 : w.status) ?? "loading",
      data: (w == null ? void 0 : w.data) ?? null,
      meta: (w == null ? void 0 : w.meta) ?? null,
      error: (w == null ? void 0 : w.error) ?? null,
      updatedAt: (w == null ? void 0 : w.updatedAt) ?? null,
      promise: R
    }), a.prune && a.prune(), R;
  }, [
    u,
    a,
    o,
    d,
    r,
    c,
    i
  ]);
  return Re(() => {
    if (!t)
      return;
    const h = a.get(p);
    return h != null && h.data ? N(le(h)) : h || N((w) => ({
      ...w,
      status: "loading",
      error: null
    })), (!h || ce(h, n)) && T(p), () => {
      m.current && m.current.abort();
    };
  }, [p, t, n, a, T]), {
    data: g.data,
    meta: g.meta,
    loading: g.status === "loading",
    error: g.error,
    status: g.status,
    updatedAt: g.updatedAt,
    isStale: ce(a.get(p), n),
    refetch: () => T(p)
  };
}, Ce = (r = "registry") => {
  const e = /* @__PURE__ */ new Map();
  return {
    label: r,
    register: (n, t) => {
      if (!n)
        throw new Error(`${r} key is required.`);
      if (!t)
        throw new Error(`${r} component is required.`);
      return e.set(n, t), t;
    },
    get: (n) => e.get(n),
    has: (n) => e.has(n),
    list: () => Array.from(e.keys())
  };
}, Me = Ce("vizRegistry"), kr = Ce("insightRegistry"), wr = (r, e) => Me.register(r, e), Er = (r, e) => kr.register(r, e);
function Ve({ title: r, subtitle: e, footer: a, children: n }) {
  return /* @__PURE__ */ f.jsxs("div", { className: "radf-chart", children: [
    (r || e) && /* @__PURE__ */ f.jsx("div", { className: "radf-chart__header", children: /* @__PURE__ */ f.jsxs("div", { className: "radf-chart__heading", children: [
      r ? /* @__PURE__ */ f.jsx("p", { className: "radf-chart__title", children: r }) : null,
      e ? /* @__PURE__ */ f.jsx("p", { className: "radf-chart__subtitle", children: e }) : null
    ] }) }),
    /* @__PURE__ */ f.jsx("div", { className: "radf-chart__canvas", children: n }),
    a ? /* @__PURE__ */ f.jsx("div", { className: "radf-chart__footer", children: a }) : null
  ] });
}
const Vn = "analytics", ue = 12, qn = 9, Bn = 4, pe = (r = Vn) => `radf-palette-${r}`, qe = (r, e, a) => Number.isFinite(r) ? Math.min(a, Math.max(e, Math.trunc(r))) : e, Z = (r, e = ue) => {
  const a = Number.isInteger(r) ? r : 0, n = Number.isInteger(e) && e > 0 ? e : ue;
  return `var(--radf-series-${(a % n + n) % n + 1})`;
}, Sr = (r) => `var(--radf-seq-${qe(r, 1, qn)})`, W = (r, e) => {
  if (r === "zero")
    return "var(--radf-div-zero)";
  const a = qe(e, 1, Bn);
  return `var(--radf-div-${r === "neg" ? "neg" : "pos"}-${a})`;
}, Be = 12, Kn = (r) => {
  if (!Array.isArray(r))
    return [];
  const e = /* @__PURE__ */ new Set(), a = [];
  return r.forEach((n) => {
    if (n == null)
      return;
    const t = String(n);
    e.has(t) || (e.add(t), a.push(t));
  }), a;
}, X = (r, e = Be) => Z(r, e), Ke = (r) => Kn(r).reduce((a, n, t) => (a[n] = X(t, Be), a), {}), be = 12, Yn = Array.from(
  { length: be },
  (r, e) => X(e, be)
), Un = (r) => `radf-chart-color-${(Number.isInteger(r) ? r : 0) % Yn.length}`;
function Ye({ active: r, label: e, payload: a }) {
  return !r || !a || a.length === 0 ? null : /* @__PURE__ */ f.jsxs("div", { className: "radf-chart-tooltip", children: [
    e ? /* @__PURE__ */ f.jsx("p", { className: "radf-chart-tooltip__label", children: e }) : null,
    /* @__PURE__ */ f.jsx("ul", { className: "radf-chart-tooltip__list", children: a.map((n, t) => /* @__PURE__ */ f.jsxs("li", { className: "radf-chart-tooltip__item", children: [
      /* @__PURE__ */ f.jsx(
        "span",
        {
          className: [
            "radf-chart-tooltip__swatch",
            Un(t)
          ].join(" ")
        }
      ),
      /* @__PURE__ */ f.jsx("span", { className: "radf-chart-tooltip__name", children: n.name }),
      /* @__PURE__ */ f.jsx("span", { className: "radf-chart-tooltip__value", children: n.value })
    ] }, n.dataKey || n.name || t)) })
  ] });
}
const Wn = (r, e) => r ? Array.isArray(r.y) ? r.y : r.y ? [r.y] : e != null && e.length ? Object.keys(e[0]).filter((a) => a !== r.x) : [] : [];
function Gn({
  data: r = [],
  encodings: e = {},
  options: a = {},
  handlers: n = {},
  colorAssignment: t,
  hiddenKeys: d
}) {
  const o = (t == null ? void 0 : t.mode) === "series" || (t == null ? void 0 : t.mode) === "single" ? t.items.map((h) => h.key) : [], i = o.length ? o : Wn(e, r), c = i.filter(
    (h) => !(d != null && d.has(String(h)))
  ), u = a.tooltip !== !1, p = a.brush || {}, m = !!p.enabled && r.length > 1, g = A(
    () => Ke(i),
    [i]
  ), N = typeof p.startIndex == "number" ? p.startIndex : void 0, T = typeof p.endIndex == "number" ? p.endIndex : void 0;
  return /* @__PURE__ */ f.jsx(Ve, { children: /* @__PURE__ */ f.jsx(Ne, { width: "100%", height: 280, children: /* @__PURE__ */ f.jsxs(Ra, { data: r, margin: { top: 8, right: 16, left: 0, bottom: 8 }, children: [
    /* @__PURE__ */ f.jsx(ke, { stroke: "var(--radf-chart-grid)", strokeDasharray: "3 3" }),
    /* @__PURE__ */ f.jsx(
      Te,
      {
        dataKey: e.x,
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    /* @__PURE__ */ f.jsx(
      De,
      {
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    u ? /* @__PURE__ */ f.jsx(Pe, { content: /* @__PURE__ */ f.jsx(Ye, {}) }) : null,
    c.map((h, w) => {
      var x;
      return /* @__PURE__ */ f.jsx(
        Na,
        {
          type: "monotone",
          dataKey: h,
          stroke: ((x = t == null ? void 0 : t.getColor) == null ? void 0 : x.call(t, h)) || g[h] || X(w),
          strokeWidth: 2,
          dot: { r: 3 },
          activeDot: { r: 5, onClick: n.onClick },
          onClick: n.onClick
        },
        h
      );
    }),
    m ? /* @__PURE__ */ f.jsx(
      ka,
      {
        className: "radf-chart__brush",
        dataKey: e.x,
        height: 24,
        travellerWidth: 12,
        stroke: "var(--radf-accent-primary)",
        startIndex: N,
        endIndex: T,
        onChange: (h) => {
          n.onBrushChange && n.onBrushChange({
            ...h,
            data: r,
            dataKey: e.x
          });
        }
      }
    ) : null
  ] }) }) });
}
const Jn = (r, e) => r ? Array.isArray(r.y) ? r.y : r.y ? [r.y] : e != null && e.length ? Object.keys(e[0]).filter((a) => a !== r.x) : [] : [];
function Qn({
  data: r = [],
  encodings: e = {},
  options: a = {},
  handlers: n = {},
  colorAssignment: t,
  hiddenKeys: d
}) {
  var w;
  const o = (t == null ? void 0 : t.mode) === "series" || (t == null ? void 0 : t.mode) === "single" ? t.items.map((x) => x.key) : [], i = o.length ? o : Jn(e, r), c = a.tooltip !== !1, u = a.stacked === !0 || Array.isArray(a.stackedKeys), p = A(
    () => Ke(i),
    [i]
  ), m = i.filter(
    (x) => !(d != null && d.has(String(x)))
  ), g = (t == null ? void 0 : t.mode) === "category", N = (t == null ? void 0 : t.mode) === "series", T = (t == null ? void 0 : t.mode) === "category" || (t == null ? void 0 : t.mode) === "diverging" || (t == null ? void 0 : t.mode) === "sequential", h = g && (d != null && d.size) ? r.filter((x) => !d.has(String(x == null ? void 0 : x[e.x]))) : r;
  return /* @__PURE__ */ f.jsx(Ve, { children: /* @__PURE__ */ f.jsx(Ne, { width: "100%", height: 280, children: /* @__PURE__ */ f.jsxs(Ta, { data: h, margin: { top: 8, right: 16, left: 0, bottom: 8 }, children: [
    /* @__PURE__ */ f.jsx(ke, { stroke: "var(--radf-chart-grid)", strokeDasharray: "3 3" }),
    /* @__PURE__ */ f.jsx(
      Te,
      {
        dataKey: e.x,
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    /* @__PURE__ */ f.jsx(
      De,
      {
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    c ? /* @__PURE__ */ f.jsx(Pe, { content: /* @__PURE__ */ f.jsx(Ye, {}) }) : null,
    N ? m.map((x, R) => {
      var S;
      return /* @__PURE__ */ f.jsx(
        ne,
        {
          dataKey: x,
          fill: ((S = t == null ? void 0 : t.getColor) == null ? void 0 : S.call(t, x)) || p[x] || X(R),
          stackId: u ? "radf-stack" : void 0,
          radius: [6, 6, 0, 0],
          onClick: n.onClick
        },
        x
      );
    }) : /* @__PURE__ */ f.jsx(
      ne,
      {
        dataKey: e.y,
        fill: ((w = t == null ? void 0 : t.getColor) == null ? void 0 : w.call(t, e.y)) || X(0),
        radius: [6, 6, 0, 0],
        onClick: n.onClick,
        children: T ? h.map((x, R) => {
          var q, C;
          const S = x == null ? void 0 : x[e.x], O = x == null ? void 0 : x[e.y], P = (t == null ? void 0 : t.mode) === "category" ? (q = t == null ? void 0 : t.getColor) == null ? void 0 : q.call(t, S) : (C = t == null ? void 0 : t.getColor) == null ? void 0 : C.call(t, O);
          return /* @__PURE__ */ f.jsx(
            Da,
            {
              fill: P || X(R)
            },
            `cell-${R}`
          );
        }) : null
      }
    )
  ] }) }) });
}
const Xn = (r, e) => r != null && r.value ? r.value : r != null && r.y ? r.y : e != null && e.length ? Object.keys(e[0]).find((a) => typeof e[0][a] == "number") : null, Zn = (r, e, a = {}) => r == null || Number.isNaN(r) ? "--" : typeof r != "number" ? String(r) : e === "currency" ? r.toLocaleString(void 0, {
  style: "currency",
  currency: a.currency || "USD",
  maximumFractionDigits: 0
}) : e === "percent" ? `${(r * 100).toFixed(1)}%` : e === "integer" ? Math.round(r).toLocaleString() : r.toLocaleString(void 0, { maximumFractionDigits: 2 });
function Hn({ data: r = [], encodings: e = {}, options: a = {} }) {
  var i;
  const n = A(() => Xn(e, r), [e, r]), t = n ? (i = r == null ? void 0 : r[0]) == null ? void 0 : i[n] : null, d = Zn(t, a.format, a), o = a.label || (e == null ? void 0 : e.label);
  return /* @__PURE__ */ f.jsxs("div", { className: "radf-kpi", children: [
    o ? /* @__PURE__ */ f.jsx("div", { className: "radf-kpi__label", children: o }) : null,
    /* @__PURE__ */ f.jsx("div", { className: "radf-kpi__value", children: d }),
    a.caption ? /* @__PURE__ */ f.jsx("div", { className: "radf-kpi__caption", children: a.caption }) : null
  ] });
}
const Xt = () => {
  wr("line", Gn), wr("bar", Qn), wr("kpi", Hn);
}, Pr = (r, e) => {
  var t;
  if ((t = e == null ? void 0 : e.measures) != null && t.length)
    return e.measures[0];
  const a = r == null ? void 0 : r[0];
  return a && Object.keys(a).find((d) => typeof a[d] == "number") || null;
}, G = (r) => r == null || Number.isNaN(r) ? "0" : Number(r).toLocaleString(void 0, { maximumFractionDigits: 2 }), rt = (r, e) => (r || []).map((a) => Number(a == null ? void 0 : a[e])).filter((a) => Number.isFinite(a)), et = ({ rows: r, querySpec: e, meta: a }) => {
  const n = Pr(r, e);
  if (!n)
    return [];
  const t = rt(r, n);
  if (t.length < 2)
    return [];
  const d = t[0], o = t[t.length - 1], i = o - d, c = d !== 0 ? i / Math.abs(d) : null, u = i > 0 ? "upward" : i < 0 ? "downward" : "flat", p = c != null ? Math.abs(c) : null, m = p == null ? "info" : p > 0.2 ? "positive" : p > 0.08 ? "info" : "neutral", g = c == null ? null : `${Math.abs(c * 100).toFixed(1)}%`, N = (a == null ? void 0 : a.rowCount) ?? (r == null ? void 0 : r.length) ?? 0, T = u === "flat" ? `The ${n} metric stayed flat across ${N} points.` : `The ${n} metric moved ${u}, changing ${g || G(Math.abs(i))} from ${G(d)} to ${G(o)} across ${N} points.`;
  return {
    title: `Trend is ${u}`,
    severity: m,
    narrative: T,
    recommendedAction: u === "downward" ? "Investigate recent drivers impacting the downward shift." : u === "upward" ? "Sustain the current momentum and identify leading contributors." : "Monitor for any emerging shifts over the next period.",
    evidence: [
      `Start: ${G(d)}`,
      `End: ${G(o)}`,
      g ? `Net change: ${g}` : `Net change: ${G(i)}`
    ]
  };
}, me = {
  id: "trend",
  label: "Trend Summary",
  analyze: et
}, at = (r) => r.reduce((e, a) => e + a, 0) / r.length, nt = (r, e) => {
  const a = r.reduce((n, t) => n + (t - e) ** 2, 0) / r.length;
  return Math.sqrt(a);
}, tt = ({ rows: r, querySpec: e }) => {
  const a = Pr(r, e);
  if (!a)
    return [];
  const n = (r || []).map((c) => Number(c == null ? void 0 : c[a])).filter((c) => Number.isFinite(c));
  if (n.length < 5)
    return [];
  const t = n[n.length - 1], d = at(n.slice(0, -1)), o = nt(n.slice(0, -1), d);
  if (o === 0)
    return [];
  const i = (t - d) / o;
  return Math.abs(i) < 2.2 ? [] : {
    title: "Recent anomaly detected",
    severity: i > 0 ? "warning" : "negative",
    narrative: `The latest ${a} value deviates from the recent average by ${Math.abs(i).toFixed(1)} standard deviations.`,
    recommendedAction: "Review the contributing drivers behind this spike or dip.",
    evidence: [
      `Latest value: ${t.toLocaleString()}`,
      `Recent average: ${d.toFixed(1)}`
    ]
  };
}, ve = {
  id: "anomaly",
  label: "Anomaly Detection",
  analyze: tt
}, st = ({ rows: r, querySpec: e }) => {
  var p;
  const a = (p = e == null ? void 0 : e.dimensions) == null ? void 0 : p[0], n = Pr(r, e);
  if (!a || !n)
    return [];
  const t = (r || []).filter((m) => m && m[a] != null);
  if (t.length < 2)
    return [];
  const d = t.reduce((m, g) => m + Number(g[n] || 0), 0);
  if (!d)
    return [];
  const o = [...t].sort((m, g) => (g[n] || 0) - (m[n] || 0)), i = o[0], c = Number(i[n] || 0) / d;
  if (c < 0.2)
    return [];
  const u = o.slice(0, 3).map((m) => {
    const g = Number(m[n] || 0), N = d ? `${(g / d * 100).toFixed(1)}%` : "0%";
    return `${m[a]}: ${g.toLocaleString()} (${N})`;
  });
  return {
    title: `Top driver: ${i[a]}`,
    severity: "info",
    narrative: `${i[a]} contributes ${(c * 100).toFixed(1)}% of ${n}.`,
    recommendedAction: `Validate why ${i[a]} is outpacing other segments and replicate the drivers if positive.`,
    evidence: u
  };
}, ge = {
  id: "topDrivers",
  label: "Top Drivers",
  analyze: st
}, Zt = () => {
  Er(me.id, me), Er(ve.id, ve), Er(ge.id, ge);
}, dt = 12, cr = (r, e) => typeof r != "number" || Number.isNaN(r) ? e : r > 0 ? r : e, it = (r) => {
  if (!r)
    return "radf-grid__item";
  const e = cr(r.x, 1), a = cr(r.y, 1), n = cr(r.w, dt), t = cr(r.h, 1);
  return [
    "radf-grid__item",
    `radf-grid__item--col-start-${e}`,
    `radf-grid__item--col-span-${n}`,
    `radf-grid__item--row-start-${a}`,
    `radf-grid__item--row-span-${t}`
  ].join(" ");
};
function Ht({ panels: r, renderPanel: e, className: a }) {
  const n = ["radf-grid", a].filter(Boolean).join(" ");
  return /* @__PURE__ */ f.jsx("div", { className: n, children: r.map((t) => /* @__PURE__ */ f.jsx("div", { className: it(t.layout), children: e(t) }, t.id)) });
}
function ot({ title: r, subtitle: e, actions: a }) {
  return !r && !e && !a ? null : /* @__PURE__ */ f.jsxs("div", { className: "radf-panel__header", children: [
    /* @__PURE__ */ f.jsxs("div", { className: "radf-panel__heading", children: [
      r ? /* @__PURE__ */ f.jsx("h2", { className: "radf-panel__title", children: r }) : null,
      e ? /* @__PURE__ */ f.jsx("p", { className: "radf-panel__subtitle", children: e }) : null
    ] }),
    a ? /* @__PURE__ */ f.jsx("div", { className: "radf-panel__actions", children: a }) : null
  ] });
}
function ft({ message: r = "Loading data…" }) {
  return /* @__PURE__ */ f.jsxs("div", { className: "radf-panel__state radf-panel__state--loading", children: [
    /* @__PURE__ */ f.jsx("span", { className: "radf-panel__state-icon", "aria-hidden": "true", children: "⏳" }),
    /* @__PURE__ */ f.jsx("p", { className: "radf-panel__state-text", children: r })
  ] });
}
function lt({ title: r = "No data yet", message: e = "Try adjusting filters or refreshing the panel." }) {
  return /* @__PURE__ */ f.jsxs("div", { className: "radf-panel__state radf-panel__state--empty", children: [
    /* @__PURE__ */ f.jsx("p", { className: "radf-panel__state-title", children: r }),
    /* @__PURE__ */ f.jsx("p", { className: "radf-panel__state-text", children: e })
  ] });
}
function ct({ title: r = "Something went wrong", message: e = "Please try again." }) {
  return /* @__PURE__ */ f.jsxs("div", { className: "radf-panel__state radf-panel__state--error", children: [
    /* @__PURE__ */ f.jsx("p", { className: "radf-panel__state-title", children: r }),
    /* @__PURE__ */ f.jsx("p", { className: "radf-panel__state-text", children: e })
  ] });
}
const ut = (r) => r ? typeof r == "string" ? r : r.message || "Something went wrong." : null;
function pt({ status: r = "ready", isEmpty: e = !1, emptyMessage: a, error: n, children: t }) {
  let d = /* @__PURE__ */ f.jsx("div", { className: "radf-panel__content", children: t });
  return r === "loading" && (d = /* @__PURE__ */ f.jsx(ft, {})), r === "error" && (d = /* @__PURE__ */ f.jsx(ct, { message: ut(n) })), (r === "empty" || e) && (d = /* @__PURE__ */ f.jsx(lt, { message: a })), /* @__PURE__ */ f.jsx("div", { className: "radf-panel__body", children: d });
}
function rs({
  title: r,
  subtitle: e,
  actions: a,
  className: n,
  status: t,
  error: d,
  isEmpty: o,
  emptyMessage: i,
  footer: c,
  children: u
}) {
  const p = ["radf-panel", n].filter(Boolean).join(" ");
  return /* @__PURE__ */ f.jsxs("section", { className: p, children: [
    /* @__PURE__ */ f.jsx(ot, { title: r, subtitle: e, actions: a }),
    /* @__PURE__ */ f.jsx(
      pt,
      {
        status: t,
        error: d,
        isEmpty: o,
        emptyMessage: i,
        children: u
      }
    ),
    c ? /* @__PURE__ */ f.jsx("div", { className: "radf-panel__footer", children: c }) : null
  ] });
}
const bt = "Something went wrong", mt = "An unexpected error occurred. You can try reloading the page to continue.";
class es extends Tr.Component {
  constructor(e) {
    super(e), this.state = { hasError: !1, error: null }, this.handleReset = this.handleReset.bind(this);
  }
  /**
   * Updates local state so the fallback UI renders after an error.
   *
   * @param {Error} error
   * @returns {{hasError: boolean, error: Error}}
   */
  static getDerivedStateFromError(e) {
    return { hasError: !0, error: e };
  }
  /**
   * Lifecycle hook invoked after an error is thrown within children.
   *
   * @param {Error} error
   * @param {React.ErrorInfo} info
   * @returns {void}
   */
  componentDidCatch(e, a) {
    this.props.onError && this.props.onError(e, a);
  }
  /**
   * Resets the boundary to render children again.
   *
   * @returns {void}
   */
  handleReset() {
    this.setState({ hasError: !1, error: null }), this.props.onReset && this.props.onReset();
  }
  /**
   * Renders children or fallback UI when an error has been caught.
   *
   * Uses:
   * - `radf-error-boundary`
   * - `radf-error-boundary__content`
   * - `radf-error-boundary__title`
   * - `radf-error-boundary__message`
   * - `radf-error-boundary__action`
   *
   * @returns {JSX.Element | React.ReactNode}
   */
  render() {
    const { hasError: e } = this.state;
    if (!e)
      return this.props.children;
    const a = this.props.title || bt, n = this.props.message || mt;
    return /* @__PURE__ */ f.jsx("section", { className: "radf-error-boundary", children: /* @__PURE__ */ f.jsxs("div", { className: "radf-error-boundary__content", children: [
      /* @__PURE__ */ f.jsx("h2", { className: "radf-error-boundary__title", children: a }),
      /* @__PURE__ */ f.jsx("p", { className: "radf-error-boundary__message", children: n }),
      /* @__PURE__ */ f.jsx(
        "button",
        {
          className: "radf-button radf-error-boundary__action",
          type: "button",
          onClick: this.handleReset,
          children: "Reload dashboard"
        }
      )
    ] }) });
  }
}
const vt = /* @__PURE__ */ new Set(["kpi", "text", "metric", "number", "markdown"]), gt = /* @__PURE__ */ new Set(["line", "area", "composed", "time-series", "timeseries"]), ht = /* @__PURE__ */ new Set(["bar", "column", "histogram"]), _t = /* @__PURE__ */ new Set(["heatmap", "choropleth", "density"]), M = (r) => r == null ? null : String(r), tr = (r) => {
  if (!Array.isArray(r))
    return [];
  const e = /* @__PURE__ */ new Set(), a = [];
  return r.forEach((n) => {
    const t = M(n);
    !t || e.has(t) || (e.add(t), a.push(t));
  }), a;
}, Ue = (r) => Array.isArray(r == null ? void 0 : r.series) ? r.series.map((e) => ({
  key: M(e == null ? void 0 : e.key),
  label: (e == null ? void 0 : e.label) ?? M(e == null ? void 0 : e.key)
})).filter((e) => e.key) : [], xt = ({ encodings: r, options: e, panelConfig: a, data: n }) => {
  const t = Ue(a);
  if (t.length)
    return t.map((d) => d.key);
  if (Array.isArray(e == null ? void 0 : e.seriesKeys) && e.seriesKeys.length)
    return tr(e.seriesKeys);
  if (Array.isArray(e == null ? void 0 : e.stackedKeys) && e.stackedKeys.length)
    return tr(e.stackedKeys);
  if (Array.isArray(r == null ? void 0 : r.y))
    return tr(r.y);
  if (r != null && r.y)
    return tr([r.y]);
  if (Array.isArray(n) && n.length > 0) {
    const d = n[0] || {};
    return tr(Object.keys(d).filter((o) => o !== (r == null ? void 0 : r.x)));
  }
  return [];
}, he = (r) => Array.isArray(r == null ? void 0 : r.y) ? r.y[0] : (r == null ? void 0 : r.y) ?? null, yt = ({ panelConfig: r, vizType: e, options: a }) => r != null && r.paletteIntent ? r.paletteIntent : (a == null ? void 0 : a.diverging) === !0 ? "diverging" : _t.has(e) ? "sequential" : "categorical", J = ({ seriesKeys: r, seriesDefinitions: e }) => {
  const a = new Map(e.map((d) => [d.key, d.label])), n = r.map((d, o) => ({
    key: d,
    label: a.get(d) ?? d,
    colorVar: Z(o)
  })), t = new Map(n.map((d) => [d.key, d.colorVar]));
  return {
    items: n,
    getColor: (d) => t.get(M(d)) ?? Z(0),
    getLabel: (d) => a.get(M(d)) ?? M(d)
  };
}, wt = ({ data: r, xKey: e }) => {
  const a = Array.isArray(r) ? r.map((i) => i == null ? void 0 : i[e]).filter((i) => i != null) : [], n = Array.from(new Set(a)), t = n.every((i) => typeof i == "number");
  n.sort((i, c) => t ? i - c : String(i).localeCompare(String(c), void 0, { numeric: !0 }));
  const d = n.map((i, c) => {
    const u = M(i);
    return {
      key: u,
      label: u,
      colorVar: Z(c)
    };
  }), o = new Map(d.map((i) => [i.key, i.colorVar]));
  return {
    items: d,
    getColor: (i) => o.get(M(i)) ?? Z(0),
    getLabel: (i) => M(i)
  };
}, Et = ({ data: r, valueKey: e }) => {
  const a = Array.isArray(r) ? r.map((u) => u == null ? void 0 : u[e]).filter((u) => typeof u == "number" && Number.isFinite(u)) : [];
  let n = 0, t = 0;
  a.forEach((u) => {
    n = Math.min(n, u), t = Math.max(t, u);
  });
  const d = Math.max(Math.abs(n), Math.abs(t)), o = n < 0 && t > 0;
  return {
    items: [
      { key: "neg", label: "Negative", colorVar: W("neg", 3) },
      { key: "zero", label: "Neutral", colorVar: W("zero") },
      { key: "pos", label: "Positive", colorVar: W("pos", 3) }
    ],
    getColor: (u) => {
      if (!o || !Number.isFinite(u))
        return Z(0);
      if (u === 0)
        return W("zero");
      if (d === 0)
        return W(u < 0 ? "neg" : "pos", 1);
      const p = Math.min(1, Math.abs(u) / d), m = Math.max(1, Math.ceil(p * 4));
      return W(u < 0 ? "neg" : "pos", m);
    },
    getLabel: (u) => u === "neg" ? "Negative" : u === "pos" ? "Positive" : u === "zero" ? "Neutral" : null
  };
}, St = ({ data: r, valueKey: e }) => {
  const a = Array.isArray(r) ? r.map((i) => i == null ? void 0 : i[e]).filter((i) => typeof i == "number" && Number.isFinite(i)) : [];
  let n = 0, t = 0;
  a.forEach((i) => {
    n = Math.min(n, i), t = Math.max(t, i);
  });
  const d = t - n;
  return {
    items: [],
    getColor: (i) => {
      if (!Number.isFinite(i))
        return Sr(1);
      if (d === 0)
        return Sr(5);
      const c = (i - n) / d, u = Math.max(1, Math.min(9, Math.ceil(c * 9)));
      return Sr(u);
    },
    getLabel: () => null
  };
}, jt = ({
  panelConfig: r,
  vizType: e,
  encodings: a,
  options: n,
  data: t
}) => {
  if ((r == null ? void 0 : r.panelType) !== "viz" || vt.has(e))
    return null;
  const d = yt({ panelConfig: r, vizType: e, options: n });
  if (d === "none")
    return null;
  const o = Ue(r), i = xt({ encodings: a, options: n, panelConfig: r, data: t }), c = o.length > 0 || Array.isArray(a == null ? void 0 : a.y) || Array.isArray(n == null ? void 0 : n.seriesKeys) && n.seriesKeys.length > 1 || Array.isArray(n == null ? void 0 : n.stackedKeys) && n.stackedKeys.length > 0;
  if (d === "diverging" && (n == null ? void 0 : n.diverging) === !0) {
    const p = he(a);
    return {
      mode: "diverging",
      ...Et({ data: t, valueKey: p })
    };
  }
  if (d === "sequential") {
    const p = he(a);
    return {
      mode: "sequential",
      ...St({ data: t, valueKey: p })
    };
  }
  return gt.has(e) ? c ? {
    mode: "series",
    ...J({ seriesKeys: i, seriesDefinitions: o })
  } : { mode: "single", ...J({
    seriesKeys: i.slice(0, 1),
    seriesDefinitions: o
  }) } : ht.has(e) ? c ? {
    mode: "series",
    ...J({ seriesKeys: i, seriesDefinitions: o })
  } : (n == null ? void 0 : n.colorBy) === "category" || (n == null ? void 0 : n.legendMode) === "category" || (n == null ? void 0 : n.legend) === !0 ? {
    mode: "category",
    ...wt({ data: t, xKey: a == null ? void 0 : a.x })
  } : { mode: "single", ...J({
    seriesKeys: i.slice(0, 1),
    seriesDefinitions: o
  }) } : i.length > 1 ? {
    mode: "series",
    ...J({ seriesKeys: i, seriesDefinitions: o })
  } : { mode: "single", ...J({
    seriesKeys: i.slice(0, 1),
    seriesDefinitions: o
  }) };
}, Rt = (r) => {
  if (typeof r != "string")
    return "radf-swatch--1";
  const e = r.match(/--radf-series-(\d+)/);
  if (e)
    return `radf-swatch--${e[1]}`;
  const a = r.match(/--radf-seq-(\d+)/);
  if (a)
    return `radf-swatch--seq-${a[1]}`;
  const n = r.match(/--radf-div-neg-(\d+)/);
  if (n)
    return `radf-swatch--div-neg-${n[1]}`;
  const t = r.match(/--radf-div-pos-(\d+)/);
  return t ? `radf-swatch--div-pos-${t[1]}` : r.includes("--radf-div-zero") ? "radf-swatch--div-zero" : "radf-swatch--1";
};
function Nt({
  items: r = [],
  hiddenKeys: e,
  onToggle: a,
  position: n = "bottom"
}) {
  if (!r.length)
    return null;
  const t = typeof a == "function";
  return /* @__PURE__ */ f.jsx("div", { className: ["radf-legend", `radf-legend--${n}`].join(" "), children: /* @__PURE__ */ f.jsx("ul", { className: "radf-legend__list", children: r.map((d) => {
    const o = e == null ? void 0 : e.has(d.key), i = Rt(d.colorVar);
    return /* @__PURE__ */ f.jsx(
      "li",
      {
        className: [
          "radf-legend__item",
          i,
          t ? "radf-legend__item--toggleable" : "",
          o ? "radf-legend__item--hidden" : ""
        ].filter(Boolean).join(" "),
        children: /* @__PURE__ */ f.jsxs(
          "button",
          {
            className: "radf-legend__button",
            type: "button",
            onClick: () => {
              t && a(d.key);
            },
            children: [
              /* @__PURE__ */ f.jsx("span", { className: "radf-legend__swatch" }),
              /* @__PURE__ */ f.jsx("span", { className: "radf-legend__label", children: d.label })
            ]
          }
        )
      },
      d.key
    );
  }) }) });
}
function as({
  panelConfig: r,
  vizType: e,
  data: a,
  encodings: n,
  options: t,
  handlers: d
}) {
  const o = Me.get(e), i = A(
    () => jt({
      panelConfig: r,
      vizType: e,
      encodings: n,
      options: t,
      data: a
    }),
    [r, e, n, t, a]
  ), [c, u] = Se(/* @__PURE__ */ new Set()), p = A(() => (i == null ? void 0 : i.items) ?? [], [i]), m = (t == null ? void 0 : t.legendMode) ?? "auto", g = (t == null ? void 0 : t.legendPosition) ?? "bottom", N = (t == null ? void 0 : t.legend) !== !1 && p.length > 0 && (m !== "auto" || p.length > 1), T = (i == null ? void 0 : i.mode) === "series" || (i == null ? void 0 : i.mode) === "category", h = je(
    (S) => {
      T && u((O) => {
        const P = new Set(O);
        return P.has(S) ? P.delete(S) : P.add(S), P;
      });
    },
    [T]
  );
  if (Re(() => {
    if (!c.size)
      return;
    const S = new Set(p.map((P) => P.key)), O = [...c].filter((P) => S.has(P));
    O.length !== c.size && u(new Set(O));
  }, [p, c]), !o)
    return /* @__PURE__ */ f.jsxs("div", { className: "radf-viz__missing", children: [
      /* @__PURE__ */ f.jsx("p", { className: "radf-viz__missing-title", children: "Visualization unavailable" }),
      /* @__PURE__ */ f.jsxs("p", { className: "radf-viz__missing-text", children: [
        'The viz type "',
        e,
        '" has not been registered yet.'
      ] })
    ] });
  const w = g === "right" ? "radf-viz__layout radf-viz__layout--right" : "radf-viz__layout", x = N ? /* @__PURE__ */ f.jsx(
    Nt,
    {
      items: p,
      hiddenKeys: c,
      onToggle: T ? h : void 0,
      position: g
    }
  ) : null, R = /* @__PURE__ */ f.jsx(
    o,
    {
      data: a,
      encodings: n,
      options: t,
      handlers: d,
      colorAssignment: i,
      hiddenKeys: c
    }
  );
  return /* @__PURE__ */ f.jsxs("div", { className: w, children: [
    g === "top" ? x : null,
    R,
    g !== "top" ? x : null
  ] });
}
const kt = (r = []) => r.length ? /* @__PURE__ */ f.jsx("ul", { className: "radf-insight-card__evidence", children: r.map((e, a) => /* @__PURE__ */ f.jsx("li", { className: "radf-insight-card__evidence-item", children: e }, `${e}-${a}`)) }) : null;
function ns({ insights: r = [] }) {
  return /* @__PURE__ */ f.jsx("div", { className: "radf-insights", children: r.map((e) => /* @__PURE__ */ f.jsxs(
    "article",
    {
      className: `radf-insight-card radf-insight-card--${e.severity || "info"}`,
      children: [
        /* @__PURE__ */ f.jsxs("header", { className: "radf-insight-card__header", children: [
          /* @__PURE__ */ f.jsxs("div", { children: [
            /* @__PURE__ */ f.jsx("h3", { className: "radf-insight-card__title", children: e.title }),
            e.source ? /* @__PURE__ */ f.jsxs("p", { className: "radf-insight-card__source", children: [
              "Source: ",
              e.source
            ] }) : null
          ] }),
          e.severity ? /* @__PURE__ */ f.jsx("span", { className: "radf-insight-card__badge", children: e.severity }) : null
        ] }),
        e.narrative ? /* @__PURE__ */ f.jsx("p", { className: "radf-insight-card__narrative", children: e.narrative }) : null,
        kt(e.evidence),
        e.recommendedAction ? /* @__PURE__ */ f.jsxs("p", { className: "radf-insight-card__action", children: [
          /* @__PURE__ */ f.jsx("strong", { children: "Recommended:" }),
          " ",
          e.recommendedAction
        ] }) : null
      ]
    },
    e.id
  )) });
}
const We = (r) => Array.isArray(r) ? r : r ? [r] : [], Tt = ({ insight: r, fallbackId: e, analyzerId: a, analyzerLabel: n }) => {
  if (!r || typeof r != "object")
    return null;
  const t = r.title || n || "Insight";
  return {
    id: r.id || e,
    title: t,
    severity: r.severity || "info",
    narrative: r.narrative || "",
    recommendedAction: r.recommendedAction || null,
    evidence: We(r.evidence),
    source: r.source || a
  };
}, Dt = {
  /**
   * Run analyzers and normalize the resulting insights for rendering.
   * @param {InsightEngineParams} params - Input data and analyzer list.
   * @returns {Insight[]} Normalized insights.
   */
  analyze({ rows: r = [], meta: e = null, querySpec: a = null, dashboardState: n = null, analyzers: t = [] }) {
    const d = { rows: r, meta: e, querySpec: a, dashboardState: n };
    return t.flatMap((o, i) => {
      if (!o || typeof o.analyze != "function")
        return [];
      const c = o.analyze(d);
      return We(c).map(
        (p, m) => Tt({
          insight: p,
          analyzerId: o.id,
          analyzerLabel: o.label,
          fallbackId: `${o.id || "insight"}-${i}-${m}`
        })
      ).filter(Boolean);
    });
  }
}, Pt = (r) => Array.isArray(r) && r.length ? r : kr.list().map((e) => kr.get(e)).filter(Boolean), ts = ({
  rows: r = [],
  meta: e = null,
  querySpec: a = null,
  dashboardState: n = null,
  analyzers: t,
  enabled: d = !0
} = {}) => {
  const o = A(() => Pt(t), [t]), i = A(() => d ? Dt.analyze({
    rows: r,
    meta: e,
    querySpec: a,
    dashboardState: n,
    analyzers: o
  }) : [], [r, e, a, n, o, d]);
  return {
    insights: i,
    hasInsights: i.length > 0
  };
}, ss = ({ drillPath: r = [], onCrumbClick: e, onReset: a }) => r.length ? /* @__PURE__ */ f.jsxs("div", { className: "radf-drill", children: [
  /* @__PURE__ */ f.jsx("span", { className: "radf-drill__title", children: "Drill path" }),
  /* @__PURE__ */ f.jsx("div", { className: "radf-drill__crumbs", children: r.map((n, t) => /* @__PURE__ */ f.jsx(
    "button",
    {
      type: "button",
      className: "radf-drill__crumb",
      onClick: () => e == null ? void 0 : e(t),
      children: Dr(n)
    },
    n.id || `${n.dimension}-${t}`
  )) }),
  /* @__PURE__ */ f.jsx("button", { type: "button", className: "radf-drill__reset", onClick: a, children: "Reset" })
] }) : null, _e = (r, e, a) => Math.min(a, Math.max(e, r)), ds = ({ data: r, startIndex: e, endIndex: a, xKey: n }) => {
  var p, m;
  if (!Array.isArray(r) || r.length === 0 || !n)
    return null;
  const t = _e(e ?? 0, 0, r.length - 1), d = _e(a ?? r.length - 1, 0, r.length - 1), o = Math.min(t, d), i = Math.max(t, d), c = (p = r[o]) == null ? void 0 : p[n], u = (m = r[i]) == null ? void 0 : m[n];
  return c === void 0 || u === void 0 ? null : {
    startIndex: o,
    endIndex: i,
    startValue: c,
    endValue: u
  };
}, is = (r) => r ? r.startValue === r.endValue ? `${r.startValue}` : `${r.startValue} – ${r.endValue}` : "Full range", os = ({ field: r, range: e }) => {
  if (!r || !e || e.startValue === void 0 || e.endValue === void 0)
    return null;
  const [a, n] = e.startValue <= e.endValue ? [e.startValue, e.endValue] : [e.endValue, e.startValue];
  return {
    field: r,
    op: "BETWEEN",
    values: [a, n]
  };
}, fs = (r = [], e) => e ? [
  ...r.filter((a) => a.field !== e.field),
  e
] : r, ls = (r = [], e) => e ? r.filter((a) => a.field !== e) : r, It = /* @__PURE__ */ new Set(["kpi", "text", "metric", "number", "markdown"]), $t = /* @__PURE__ */ new Set(["heatmap", "choropleth", "density"]), Ot = ({ panelConfig: r, vizType: e }) => (r == null ? void 0 : r.vizRole) === "text" || It.has(e), xe = ({ panelConfig: r, vizType: e, options: a }) => r != null && r.paletteIntent ? r.paletteIntent : (a == null ? void 0 : a.diverging) === !0 ? "diverging" : $t.has(e) ? "sequential" : "categorical", Lt = (r) => r === "diverging" ? "rdylgn" : r === "sequential" ? "viridis" : "analytics", cs = ({ panelConfig: r, vizType: e, encodings: a, options: n, data: t }) => {
  if ((r == null ? void 0 : r.panelType) !== "viz" || Ot({ panelConfig: r, vizType: e }) || (r == null ? void 0 : r.paletteIntent) === "none")
    return null;
  if (r != null && r.paletteId)
    return {
      paletteId: r.paletteId,
      paletteClass: pe(r.paletteId),
      intent: xe({ panelConfig: r, vizType: e, options: n })
    };
  const d = xe({ panelConfig: r, vizType: e, options: n });
  if (d === "none")
    return null;
  const o = Lt(d);
  return {
    paletteId: o,
    paletteClass: pe(o),
    intent: d
  };
}, us = ({
  id: r,
  label: e,
  dimensions: a = [],
  metrics: n = [],
  hierarchies: t = [],
  defaultGrain: d = null,
  timezone: o = "UTC"
} = {}) => {
  if (!r)
    throw new Error("Dataset requires an id");
  if (!e)
    throw new Error(`Dataset ${r} requires a label`);
  const i = Object.fromEntries(
    a.map((u) => [u.id, u])
  ), c = Object.fromEntries(
    n.map((u) => [u.id, u])
  );
  return {
    id: r,
    label: e,
    dimensions: a,
    metrics: n,
    hierarchies: t,
    defaultGrain: d,
    timezone: o,
    fields: {
      dimensions: a,
      metrics: n,
      dimensionById: i,
      metricById: c
    }
  };
}, ps = ({ id: r, type: e, levels: a, label: n }) => ({
  id: r,
  type: e,
  levels: a,
  label: n || r
}), Ge = {
  STRING: "string",
  NUMBER: "number",
  DATE: "date",
  BOOLEAN: "boolean",
  GEO: "geo"
}, Ft = Object.values(Ge), zt = (r) => Ft.includes(r), bs = ({ id: r, label: e, type: a, hierarchy: n, formatter: t } = {}) => {
  if (!r)
    throw new Error("Dimension requires an id");
  if (!e)
    throw new Error(`Dimension ${r} requires a label`);
  if (!zt(a))
    throw new Error(
      `Dimension ${r} has invalid type. Expected one of ${Object.values(
        Ge
      ).join(", ")}.`
    );
  return {
    id: r,
    label: e,
    type: a,
    hierarchy: n || null,
    formatter: t || null
  };
}, ms = ({
  id: r,
  label: e,
  format: a,
  dependsOn: n,
  query: t,
  compute: d,
  validGrains: o,
  constraints: i
} = {}) => {
  if (!r)
    throw new Error("Metric requires an id");
  if (!e)
    throw new Error(`Metric ${r} requires a label`);
  if (!t && !d)
    throw new Error(`Metric ${r} must define query or compute`);
  return {
    id: r,
    label: e,
    format: a || "number",
    dependsOn: n || [],
    query: t || null,
    compute: d || null,
    validGrains: o || [],
    constraints: i || null
  };
}, ye = "radf-framework-styles", At = () => {
  if (typeof document > "u" || document.getElementById(ye)) return;
  const r = document.createElement("style");
  r.id = ye, r.textContent = Pa, document.head.appendChild(r);
};
At();
export {
  Vt as DashboardProvider,
  gn as DataProvider,
  ss as DrillBreadcrumbs,
  es as ErrorBoundary,
  Ge as FIELD_TYPES,
  Ht as GridLayout,
  ns as InsightsPanel,
  Jt as MockDataProvider,
  rs as Panel,
  as as VizRenderer,
  Xa as applyDrilldownToDimensions,
  _n as assertDataProvider,
  os as buildBrushFilter,
  Kt as buildCrossFilterSelectionFromEvent,
  Ut as buildDrilldownEntryFromEvent,
  rn as buildQuerySpec,
  gn as createDataProvider,
  us as createDataset,
  bs as createDimension,
  ps as createHierarchy,
  ms as createMetric,
  Gt as dashboardSelectors,
  is as formatBrushRangeLabel,
  ds as getBrushRange,
  hn as isDataProvider,
  Wt as isDrilldownDuplicate,
  Yt as isSelectionDuplicate,
  Xt as registerCharts,
  Zt as registerInsights,
  ls as removeBrushFilter,
  cs as resolvePalette,
  fs as upsertBrushFilter,
  qt as useDashboardActions,
  Bt as useDashboardState,
  ts as useInsights,
  Qt as useQuery
};
