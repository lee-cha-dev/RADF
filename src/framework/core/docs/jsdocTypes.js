/**
 * @module core/docs/jsdocTypes
 * @description Canonical JSDoc typedefs for RADF's public APIs.
 */

/**
 * Documentation Standards (internal)
 *
 * Naming rules:
 * - Use PascalCase for typedef names (e.g., QuerySpec, DashboardState).
 * - Use singular nouns for entities (Metric, Dimension, PanelConfig).
 * - Use `Foo[]` for arrays and `Record<string, Foo>` for maps.
 *
 * @example usage guidance:
 * - Add @example blocks for extension points and multi-step flows.
 * - Examples should be runnable or copy-ready for consumers.
 *
 * Public API criteria:
 * - Exported functions/components/constants or documented config shapes.
 * - Contracts relied on by dashboard configs, providers, or registries.
 */

/**
 * @typedef {Object} QuerySpec
 * @property {string} datasetId - Dataset identifier for the query.
 * @property {string[]} measures - Metric ids to aggregate.
 * @property {string[]} dimensions - Dimension ids to group by.
 * @property {Filter[]} [filters] - Filters applied to the query.
 * @property {TransformSpec[]} [transforms] - Post-query transforms to apply.
 * @property {Record<string, unknown>} [meta] - Optional metadata for providers.
 */

/**
 * @typedef {Object} QueryResult
 * @property {Object[]} rows - Array of result rows.
 * @property {Record<string, unknown>} [meta] - Optional metadata from providers.
 */

/**
 * @typedef {Object} ProviderResult
 * @property {Object[]} rows - Provider data rows.
 * @property {Record<string, unknown>} [meta] - Provider-specific metadata.
 */

/**
 * @typedef {Object} DataProvider
 * @property {(querySpec: QuerySpec, context: { signal: AbortSignal }) => Promise<ProviderResult>} execute
 *   - Executes a query against the underlying data source.
 * @property {(result: ProviderResult, querySpec: QuerySpec) => (true|false|string|string[])} [validateResult]
 *   - Optional result validation for provider outputs.
 */

/**
 * @typedef {Object} TransformSpec
 * @property {string} type - Transform identifier (e.g., 'pivot', 'sort').
 * @property {Record<string, unknown>} [options] - Transform-specific options.
 */

/**
 * @typedef {Object} Dataset
 * @property {string} id - Unique dataset id.
 * @property {string} label - Display label for the dataset.
 * @property {Metric[]} metrics - Metrics available for this dataset.
 * @property {Dimension[]} dimensions - Dimensions available for this dataset.
 */

/**
 * @typedef {Object} Dimension
 * @property {string} id - Dimension id.
 * @property {string} label - Dimension label.
 * @property {FieldType} type - Dimension field type.
 * @property {Hierarchy} [hierarchy] - Optional drilldown hierarchy.
 */

/**
 * @typedef {Object} Metric
 * @property {string} id - Metric id.
 * @property {string} label - Metric label.
 * @property {string} [format] - Formatting hint (currency, percent, etc.).
 * @property {Record<string, unknown>} query - Provider query definition.
 */

/**
 * @typedef {'string'|'number'|'date'|'boolean'} FieldType
 */

/**
 * @typedef {string[]} Hierarchy
 * @description Ordered dimension ids used for drilldown paths.
 */

/**
 * @typedef {Object} DashboardState
 * @property {string} dashboardId - Active dashboard id.
 * @property {string} datasetId - Active dataset id.
 * @property {Filter[]} filters - Global filters applied to the dashboard.
 * @property {Selection[]} selections - Active selections for interactions.
 * @property {DrilldownPath[]} drilldowns - Active drilldown paths.
 */

/**
 * @typedef {Object} DashboardAction
 * @property {string} type - Action type constant.
 * @property {Record<string, unknown>} [payload] - Action payload.
 */

/**
 * @typedef {Object} DashboardConfig
 * @property {string} id - Dashboard id.
 * @property {string} title - Dashboard title.
 * @property {string} [subtitle] - Optional subtitle.
 * @property {string} datasetId - Dataset id for dashboard panels.
 * @property {PanelConfig[]} panels - Panel definitions.
 */

/**
 * @typedef {Object} PanelConfig
 * @property {string} id - Panel id.
 * @property {'viz'|'insight'|'custom'} panelType - Panel type.
 * @property {string} vizType - Registered visualization key.
 * @property {string} title - Panel title.
 * @property {string} [subtitle] - Optional subtitle.
 * @property {Object} layout - Layout coordinates for grid placement.
 * @property {QuerySpec} query - Query spec for the panel.
 * @property {Record<string, string>} encodings - Mapping of fields to channels.
 * @property {Record<string, unknown>} [options] - Visualization options.
 */

/**
 * @typedef {Object} VizConfig
 * @property {string} type - Registered viz type.
 * @property {Record<string, unknown>} [options] - Viz options.
 * @property {SeriesConfig[]} [series] - Series configuration.
 * @property {AxisConfig} [xAxis] - X axis config.
 * @property {AxisConfig} [yAxis] - Y axis config.
 * @property {PaletteConfig} [palette] - Palette override.
 */

/**
 * @typedef {Object} SeriesConfig
 * @property {string} id - Series identifier.
 * @property {string} field - Data field for the series.
 * @property {string} [label] - Display label.
 * @property {string} [color] - Explicit series color.
 */

/**
 * @typedef {Object} AxisConfig
 * @property {string} field - Data field for the axis.
 * @property {string} [label] - Axis label.
 * @property {boolean} [hide] - Whether to hide the axis.
 */

/**
 * @typedef {Object} PaletteConfig
 * @property {string} id - Palette id.
 * @property {string[]} [colors] - Optional override colors.
 */

/**
 * @typedef {Object} Selection
 * @property {string} field - Field that was selected.
 * @property {string|string[]|number|number[]} value - Selected value(s).
 * @property {string} [label] - Human-friendly label.
 */

/**
 * @typedef {Object} Filter
 * @property {string} field - Field to filter.
 * @property {string} operator - Filter operator (eq, in, gt, lt, etc.).
 * @property {string|string[]|number|number[]} value - Filter value(s).
 */

/**
 * @typedef {Object} DrilldownPath
 * @property {string} dimension - Base dimension id.
 * @property {string[]} path - Ordered drilldown dimension ids.
 */

/**
 * @typedef {Object} BrushRange
 * @property {string} field - Field being brushed.
 * @property {number|Date} start - Range start.
 * @property {number|Date} end - Range end.
 */

/**
 * @typedef {Object} Insight
 * @property {string} id - Insight id.
 * @property {string} title - Insight title.
 * @property {string} description - Insight narrative.
 * @property {string} severity - Insight severity (info, warning, critical).
 * @property {Record<string, unknown>} [meta] - Optional insight metadata.
 */

/**
 * @typedef {Object} AnalyzerContext
 * @property {QuerySpec} querySpec - Query spec used to fetch data.
 * @property {DashboardState} dashboardState - Current dashboard state.
 * @property {Object[]} rows - Raw data rows.
 * @property {Record<string, unknown>} [meta] - Provider meta.
 */

/**
 * @typedef {Object} Analyzer
 * @property {string} id - Analyzer id.
 * @property {string} label - Display label.
 * @property {(context: AnalyzerContext) => Insight[]|Promise<Insight[]>} run
 *   - Executes analysis and returns insights.
 */

export {};
