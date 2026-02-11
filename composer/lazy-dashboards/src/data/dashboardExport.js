import JSZip from 'jszip';
import { compileAuthoringModel } from '../authoring/compiler.js';
import {
  PALETTE_OPTIONS,
  THEME_CLASS_MAP,
  THEME_SETTINGS_STORAGE_KEY,
} from '../theme/themeConfig.js';

/**
 * @typedef {Object} DashboardExportNames
 * @property {string} componentName
 * @property {string} fileBase
 * @property {string} folderName
 */

/**
 * @typedef {Object<string, string>} DashboardExportFiles
 */

/**
 * @typedef {Object} DashboardExportPlan
 * @property {string} componentName
 * @property {string} fileBase
 * @property {string} folderName
 * @property {DashboardExportFiles} files
 */

/**
 * @typedef {Object} DashboardExportInput
 * @property {{ id?: string, name?: string, meta?: { title?: string, description?: string } }} dashboard
 * @property {Object} [authoringModel]
 * @property {Object} [compiled]
 * @property {string} [themeFamily]
 * @property {'light'|'dark'} [themeMode]
 * @property {string} [paletteId]
 */

const toWords = (value = '') =>
  String(value)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

const toPascalCase = (value) => {
  const words = toWords(value);
  if (words.length === 0) {
    return 'Dashboard';
  }
  return words
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
};

const toCamelCase = (value) => {
  const pascal = toPascalCase(value);
  return pascal[0].toLowerCase() + pascal.slice(1);
};

const generateModule = (name, payload, options = {}) => {
  const serialized = JSON.stringify(payload ?? null, null, 2);
  const doc = options.doc ? `${options.doc}\n` : '';
  return `${doc}const ${name} = ${serialized};\n\nexport default ${name};\n`;
};

/**
 * Builds stable export naming for a dashboard bundle.
 *
 * @param {{ id?: string, name?: string, meta?: { title?: string } }} dashboard
 * @returns {DashboardExportNames} The resolved export names.
 */
export const getDashboardExportNames = (dashboard) => {
  const base =
    dashboard?.name ||
    dashboard?.id ||
    dashboard?.meta?.title ||
    'Dashboard';
  const componentName = toPascalCase(base);
  const fileBase = toCamelCase(base);
  return {
    componentName,
    fileBase,
    folderName: componentName,
  };
};

