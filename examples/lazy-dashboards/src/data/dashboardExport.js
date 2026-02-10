import JSZip from 'jszip';
import { compileAuthoringModel } from '../authoring/compiler.js';

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
} from "radf";

/**
 * @typedef {Object} LazyFilterBarProps
 * @property {string[]|string|null} fields - The field ids to render.
 * @property {{ columns?: Object[], rows?: Object[] }} datasetBinding - The dataset binding.
 * @property {{ dimensions?: Object[] }} semanticLayer - The semantic layer details.
 * @property {{ allowMultiSelect?: boolean, showSearch?: boolean, showClear?: boolean, layout?: string }} [options] - The filter bar options.
 */

const MAX_DISTINCT_VALUES = 200;

const normalizeFieldList = (fields) => {
  if (Array.isArray(fields)) {
    return fields.map((field) => String(field).trim()).filter(Boolean);
  }
  if (fields) {
    return [String(fields).trim()].filter(Boolean);
  }
  return [];
};

const getFieldType = (column, dimension) =>
  dimension?.type || column?.type || column?.inferredType || "string";

const getFieldLabel = (column, dimension, fieldId) =>
  dimension?.label || column?.label || fieldId;

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
    <div className={\`radf-filter-bar lazy-filter-bar \${layout}\`}>
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
          <div key={field.id} className="radf-filter-bar__group">
            <span className="radf-filter-bar__label">{field.label}</span>
            <div className="radf-filter-bar__inputs">
              {showSearch ? (
                <input
                  className="radf-filter-bar__input"
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
                className="radf-filter-bar__input lazy-filter-bar__select"
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
                  className="radf-filter-bar__button radf-filter-bar__button--ghost"
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
          className="radf-filter-bar__clear"
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

const buildLocalDataProviderSource = () => `import { createDataProvider } from "radf";

/**
 * @typedef {Object} DatasetBinding
 * @property {Object[]} [rows] - The dataset rows.
 * @property {Object[]} [columns] - The dataset columns.
 */

/**
 * @typedef {function(Object): Promise<{ rows: Object[], meta: Object }>} DataProvider
 */

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

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

const resolveFilterValues = (filter, type) => {
  if (Array.isArray(filter?.values)) {
    return filter.values.map((value) => coerceValue(value, type));
  }
  if (filter?.value !== undefined) {
    return [coerceValue(filter.value, type)];
  }
  return [];
};

const compareValues = (left, right) => {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right));
};

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

  const resolveFieldType = (fieldId) =>
    columnMap.get(fieldId)?.type ||
    columnMap.get(fieldId)?.inferredType ||
    "string";

  const resolveDimensionField = (dimensionId) =>
    dimensionMap.get(dimensionId)?.sourceField || dimensionId;

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

  return createDataProvider(async (querySpec) => {
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
  });
};
`;

const buildDashboardComponentSource = ({
  componentName,
  fileBase,
  hasFilterBar,
  hasDataProvider,
}) => {
  const imports = `import { useEffect, useMemo } from "react";
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
} from "radf";
import dashboardConfig from "./deps/${fileBase}.dashboard.js";${hasDataProvider ? `\nimport createExternalApiProvider from "./deps/${fileBase}.dataProvider.js";` : ""}${hasFilterBar ? `\nimport LazyFilterBar from "./utils/LazyFilterBar.jsx";` : ""}`;
  const providerImports = `\nimport { createLocalDataProvider } from "./utils/localDataProvider.js";`;
  const filterBarBlock = hasFilterBar
    ? `        <LazyFilterBar
          fields={panel.encodings?.fields}
          options={panel.options}
          datasetBinding={datasetBinding}
          semanticLayer={semanticLayer}
        />`
    : `        <div className="radf-panel__body">
          Filter Bar widget found but no filter bar component is included.
        </div>`;

  return `${imports}${providerImports}

/**
 * @typedef {function(Object): Promise<{ rows: Object[], meta: Object }>} DataProvider
 */

