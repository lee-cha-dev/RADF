# Viz Catalog and Authoring Guidance

This catalog summarizes RADF viz types and how to author them. Option support is
authoritative in `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`.

## Authoring Rules (One Page)
- Use the vizType string exactly as documented below.
- Provide required encodings; optional encodings are listed per viz.
- Only options marked supported are editable in the visual editor; planned and deferred
  options exist in the matrix for roadmap visibility and expert-mode preservation.
- Use option paths exactly as listed (for example, `options.tooltip`), or authoring will
  not resolve them correctly.
- When multiple measure keys are supported, you can pass an array in `encodings.y` or rely
  on `options.seriesKeys` when available.
- If a viz needs structured input (for example, Sankey nodes + links), authoring must
  provide that structure directly; RADF does not infer it.

Status legend:
- supported: available in authoring UI and runtime
- planned: documented but not implemented yet
- deferred: runtime supports it, authoring UI does not expose it

## bar (vizType: bar)
Intended use: Compare categorical values or multiple series per category.
Required data shape: Rows with a category field and one or more numeric measures.
Encodings: `encodings.x` (category), `encodings.y` (measure or array of measures).
Options (supported): `options.tooltip`, `options.stacked`, `options.stackedKeys`,
`options.seriesKeys`, `options.colorBy`, `options.diverging`, `options.legend`,
`options.legendMode`, `options.legendPosition`.
Options (planned): `options.xAxis.enabled`, `options.yAxis.enabled`,
`options.xAxis.tickRotation`, `options.yAxis.tickFormatter`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `bar`).

## line (vizType: line)
Intended use: Trends over ordered categories or time.
Required data shape: Rows with an x field and one or more numeric measures.
Encodings: `encodings.x` (category/time), `encodings.y` (measure or array).
Options (supported): `options.tooltip`, `options.brush.enabled`,
`options.brush.startIndex`, `options.brush.endIndex`, `options.seriesKeys`,
`options.legend`, `options.legendMode`, `options.legendPosition`.
Options (planned): `options.xAxis.enabled`, `options.yAxis.enabled`,
`options.xAxis.tickRotation`, `options.yAxis.tickFormatter`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `line`).

## area (vizType: area)
Intended use: Filled trends over ordered categories or time.
Required data shape: Rows with an x field and one or more numeric measures.
Encodings: `encodings.x` (category/time), `encodings.y` (measure or array).
Options (supported): `options.tooltip`, `options.brush.enabled`,
`options.brush.startIndex`, `options.brush.endIndex`, `options.seriesKeys`,
`options.legend`, `options.legendMode`, `options.legendPosition`.
Options (planned): `options.xAxis.enabled`, `options.yAxis.enabled`,
`options.xAxis.tickRotation`, `options.yAxis.tickFormatter`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `area`).

## barWithConditionalColoring (vizType: barWithConditionalColoring)
Intended use: Categorical bars with per-row conditional color rules.
Required data shape: Rows with a category field and a numeric measure. Optional flag
field for conditional color.
Encodings: `encodings.x` (category), `encodings.y` (measure), `encodings.color`
(optional flag or condition field).
Options (supported): `options.tooltip`.
Options (deferred): `options.colorFn`, `options.legendItems`.
Options (planned): `options.xAxis.enabled`, `options.yAxis.enabled`,
`options.xAxis.tickRotation`, `options.yAxis.tickFormatter`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `barWithConditionalColoring`).

## bulletChart (vizType: bulletChart)
Intended use: Compare categories with inline targets and percent column.
Required data shape: Rows with a category field, a primary numeric value, and optional
marker/threshold fields. Percent column is optional.
Encodings: `encodings.x` and `encodings.y` (category/value; swapped by orientation),
`encodings.color` (optional category field for palette grouping).
Options (supported): `options.orientation`, `options.colorBy`,
`options.leftAnnotations.enabled`, `options.leftAnnotations.type`,
`options.leftAnnotations.colorBy`, `options.showPercentColumn`, `options.percentKey`,
`options.markerLines.enabled`, `options.markerLines.valueKey`,
`options.markerLines.label`, `options.markerLines.color`,
`options.outlierRule.valueKey`, `options.iqrValueKey`, `options.outlierValueKey`,
`options.averageKey`, `options.headerTitles.xTitle`, `options.headerTitles.yTitle`,
`options.headerTitles.percentTitle`.
Options (deferred): `options.thresholdMarkers.valueKey`,
`options.thresholdMarkers.enabled`, `options.thresholdMarkers.label`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `bulletChart`).