const buildFilterBarSource = () => `import { useMemo, useState } from "react";
import {
  dashboardSelectors,
  removeBrushFilter,
  upsertBrushFilter,
  useDashboardActions,
  useDashboardState,
} from "ladf";

/**
 * @typedef {Object} LazyFilterBarProps
 * @property {string[]|string|null} fields - The field ids to render.
 * @property {{ columns?: Object[], rows?: Object[] }} datasetBinding - The dataset binding.
 * @property {{ dimensions?: Object[] }} semanticLayer - The semantic layer details.
 * @property {{ allowMultiSelect?: boolean, showSearch?: boolean, showClear?: boolean, layout?: string }} [options] - The filter bar options.
 */

const MAX_DISTINCT_VALUES = 200;

/**
 * Normalizes field ids into a list.
 *
 * @param {string|string[]|null|undefined} fields - The field ids input.
 * @returns {string[]} The normalized list.
 */
const normalizeFieldList = (fields) => {
  if (Array.isArray(fields)) {
    return fields.map((field) => String(field).trim()).filter(Boolean);
  }
  if (fields) {
    return [String(fields).trim()].filter(Boolean);
  }
  return [];
};

/**
 * Resolves the field type for display and sorting.
 *
 * @param {Object|null|undefined} column - The column metadata.
 * @param {Object|null|undefined} dimension - The semantic dimension.
 * @returns {string} The resolved field type.
 */
const getFieldType = (column, dimension) =>
  dimension?.type || column?.type || column?.inferredType || "string";

/**
 * Resolves the label for a field.
 *
 * @param {Object|null|undefined} column - The column metadata.
 * @param {Object|null|undefined} dimension - The semantic dimension.
 * @param {string} fieldId - The field id.
 * @returns {string} The display label.
 */
const getFieldLabel = (column, dimension, fieldId) =>
  dimension?.label || column?.label || fieldId;

/**
 * Extracts distinct values from a dataset column.
 *
 * @param {Object[]} rows - The dataset rows.
 * @param {string} fieldId - The column id.
 * @param {number} limit - The maximum values to return.
 * @returns {string[]} The distinct values.
 */
const getDistinctValues = (rows, fieldId, limit) => {
  const seen = new Set();
  const values = [];
  for (let i = 0; i < rows.length; i += 1) {
    const raw = rows[i]?.[fieldId];
    if (raw === null || raw === undefined || raw === "") {
      continue;
    }
    const value = String(raw);
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    values.push(value);
    if (values.length >= limit) {
      break;
    }
  }
  return values;
};

/**
 * Sorts values based on a field type.
 *
 * @param {string[]} values - The values to sort.
 * @param {string} type - The field type.
 * @returns {string[]} The sorted values.
 */
const sortValues = (values, type) => {
  if (type === "number") {
    return [...values].sort((a, b) => Number(a) - Number(b));
  }
  if (type === "date") {
    return [...values].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }
  if (type === "boolean") {
    return [...values].sort((a, b) => a.localeCompare(b));
  }
  return [...values].sort((a, b) => a.localeCompare(b));
};

/**
 * Renders a filter bar for global dashboard filters.
 *
 * @param {LazyFilterBarProps} props - The component props.
 * @returns {JSX.Element} The filter bar markup.
 */
const LazyFilterBar = ({ fields, datasetBinding, semanticLayer, options }) => {
  const dashboardState = useDashboardState();
  const { setGlobalFilters } = useDashboardActions();
  const globalFilters = dashboardSelectors.selectGlobalFilters(dashboardState);
  const [searchByField, setSearchByField] = useState({});
  const allowMultiSelect = options?.allowMultiSelect !== false;
  const showSearch = options?.showSearch !== false;
  const showClear = options?.showClear !== false;
  const layout = options?.layout === "stacked" ? "stacked" : "inline";

  const columns = datasetBinding?.columns || [];
  const rows = datasetBinding?.rows || [];
  const dimensionMap = useMemo(
    () =>
      new Map(
        (semanticLayer?.dimensions || []).map((dimension) => [
          dimension.id,
          dimension,
        ])
      ),
    [semanticLayer]
  );
  const columnMap = useMemo(
    () => new Map(columns.map((column) => [column.id, column])),
    [columns]
  );

  const resolvedFields = useMemo(() => {
    const list = normalizeFieldList(fields);
    return list
      .map((fieldId) => {
        const dimension = dimensionMap.get(fieldId);
        const column =
          columnMap.get(fieldId) || columnMap.get(dimension?.sourceField || "");
        if (!column && !dimension) {
          return null;
        }
        return {
          id: fieldId,
          label: getFieldLabel(column, dimension, fieldId),
          type: getFieldType(column, dimension),
          sourceField: dimension?.sourceField || fieldId,
        };
      })
      .filter(Boolean);
  }, [fields, columnMap, dimensionMap]);

  const valuesByField = useMemo(() => {
    const next = new Map();
    resolvedFields.forEach((field) => {
      const values = getDistinctValues(
        rows,
        field.sourceField,
        MAX_DISTINCT_VALUES
      );
      next.set(field.id, sortValues(values, field.type));
    });
    return next;
  }, [rows, resolvedFields]);

  const filtersByField = useMemo(() => {
    const map = new Map();
    (globalFilters || []).forEach((filter) => {
      if (filter?.field) {
        map.set(filter.field, filter);
      }
    });
    return map;
  }, [globalFilters]);

  /**
   * Updates global filters for a field.
   *
   * @param {string} fieldId - The field id.
   * @param {string[]} nextValues - The selected values.
   * @returns {void}
   */
  const handleSelectionChange = (fieldId, nextValues) => {
    const trimmed = nextValues.filter(Boolean);
    const nextFilter =
      trimmed.length > 0
        ? { field: fieldId, op: "IN", values: trimmed }
        : null;
    const nextFilters = nextFilter
      ? upsertBrushFilter(globalFilters, nextFilter)
      : removeBrushFilter(globalFilters, fieldId);
    setGlobalFilters(nextFilters);
  };

  if (!datasetBinding) {
    return (
      <div className="lazy-filter-bar__empty">
        Provide dataset columns and rows to enable filter interactions.
      </div>
    );
  }

  if (resolvedFields.length === 0) {
    return (
      <div className="lazy-filter-bar__empty">
        Add filterable fields to the Filter Bar widget.
      </div>
    );
  }

  return (
    <div className={\`ladf-filter-bar lazy-filter-bar \${layout}\`}>
      {resolvedFields.map((field) => {
        const activeFilter = filtersByField.get(field.id);
        const activeValues = Array.isArray(activeFilter?.values)
          ? activeFilter.values.map(String)
          : activeFilter?.value
            ? [String(activeFilter.value)]
            : [];
        const availableValues = valuesByField.get(field.id) || [];
        const searchValue = searchByField[field.id] || "";
        const visibleValues = showSearch
          ? availableValues.filter((value) =>
              value.toLowerCase().includes(searchValue.toLowerCase())
            )
          : availableValues;

        return (
          <div key={field.id} className="ladf-filter-bar__group">
            <span className="ladf-filter-bar__label">{field.label}</span>
            <div className="ladf-filter-bar__inputs">
              {showSearch ? (
                <input
                  className="ladf-filter-bar__input"
                  type="search"
                  placeholder="Search values"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchByField((prev) => ({
                      ...prev,
                      [field.id]: event.target.value,
                    }))
                  }
                />
              ) : null}
              <select
                className="ladf-filter-bar__input lazy-filter-bar__select"
                multiple={allowMultiSelect}
                value={allowMultiSelect ? activeValues : activeValues[0] || ""}
                onChange={(event) => {
                  if (allowMultiSelect) {
                    const next = Array.from(
                      event.target.selectedOptions,
                      (option) => option.value
                    );
                    handleSelectionChange(field.id, next);
                    return;
                  }
                  const nextValue = event.target.value;
                  handleSelectionChange(field.id, nextValue ? [nextValue] : []);
                }}
              >
                {!allowMultiSelect ? <option value="">All</option> : null}
                {visibleValues.map((value) => (
                  <option key={\`\${field.id}-\${value}\`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {showClear && activeValues.length > 0 ? (
                <button
                  type="button"
                  className="ladf-filter-bar__button ladf-filter-bar__button--ghost"
                  onClick={() => handleSelectionChange(field.id, [])}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
      {showClear && globalFilters?.length ? (
        <button
          type="button"
          className="ladf-filter-bar__clear"
          onClick={() => setGlobalFilters([])}
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
};

export default LazyFilterBar;
`;