/**
 * @typedef {Object} DashboardProps
 * @property {DataProvider} [dataProvider] - The optional external data provider.
 * @property {{ rows?: Object[], columns?: Object[], previewRows?: Object[] }} [datasetBinding] - The dataset binding.
 * @property {{ enabled?: boolean, dimensions?: Object[], metrics?: Object[] }} [semanticLayer] - The semantic layer config.
 */

/**
 * The API-backed data provider, when exported with an external API config.
 * @type {DataProvider|null}
 */
const ApiDataProvider = ${hasDataProvider ? "createExternalApiProvider()" : "null"};

const VizPanel = ({ panel, dataProvider, datasetBinding, semanticLayer }) => {
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

const DashboardContent = ({ dataProvider, datasetBinding, semanticLayer }) => (
  <section className="radf-dashboard">
    <header className="radf-dashboard__header">
      <div>
        <h1 className="radf-dashboard__title">{dashboardConfig.title}</h1>
        <p className="radf-dashboard__subtitle">{dashboardConfig.subtitle}</p>
      </div>
    </header>
    <GridLayout
      panels={dashboardConfig.panels}
      renderPanel={(panel) => (
        <VizPanel
          key={panel.id}
          panel={panel}
          dataProvider={dataProvider}
          datasetBinding={datasetBinding}
          semanticLayer={semanticLayer}
        />
      )}
    />
  </section>
);

/**
 * Renders the exported dashboard component.
 *
 * @param {DashboardProps} props - The component props.
 * @returns {JSX.Element} The dashboard markup.
 */
const ${componentName} = ({ dataProvider, datasetBinding, semanticLayer }) => {
  useEffect(() => {
    registerCharts();
    registerInsights();
  }, []);

  const normalizedDataset = useMemo(() => ({
    rows: Array.isArray(datasetBinding?.rows) ? datasetBinding.rows : [],
    columns: Array.isArray(datasetBinding?.columns) ? datasetBinding.columns : [],
    previewRows: Array.isArray(datasetBinding?.previewRows)
      ? datasetBinding.previewRows
      : [],
  }), [datasetBinding]);
  const resolvedSemanticLayer = semanticLayer?.enabled ? semanticLayer : null;
  const localDataProvider = useMemo(
    () => createLocalDataProvider({
      rows: normalizedDataset.rows,
      columns: normalizedDataset.columns,
      semanticLayer: resolvedSemanticLayer,
    }),
    [normalizedDataset, resolvedSemanticLayer]
  );
  const resolvedProvider = dataProvider || localDataProvider;

  return (
    <DashboardProvider
      initialState={{
        dashboardId: dashboardConfig.id,
        datasetId: dashboardConfig.datasetId,
      }}
    >
      <DashboardContent
        dataProvider={resolvedProvider}
        datasetBinding={datasetBinding}
        semanticLayer={semanticLayer}
      />
    </DashboardProvider>
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
  const fallbackDataset = generateModule(
    'datasetConfig',
    {
      id:
        compiledOutput.config?.datasetId ||
        `${dashboard?.id || 'dashboard'}_dataset`,
      label: resolvedModel?.meta?.title || dashboard?.name || 'Dataset',
      description: resolvedModel?.meta?.description || '',
      dimensions: resolvedModel?.semanticLayer?.dimensions || [],
      metrics: resolvedModel?.semanticLayer?.metrics || [],
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
  const fallbackDimensions = generateModule(
    'dimensions',
    resolvedModel?.semanticLayer?.dimensions || [],
    {
      doc: `/**
 * Dimension definitions
 * @type {Object[]}
 */`,
    }
  );
  const fallbackMetrics = generateModule(
    'metrics',
    resolvedModel?.semanticLayer?.metrics || [],
    {
      doc: `/**
 * Metric definitions
 * @type {Object[]}
 */`,
    }
  );
  const files = {};
  files[`deps/${exportNames.fileBase}.dashboard.js`] = modules.dashboard || '';
  files[`deps/${exportNames.fileBase}.dataset.js`] =
    modules.dataset || fallbackDataset;
  files[`deps/${exportNames.fileBase}.dimensions.js`] =
    modules.dimensions || fallbackDimensions;
  files[`deps/${exportNames.fileBase}.metrics.js`] =
    modules.metrics || fallbackMetrics;
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