## kpi (vizType: kpi)
Intended use: Single metric headline value.
Required data shape: Single row with a numeric value.
Encodings: `encodings.value` or `encodings.y` (value), `encodings.label` (optional).
Options (supported): `options.format`, `options.currency`, `options.label`,
`options.caption`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `kpi`).

## pie (vizType: pie)
Intended use: Part-to-whole across categories.
Required data shape: Rows with a category field and a numeric value.
Encodings: `encodings.category` (category), `encodings.value` (value).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.donut`, `options.labels`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `pie`).

## scatter (vizType: scatter)
Intended use: Correlation and outlier detection.
Required data shape: Rows with numeric x and y values; optional grouping field.
Encodings: `encodings.x` (x value), `encodings.y` (y value), `encodings.group`
(optional series grouping).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.pointSize`.
Options (planned): `options.seriesKeys`, `options.xAxis.enabled`, `options.yAxis.enabled`,
`options.xAxis.tickRotation`, `options.yAxis.tickFormatter`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `scatter`).

## composed (vizType: composed)
Intended use: Combine bar and line measures on one categorical axis.
Required data shape: Rows with a category field and multiple numeric measures.
Encodings: `encodings.x` (category), `encodings.y` (measure or array).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.seriesKeys`, `options.barKeys`, `options.lineKeys`.
Options (planned): `options.xAxis.enabled`, `options.yAxis.enabled`,
`options.xAxis.tickRotation`, `options.yAxis.tickFormatter`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `composed`).

## radar (vizType: radar)
Intended use: Compare multiple measures across a shared dimension.
Required data shape: Rows with a category field and one or more numeric measures.
Encodings: `encodings.x` (category), `encodings.y` (measure or array).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.seriesKeys`, `options.fillOpacity`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `radar`).

## treemap (vizType: treemap)
Intended use: Hierarchical or grouped proportional comparisons.
Required data shape: Either a hierarchy with `children` arrays or a flat list with
category and value fields.
Encodings: `encodings.category` or `encodings.x` (category), `encodings.value` or
`encodings.y` (value).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.colorBy`, `options.labels`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `treemap`).

## funnel (vizType: funnel)
Intended use: Stage drop-off and conversion funnels.
Required data shape: Rows with a stage name and numeric value.
Encodings: `encodings.category` or `encodings.x` (stage name),
`encodings.value` or `encodings.y` (value).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.labelMode`, `options.sort`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `funnel`).

## sankey (vizType: sankey)
Intended use: Flow between nodes with weighted links.
Required data shape: Sankey object with `nodes` and `links` arrays. Links must reference
source and target nodes and provide a numeric value.
Encodings: None (data is structured).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.colorBy`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `sankey`).

## radialBar (vizType: radialBar)
Intended use: Circular ranked/category comparisons.
Required data shape: Rows with a category field and one or more numeric measures.
Encodings: `encodings.category` or `encodings.x` (category),
`encodings.value` or `encodings.y` (measure or array).
Options (supported): `options.tooltip`, `options.legend`, `options.legendMode`,
`options.legendPosition`, `options.seriesKeys`, `options.innerRadius`,
`options.outerRadius`, `options.labels`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `radialBar`).

## filterBar (vizType: filterBar)
Intended use: Dashboard-level filter controls (not a chart).
Required data shape: Filter definitions are provided by the host app.
Encodings: None.
Options (supported): `options.allowMultiSelect`, `options.showSearch`,
`options.showClear`, `options.layout`.
Option coverage: `composer/lazy-dashboards/src/authoring/optionCoverageMatrix.json`
(vizType `filterBar`).