const buildLocalDataProviderSource = () => `import { createDataProvider } from "ladf";

/**
 * @typedef {Object} DatasetBinding
 * @property {Object[]} [rows] - The dataset rows.
 * @property {Object[]} [columns] - The dataset columns.
 */

/**
 * @typedef {function(Object): Promise<{ rows: Object[], meta: Object }>} DataProvider
 */

/**
 * Normalizes raw values into trimmed strings.
 *
 * @param {unknown} value - The raw value.
 * @returns {string} The normalized string.
 */
const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

/**
 * Parses a number from user-friendly input.
 *
 * @param {unknown} raw - The raw value.
 * @returns {number|null} The parsed number.
 */
const parseNumericValue = (raw) => {
  const value = normalizeValue(raw);
  if (!value) {
    return null;
  }
  let cleaned = value;
  let isNegative = false;
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    isNegative = true;
    cleaned = cleaned.slice(1, -1);
  }
  let isPercent = false;
  if (cleaned.endsWith("%")) {
    isPercent = true;
    cleaned = cleaned.slice(0, -1);
  }
  cleaned = cleaned.replace(/[$\\u20AC\\u00A3\\u00A5]/g, "");
  cleaned = cleaned.replace(/,/g, "");
  cleaned = cleaned.trim();
  if (!cleaned || !/^[-+]?\\d*\\.?\\d+$/.test(cleaned)) {
    return null;
  }
  let parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed)) {
    return null;
  }
  if (isPercent) {
    parsed /= 100;
  }
  if (isNegative) {
    parsed *= -1;
  }
  return parsed;
};

/**
 * Parses a boolean value from text.
 *
 * @param {unknown} raw - The raw value.
 * @returns {boolean|null} The parsed boolean.
 */
const parseBooleanValue = (raw) => {
  const value = normalizeValue(raw).toLowerCase();
  if (!value) {
    return null;
  }
  if (["true", "yes", "y"].includes(value)) {
    return true;
  }
  if (["false", "no", "n"].includes(value)) {
    return false;
  }
  return null;
};

/**
 * Parses a date value from text.
 *
 * @param {unknown} raw - The raw value.
 * @returns {Date|null} The parsed date.
 */
const parseDateValue = (raw) => {
  const value = normalizeValue(raw);
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

/**
 * Coerces a value into a query-comparable type.
 *
 * @param {unknown} raw - The raw value.
 * @param {string} type - The expected type.
 * @returns {string|number|boolean|Date|null} The coerced value.
 */
const coerceValue = (raw, type) => {
  if (type === "number") {
    return parseNumericValue(raw);
  }
  if (type === "date") {
    return parseDateValue(raw);
  }
  if (type === "bool" || type === "boolean") {
    return parseBooleanValue(raw);
  }
  return normalizeValue(raw);
};

/**
 * Normalizes filter values for comparison.
 *
 * @param {Object} filter - The filter definition.
 * @param {string} type - The field type.
 * @returns {Array<string|number|boolean|Date|null>} The normalized values.
 */
const resolveFilterValues = (filter, type) => {
  if (Array.isArray(filter?.values)) {
    return filter.values.map((value) => coerceValue(value, type));
  }
  if (filter?.value !== undefined) {
    return [coerceValue(filter.value, type)];
  }
  return [];
};

/**
 * Compares two values with type-aware behavior.
 *
 * @param {unknown} left - The left value.
 * @param {unknown} right - The right value.
 * @returns {number} The comparison result.
 */
const compareValues = (left, right) => {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right));
};

/**
 * Filters dataset rows based on query filters.
 *
 * @param {Object[]} rows - The dataset rows.
 * @param {Object[]} filters - The query filters.
 * @param {function(string): string} resolveFieldType - The field type resolver.
 * @param {function(string): string} resolveField - The field id resolver.
 * @returns {Object[]} The filtered rows.
 */
const filterRows = (rows, filters, resolveFieldType, resolveField) => {
  if (!Array.isArray(filters) || filters.length === 0) {
    return rows;
  }
  return rows.filter((row) =>
    filters.every((filter) => {
      if (!filter?.field) {
        return true;
      }
      const fieldId = resolveField(filter.field);
      const type = resolveFieldType(fieldId);
      const rowValue = coerceValue(row?.[fieldId], type);
      const op = String(filter.op || filter.operator || "IN").toUpperCase();
      const values = resolveFilterValues(filter, type);
      const value = values[0];

      if (op === "IN") {
        return values.some((candidate) => candidate === rowValue);
      }
      if (op === "EQ") {
        return rowValue === value;
      }
      if (op === "NEQ") {
        return rowValue !== value;
      }
      if (op === "CONTAINS") {
        return String(rowValue).includes(String(value ?? ""));
      }
      if (op === "BETWEEN") {
        const maxValue = values[1];
        if (value === null || maxValue === null) {
          return false;
        }
        return (
          compareValues(rowValue, value) >= 0 &&
          compareValues(rowValue, maxValue) <= 0
        );
      }
      if (op === "GT") {
        return compareValues(rowValue, value) > 0;
      }
      if (op === "GTE") {
        return compareValues(rowValue, value) >= 0;
      }
      if (op === "LT") {
        return compareValues(rowValue, value) < 0;
      }
      if (op === "LTE") {
        return compareValues(rowValue, value) <= 0;
      }
      return true;
    })
  );
};

/**
 * Initializes aggregate state for measures.
 *
 * @param {Object[]} measures - The measures to aggregate.
 * @returns {Object} The aggregate state.
 */
const buildAggregateState = (measures) =>
  measures.reduce((acc, measure) => {
    acc[measure.id] = {
      op: measure.op,
      field: measure.field,
      sum: 0,
      count: 0,
      min: null,
      max: null,
    };
    return acc;
  }, {});

/**
 * Finalizes aggregate values into a row payload.
 *
 * @param {Object} aggregateState - The aggregate state.
 * @param {Object[]} measures - The measures to resolve.
 * @returns {Object} The aggregate row.
 */
const finalizeAggregates = (aggregateState, measures) => {
  const row = {};
  measures.forEach((measure) => {
    const state = aggregateState[measure.id];
    if (!state) {
      return;
    }
    const op = state.op;
    if (op === "AVG") {
      row[measure.id] = state.count ? state.sum / state.count : null;
      return;
    }
    if (op === "MIN") {
      row[measure.id] = state.min;
      return;
    }
    if (op === "MAX") {
      row[measure.id] = state.max;
      return;
    }
    if (op === "COUNT") {
      row[measure.id] = state.count;
      return;
    }
    row[measure.id] = state.sum;
  });
  return row;
};

/**
 * Aggregates rows by dimension and measure definitions.
 *
 * @param {Object[]} rows - The dataset rows.
 * @param {Object[]} measures - The measure definitions.
 * @param {string[]} dimensions - The dimension ids.
 * @param {function(string): string} resolveDimensionField - The dimension field resolver.
 * @returns {Object[]} The aggregated rows.
 */
const aggregateRows = (rows, measures, dimensions, resolveDimensionField) => {
  if (!dimensions.length) {
    if (!measures.length) {
      return rows;
    }
    const aggregateState = buildAggregateState(measures);
    rows.forEach((row) => {
      measures.forEach((measure) => {
        const state = aggregateState[measure.id];
        if (!state) {
          return;
        }
        if (measure.op === "COUNT") {
          state.count += 1;
          return;
        }
        const value = parseNumericValue(row?.[measure.field]);
        if (value === null) {
          return;
        }
        state.sum += value;
        state.count += 1;
        state.min = state.min === null ? value : Math.min(state.min, value);
        state.max = state.max === null ? value : Math.max(state.max, value);
      });
    });
    return [finalizeAggregates(aggregateState, measures)];
  }

  if (!measures.length) {
    return rows.map((row) =>
      dimensions.reduce((acc, dimensionId) => {
        const fieldId = resolveDimensionField(dimensionId);
        acc[dimensionId] = row?.[fieldId] ?? null;
        return acc;
      }, {})
    );
  }

  const grouped = new Map();
  rows.forEach((row) => {
    const dimensionValues = dimensions.map((dimensionId) => {
      const fieldId = resolveDimensionField(dimensionId);
      return row?.[fieldId] ?? null;
    });
    const key = JSON.stringify(dimensionValues);
    if (!grouped.has(key)) {
      grouped.set(key, {
        dimensions: dimensionValues,
        aggregates: buildAggregateState(measures),
      });
    }
    const entry = grouped.get(key);
    measures.forEach((measure) => {
      const state = entry.aggregates[measure.id];
      if (measure.op === "COUNT") {
        state.count += 1;
        return;
      }
      const value = parseNumericValue(row?.[measure.field]);
      if (value === null) {
        return;
      }
      state.sum += value;
      state.count += 1;
      state.min = state.min === null ? value : Math.min(state.min, value);
      state.max = state.max === null ? value : Math.max(state.max, value);
    });
  });

  return Array.from(grouped.values()).map((entry) => {
    const row = dimensions.reduce((acc, dimensionId, index) => {
      acc[dimensionId] = entry.dimensions[index];
      return acc;
    }, {});
    return { ...row, ...finalizeAggregates(entry.aggregates, measures) };
  });
};

/**
 * Builds a data provider for local dataset bindings.
 *
 * @param {{ rows?: Object[], columns?: Object[], semanticLayer?: Object|null }} [options] - The dataset inputs.
 * @returns {DataProvider} The data provider.
 */
export const createLocalDataProvider = ({
  rows = [],
  columns = [],
  semanticLayer = null,
} = {}) => {
  const columnMap = new Map(columns.map((column) => [column.id, column]));
  const dimensionMap = new Map(
    (semanticLayer?.dimensions || []).map((dimension) => [
      dimension.id,
      dimension,
    ])
  );
  const metricMap = new Map(
    (semanticLayer?.metrics || []).map((metric) => [metric.id, metric])
  );

  /**
   * Resolves the data type for a column.
   *
   * @param {string} fieldId - The field id.
   * @returns {string} The field type.
   */
  const resolveFieldType = (fieldId) =>
    columnMap.get(fieldId)?.type ||
    columnMap.get(fieldId)?.inferredType ||
    "string";

  /**
   * Resolves the source field id for a dimension.
   *
   * @param {string} dimensionId - The dimension id.
   * @returns {string} The source field id.
   */
  const resolveDimensionField = (dimensionId) =>
    dimensionMap.get(dimensionId)?.sourceField || dimensionId;

  /**
   * Resolves a measure definition for aggregation.
   *
   * @param {string} measureId - The measure id.
   * @returns {{ id: string, field: string, op: string }} The measure definition.
   */
  const resolveMeasure = (measureId) => {
    const metric = metricMap.get(measureId);
    if (metric?.query?.field) {
      return {
        id: measureId,
        field: metric.query.field,
        op: metric.query.op || "SUM",
      };
    }
    return {
      id: measureId,
      field: measureId,
      op: "SUM",
    };
  };

  /**
   * Executes a query against local dataset bindings.
   *
   * @param {Object} querySpec - The query spec.
   * @returns {Promise<{ rows: Object[], meta: Object }>} The query result.
   */
  const runQuery = async (querySpec) => {
    const measures = Array.isArray(querySpec?.measures)
      ? querySpec.measures.map(resolveMeasure)
      : [];
    const dimensions = Array.isArray(querySpec?.dimensions)
      ? querySpec.dimensions
      : [];
    const filters = Array.isArray(querySpec?.filters)
      ? querySpec.filters
      : [];

    const filteredRows = filterRows(
      rows,
      filters,
      resolveFieldType,
      resolveDimensionField
    );
    const aggregated = aggregateRows(
      filteredRows,
      measures,
      dimensions,
      resolveDimensionField
    );

    const offset = Number.isFinite(querySpec?.offset) ? querySpec.offset : 0;
    const limit = Number.isFinite(querySpec?.limit) ? querySpec.limit : null;
    const sliced = limit
      ? aggregated.slice(offset, offset + limit)
      : aggregated.slice(offset);

    return {
      rows: sliced,
      meta: {
        rowCount: sliced.length,
        totalRows: aggregated.length,
        filteredRows: filteredRows.length,
      },
    };
  };

  return createDataProvider(runQuery);
};
`;

const buildDashboardComponentSource = ({
  componentName,
  fileBase,
  hasFilterBar,
  hasDataProvider,
  hasMultiApiProviders,
  apiDatasourceId,
  themeFamily,
  themeMode,
  paletteId,
}) => {
  const apiImport = hasDataProvider
    ? hasMultiApiProviders
      ? `\nimport createExternalApiMultiProvider, { ApiDataProviders } from "./deps/${fileBase}.dataProvider.js";`
      : `\nimport createExternalApiProvider from "./deps/${fileBase}.dataProvider.js";`
    : '';
  const apiDatasourceKey = apiDatasourceId
    ? `"${apiDatasourceId}"`
    : 'dashboardConfig.datasetId';
  const apiProvidersInit = hasDataProvider
    ? hasMultiApiProviders
      ? ''
      : `\nconst ApiDataProviders = { [${apiDatasourceKey}]: createExternalApiProvider() };`
    : '\nconst ApiDataProviders = {};';
  const imports = `import { useEffect, useMemo, useState } from "react";
import {
  DashboardProvider,
  GridLayout,
  Panel,
  VizRenderer,
  buildQuerySpec,
  createMultiDataProvider,
  registerCharts,
  registerInsights,
  useDashboardState,
  useQuery,
  ErrorBoundary
} from "ladf";
import dashboardConfig from "./deps/${fileBase}.dashboard.js";${apiImport}${hasFilterBar ? `\nimport LazyFilterBar from "./utils/LazyFilterBar.jsx";` : ""}`;
  const providerImports = `\nimport { createLocalDataProvider } from "./utils/localDataProvider.js";`;
  const filterBarBlock = hasFilterBar
    ? `        <LazyFilterBar
          fields={panel.encodings?.fields}
          options={panel.options}
          datasetBinding={datasetBinding}
          semanticLayer={semanticLayer}
        />`
    : `        <div className="ladf-panel__body">
          Filter Bar widget found but no filter bar component is included.
        </div>`;

  const normalizedThemeFamily = JSON.stringify(themeFamily || 'default');
  const normalizedThemeMode = JSON.stringify(
    themeMode === 'dark' ? 'dark' : 'light'
  );
  const normalizedPaletteId = JSON.stringify(paletteId || 'analytics');
  const serializedThemeClassMap = JSON.stringify(THEME_CLASS_MAP, null, 2);
  const serializedPaletteIds = JSON.stringify(
    PALETTE_OPTIONS.map((palette) => palette.id),
    null,
    2
  );

  return `${imports}${providerImports}${apiProvidersInit}

/**
 * Maps theme families and modes to the CSS classes expected by LADF themes.
 * Generated from the runtime theme registry so we can resolve and validate
 * incoming theme settings safely.
 * @type {Record<string, Record<string, string>>}
 */
const THEME_CLASS_MAP = ${serializedThemeClassMap};

/**
 * Available palette identifiers for exported dashboards.
 * @type {string[]}
 */
const PALETTE_IDS = ${serializedPaletteIds};

/**
 * Flat list of all theme classes so we can remove them before applying new ones.
 * @type {string[]}
 */
const ALL_THEME_CLASSES = Object.values(THEME_CLASS_MAP).flatMap((modes) =>
  Object.values(modes)
);
/**
 * Flat list of palette classes used by LADF.
 * @type {string[]}
 */
const ALL_PALETTE_CLASSES = PALETTE_IDS.map((id) => "ladf-palette-" + id);

/**
 * Storage key used for persisting theme preferences between reloads.
 * @type {string}
 */
const THEME_SETTINGS_STORAGE_KEY = ${JSON.stringify(THEME_SETTINGS_STORAGE_KEY)};

/**
 * Default theme settings used when no export or stored settings are present.
 */
const DEFAULT_THEME_FAMILY = "default";
const DEFAULT_THEME_MODE = "light";
const DEFAULT_PALETTE_ID = "analytics";

/**
 * Theme settings baked into the exported dashboard bundle.
 */
const EXPORTED_THEME_FAMILY = ${normalizedThemeFamily};
const EXPORTED_THEME_MODE = ${normalizedThemeMode};
const EXPORTED_PALETTE_ID = ${normalizedPaletteId};

/**
 * @typedef {function(Object): Promise<{ rows: Object[], meta: Object }>} DataProvider
 */

/**
 * @typedef {Object} DashboardProps
 * @property {DataProvider} [dataProvider] - Optional multi-datasource provider.
 * @property {Record<string, DataProvider>} [dataProviders] - Providers keyed by datasource id.
 * @property {Array<{ id: string, name?: string, datasetBinding?: Object, semanticLayer?: Object }>} [datasources]
 *   - Datasource definitions for local previews.
 * @property {{ rows?: Object[], columns?: Object[], previewRows?: Object[] }} [datasetBinding] - Legacy dataset binding.
 * @property {{ enabled?: boolean, exportDatasetConfig?: boolean, dimensions?: Object[], metrics?: Object[] }} [semanticLayer] - Legacy semantic layer config.
 * @property {string} [themeFamily] - Theme family id (for example: default, nord).
 * @property {'light'|'dark'} [themeMode] - Active theme mode.
 * @property {string} [paletteId] - Active palette id.
 */

/**
 * The API-backed data provider, when exported with external API configs.
 * @type {DataProvider|null}
 */
const ApiDataProvider = ${
  hasDataProvider
    ? hasMultiApiProviders
      ? "createExternalApiMultiProvider()"
      : "createMultiDataProvider(ApiDataProviders)"
    : "null"
};

/**
 * Resolves a theme family to a known key from the theme registry.
 *
 * @param {string|undefined|null} value
 * @returns {string} The resolved theme family id.
 */
const resolveThemeFamily = (value) =>
  value && THEME_CLASS_MAP[value] ? value : DEFAULT_THEME_FAMILY;

/**
 * Resolves the theme mode, falling back to the default mode when invalid.
 *
 * @param {string|undefined|null} value
 * @returns {"light"|"dark"} The resolved theme mode.
 */
const resolveThemeMode = (value) =>
  value === "dark" || value === "light" ? value : DEFAULT_THEME_MODE;

/**
 * Resolves a palette id to one of the available palette ids.
 *
 * @param {string|undefined|null} value
 * @returns {string} The resolved palette id.
 */
const resolvePaletteId = (value) =>
  PALETTE_IDS.includes(value) ? value : DEFAULT_PALETTE_ID;

/**
 * Reads theme preferences from local storage.
 *
 * @returns {{ themeFamily?: string, themeMode?: string, paletteId?: string }}
 *   The stored theme settings, if any.
 */
const readStoredThemeSettings = () => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(THEME_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Persists theme preferences to local storage so the user's choice survives
 * refreshes.
 *
 * @param {{ themeFamily: string, themeMode: "light"|"dark", paletteId: string }} settings
 * @returns {void}
 */
const persistThemeSettings = ({ themeFamily, themeMode, paletteId }) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const stored = readStoredThemeSettings();
    window.localStorage.setItem(
      THEME_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        ...stored,
        themeFamily,
        themeMode,
        paletteId,
      })
    );
  } catch {
    // no-op
  }
};

/**
 * Normalizes datasource inputs into an array.
 *
 * @param {DashboardProps["datasources"]} datasources
 * @param {Object} datasetBinding
 * @param {Object} semanticLayer
 * @returns {Array<Object>} The normalized datasource list.
 */
const normalizeDatasources = (datasources, datasetBinding, semanticLayer) => {
  if (Array.isArray(datasources) && datasources.length > 0) {
    return datasources.map((datasource) => ({
      id: datasource.id,
      name: datasource.name || datasource.id,
      datasetBinding: datasource.datasetBinding || null,
      semanticLayer: datasource.semanticLayer || null,
    }));
  }
  return [
    {
      id: dashboardConfig.datasetId,
      name: dashboardConfig.title || dashboardConfig.datasetId,
      datasetBinding: datasetBinding || null,
      semanticLayer: semanticLayer || null,
    },
  ];
};

/**
 * Renders a single dashboard panel.
 *
 * @param {{ panel: Object, dataProvider: DataProvider, datasetBinding: Object, semanticLayer: Object|null }} props - The panel props.
 * @returns {JSX.Element} The panel markup.
 */
const VizPanel = ({ panel, dataProvider, datasetBinding, semanticLayer }) => {
  // Filter bar panels are rendered locally and do not execute queries.
  const dashboardState = useDashboardState();
  const isFilterBar = panel?.panelType === "viz" && panel?.vizType === "filterBar";
  const querySpec = useMemo(
    () => (isFilterBar ? {} : buildQuerySpec(panel, dashboardState)),
    [panel, dashboardState, isFilterBar]
  );
  const { data, loading, error } = useQuery(querySpec, {
    provider: dataProvider,
    enabled: !isFilterBar,
  });
  const isEmpty = !loading && !error && (!data || data.length === 0);
  const status = loading ? "loading" : error ? "error" : "ready";

  if (isFilterBar) {
    return (
      <Panel title={panel.title} subtitle={panel.subtitle} status="ready">
${filterBarBlock}
      </Panel>
    );
  }

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

/**
 * Renders the dashboard content layout.
 *
 * @param {{ dataProvider: DataProvider, datasourcesById: Map<string, Object>, defaultDatasource: Object }} props - The content props.
 * @returns {JSX.Element} The content markup.
 */
const DashboardContent = ({
  dataProvider,
  datasourcesById,
  defaultDatasource,
  themeMode,
  onToggleTheme,
}) => (
  <section className="ladf-dashboard">
    <header className="ladf-dashboard__header">
      <div>
        <h1 className="ladf-dashboard__title">{dashboardConfig.title}</h1>
        <p className="ladf-dashboard__subtitle">{dashboardConfig.subtitle}</p>
      </div>
      <button
        type="button"
        className="ladf-button ladf-dashboard__toggle"
        onClick={onToggleTheme}
        aria-pressed={themeMode === "dark"}
      >
        {themeMode === "dark" ? "Switch to Light" : "Switch to Dark"}
      </button>
    </header>
    <GridLayout
      panels={dashboardConfig.panels}
      renderPanel={(panel) => {
        const datasource =
          datasourcesById.get(panel.datasetId) || defaultDatasource;
        return (
          <VizPanel
            key={panel.id}
            panel={panel}
            dataProvider={dataProvider}
            datasetBinding={datasource?.datasetBinding}
            semanticLayer={datasource?.semanticLayer}
          />
        );
      }}
    />
  </section>
);

/**
 * Renders the exported dashboard component.
 *
 * @param {DashboardProps} props - The component props.
 * @returns {JSX.Element} The dashboard markup.
 */
const ${componentName} = ({
  dataProvider,
  dataProviders,
  datasources,
  datasetBinding,
  semanticLayer,
  themeFamily,
  themeMode,
  paletteId,
}) => {
  useEffect(() => {
    // Ensure LADF visual registry is ready for runtime rendering.
    registerCharts();
    registerInsights();
  }, []);

  const [resolvedThemeFamily, setResolvedThemeFamily] = useState(
    DEFAULT_THEME_FAMILY
  );
  const [resolvedThemeMode, setResolvedThemeMode] = useState(DEFAULT_THEME_MODE);
  const [resolvedPaletteId, setResolvedPaletteId] = useState(DEFAULT_PALETTE_ID);

  useEffect(() => {
    // Merge explicit props, stored preferences, and export defaults.
    const stored = readStoredThemeSettings();
    const nextThemeFamily = resolveThemeFamily(
      themeFamily || stored.themeFamily || EXPORTED_THEME_FAMILY
    );
    const nextThemeMode = resolveThemeMode(
      themeMode || stored.themeMode || EXPORTED_THEME_MODE
    );
    const nextPaletteId = resolvePaletteId(
      paletteId || stored.paletteId || EXPORTED_PALETTE_ID
    );

    setResolvedThemeFamily(nextThemeFamily);
    setResolvedThemeMode(nextThemeMode);
    setResolvedPaletteId(nextPaletteId);
  }, [themeFamily, themeMode, paletteId]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    // Update the root element so LADF theme and palette classes take effect.
    const root = document.documentElement;
    const themeClass = THEME_CLASS_MAP[resolvedThemeFamily][resolvedThemeMode];

    root.classList.remove(...ALL_THEME_CLASSES, ...ALL_PALETTE_CLASSES);
    root.classList.add(themeClass, "ladf-palette-" + resolvedPaletteId);
  }, [resolvedThemeFamily, resolvedThemeMode, resolvedPaletteId]);

  const normalizedDatasources = useMemo(
    () => normalizeDatasources(datasources, datasetBinding, semanticLayer),
    [datasources, datasetBinding, semanticLayer]
  );
  const datasourcesById = useMemo(
    () =>
      new Map(
        normalizedDatasources.map((datasource) => [datasource.id, datasource])
      ),
    [normalizedDatasources]
  );
  const defaultDatasource =
    datasourcesById.get(dashboardConfig.datasetId) ||
    normalizedDatasources[0] ||
    null;

  const localProviders = useMemo(() => {
    // Build local providers for any datasources that include inline rows/columns.
    const next = {};
    normalizedDatasources.forEach((datasource) => {
      const binding = datasource?.datasetBinding || {};
      const rows = Array.isArray(binding?.rows)
        ? binding.rows
        : Array.isArray(binding?.previewRows)
          ? binding.previewRows
          : [];
      const columns = Array.isArray(binding?.columns) ? binding.columns : [];
      const resolvedLayer =
        datasource?.semanticLayer?.enabled ? datasource.semanticLayer : null;
      next[datasource.id] = createLocalDataProvider({
        rows,
        columns,
        semanticLayer: resolvedLayer,
      });
    });
    return next;
  }, [normalizedDatasources]);
  const resolvedProviderMap = useMemo(
    () => ({
      ...localProviders,
      ...ApiDataProviders,
      ...(dataProviders || {}),
    }),
    [localProviders, dataProviders]
  );
  // Pick a fallback provider so queries have a default datasource.
  const fallbackProvider =
    resolvedProviderMap[dashboardConfig.datasetId] ||
    resolvedProviderMap[Object.keys(resolvedProviderMap)[0]] ||
    null;
  const resolvedProvider = useMemo(() => {
    // Favor the user-supplied provider, otherwise wrap the resolved map.
    if (dataProvider) {
      return dataProvider;
    }
    return createMultiDataProvider(resolvedProviderMap, {
      defaultProvider: fallbackProvider,
    });
  }, [dataProvider, resolvedProviderMap, fallbackProvider]);
  
  /**
   * Reloads the page when the error boundary requests a reset.
   *
   * @returns {void}
   */
  const handleResetApp = () => {
    window.location.reload();
  };

  /**
   * Toggles the active theme mode and persists the choice.
   *
   * @returns {void}
   */
  const handleToggleTheme = () => {
    setResolvedThemeMode((current) => {
      const nextMode = current === "dark" ? "light" : "dark";
      persistThemeSettings({
        themeFamily: resolvedThemeFamily,
        themeMode: nextMode,
        paletteId: resolvedPaletteId,
      });
      return nextMode;
    });
  };

  return (
    <main className="ladf-app__content">
      <ErrorBoundary
          title="Dashboard failed to load"
          message="The dashboard encountered an unexpected error. Reload the page to retry."
          onReset={handleResetApp}
      >
        <DashboardProvider
          initialState={{
            dashboardId: dashboardConfig.id,
            datasetId: dashboardConfig.datasetId,
          }}
        >
          <DashboardContent
            dataProvider={resolvedProvider}
            datasourcesById={datasourcesById}
            defaultDatasource={defaultDatasource}
            themeMode={resolvedThemeMode}
            onToggleTheme={handleToggleTheme}
          />
        </DashboardProvider>
      </ErrorBoundary>
    </main>
  );
};

export { ApiDataProvider };
export default ${componentName};
`;
};

/**
 * Creates an export plan and file map for a dashboard bundle.
 *
 * @param {DashboardExportInput} [options]
 * @returns {DashboardExportPlan|null} The export plan, or null when missing input.
 */
export const buildDashboardExport = ({
  dashboard,
  authoringModel,
  compiled,
  themeFamily,
  themeMode,
  paletteId,
} = {}) => {
  if (!dashboard) {
    return null;
  }
  const exportNames = getDashboardExportNames(dashboard);
  const resolvedModel = authoringModel || {};
  const compiledOutput =
    compiled || compileAuthoringModel({ dashboard, authoringModel: resolvedModel });
  const modules = compiledOutput.modules || {};
  const hasFilterBar = (compiledOutput.config?.panels || []).some(
    (panel) => panel?.panelType === 'viz' && panel?.vizType === 'filterBar'
  );
  const resolvedDatasources =
    Array.isArray(resolvedModel?.datasources) && resolvedModel.datasources.length
      ? resolvedModel.datasources
      : [
          {
            id:
              compiledOutput.config?.datasetId ||
              `${dashboard?.id || 'dashboard'}_dataset`,
            name: resolvedModel?.meta?.title || dashboard?.name || 'Dataset',
            datasetBinding: resolvedModel?.datasetBinding || null,
            semanticLayer: resolvedModel?.semanticLayer || {
              enabled: false,
              exportDatasetConfig: false,
              metrics: [],
              dimensions: [],
            },
        },
      ];
  const defaultDatasourceId =
    compiledOutput.config?.datasetId || resolvedDatasources[0]?.id || null;
  const defaultDatasource =
    resolvedDatasources.find((datasource) => datasource?.id === defaultDatasourceId) ||
    resolvedDatasources[0] ||
    null;
  const defaultSemanticLayer =
    defaultDatasource?.semanticLayer ||
    resolvedModel?.semanticLayer || {
      enabled: false,
      exportDatasetConfig: false,
      metrics: [],
      dimensions: [],
    };
  const shouldExportDefaultDataset = Boolean(
    defaultSemanticLayer?.exportDatasetConfig
  );
  const apiDatasourceIds = resolvedDatasources
    .filter((datasource) => datasource?.datasetBinding?.source?.type === 'api')
    .map((datasource) => datasource.id)
    .filter(Boolean);
  const apiDatasourceCount = apiDatasourceIds.length;
  const fallbackDataset = shouldExportDefaultDataset
    ? generateModule(
        'datasetConfig',
        {
          id:
            compiledOutput.config?.datasetId ||
            `${dashboard?.id || 'dashboard'}_dataset`,
          label: resolvedModel?.meta?.title || dashboard?.name || 'Dataset',
          description: resolvedModel?.meta?.description || '',
          dimensions: defaultSemanticLayer?.dimensions || [],
          metrics: defaultSemanticLayer?.metrics || [],
        },
        {
          doc: `/**
 * Dataset config
 *
 * @typedef {Object} DatasetConfig
 * @property {string} id - The dataset id.
 * @property {string} label - The dataset label.
 * @property {string} description - The dataset description.
 * @property {Object[]} dimensions - The semantic layer dimensions.
 * @property {Object[]} metrics - The semantic layer metrics.
 *
 * @type {DatasetConfig}
 */`,
        }
      )
    : null;
  const fallbackDimensions = shouldExportDefaultDataset
    ? generateModule(
        'dimensions',
        defaultSemanticLayer?.dimensions || [],
        {
          doc: `/**
 * Dimension definitions
 * @type {Object[]}
 */`,
        }
      )
    : null;
  const fallbackMetrics = shouldExportDefaultDataset
    ? generateModule(
        'metrics',
        defaultSemanticLayer?.metrics || [],
        {
          doc: `/**
 * Metric definitions
 * @type {Object[]}
 */`,
        }
      )
    : null;
  const files = {};
  files[`deps/${exportNames.fileBase}.dashboard.js`] = modules.dashboard || '';
  if (shouldExportDefaultDataset) {
    files[`deps/${exportNames.fileBase}.dataset.js`] =
      modules.dataset || fallbackDataset;
    files[`deps/${exportNames.fileBase}.dimensions.js`] =
      modules.dimensions || fallbackDimensions;
    files[`deps/${exportNames.fileBase}.metrics.js`] =
      modules.metrics || fallbackMetrics;
  }
  const datasetsById = modules.datasets || {};
  const metricsById = modules.metricsById || {};
  const dimensionsById = modules.dimensionsById || {};
  resolvedDatasources.forEach((datasource) => {
    const datasourceId = datasource?.id;
    if (!datasourceId) {
      return;
    }
    const semanticLayer = datasource.semanticLayer || {
      enabled: false,
      exportDatasetConfig: false,
      metrics: [],
      dimensions: [],
    };
    if (!semanticLayer.exportDatasetConfig) {
      return;
    }
    const datasetFallback = generateModule(
      'datasetConfig',
      {
        id: datasourceId,
        label: datasource.name || datasourceId,
        description: resolvedModel?.meta?.description || '',
        dimensions: semanticLayer.dimensions || [],
        metrics: semanticLayer.metrics || [],
      },
      {
        doc: `/**
 * Dataset config
 *
 * @typedef {Object} DatasetConfig
 * @property {string} id - The dataset id.
 * @property {string} label - The dataset label.
 * @property {string} description - The dataset description.
 * @property {Object[]} dimensions - The semantic layer dimensions.
 * @property {Object[]} metrics - The semantic layer metrics.
 *
 * @type {DatasetConfig}
 */`,
      }
    );
    const dimensionsFallback = generateModule(
      'dimensions',
      semanticLayer.dimensions || [],
      {
        doc: `/**
 * Dimension definitions
 * @type {Object[]}
 */`,
      }
    );
    const metricsFallback = generateModule(
      'metrics',
      semanticLayer.metrics || [],
      {
        doc: `/**
 * Metric definitions
 * @type {Object[]}
 */`,
      }
    );
    files[`deps/${exportNames.fileBase}.dataset.${datasourceId}.js`] =
      datasetsById[datasourceId] || datasetFallback;
    files[`deps/${exportNames.fileBase}.dimensions.${datasourceId}.js`] =
      dimensionsById[datasourceId] || dimensionsFallback;
    files[`deps/${exportNames.fileBase}.metrics.${datasourceId}.js`] =
      metricsById[datasourceId] || metricsFallback;
  });
  if (modules.dataProvider) {
    files[`deps/${exportNames.fileBase}.dataProvider.js`] = modules.dataProvider;
  }
  if (hasFilterBar) {
    files['utils/LazyFilterBar.jsx'] = buildFilterBarSource();
  }
  files['utils/localDataProvider.js'] = buildLocalDataProviderSource();
  files[`${exportNames.componentName}.jsx`] = buildDashboardComponentSource({
    componentName: exportNames.componentName,
    fileBase: exportNames.fileBase,
    hasFilterBar,
    hasDataProvider: Boolean(modules.dataProvider),
    hasMultiApiProviders: apiDatasourceCount > 1,
    apiDatasourceId: apiDatasourceIds[0] || null,
    themeFamily,
    themeMode,
    paletteId,
  });
  return {
    ...exportNames,
    files,
  };
};

/**
 * Builds a zip archive for the export plan.
 *
 * @param {DashboardExportPlan|null} exportPlan
 * @returns {Promise<Blob|null>} The zip blob, or null when there is no plan.
 */
export const createDashboardZip = async (exportPlan) => {
  if (!exportPlan) {
    return null;
  }
  const zip = new JSZip();
  const root = zip.folder(exportPlan.folderName);
  Object.entries(exportPlan.files || {}).forEach(([path, content]) => {
    root.file(path, content || '');
  });
  return zip.generateAsync({ type: 'blob' });
};

/**
 * Triggers a browser download for the export plan.
 *
 * @param {DashboardExportPlan|null} exportPlan
 * @returns {Promise<boolean>} True when a download was initiated.
 */
export const downloadDashboardZip = async (exportPlan) => {
  const zipBlob = await createDashboardZip(exportPlan);
  if (!zipBlob) {
    return false;
  }
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${exportPlan.folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
};
