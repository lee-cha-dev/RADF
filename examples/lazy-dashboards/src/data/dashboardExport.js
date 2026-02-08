import JSZip from 'jszip';
import { compileAuthoringModel } from '../authoring/compiler.js';

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

const generateModule = (name, payload) => {
  const serialized = JSON.stringify(payload ?? null, null, 2);
  return `const ${name} = ${serialized};\n\nexport default ${name};\n`;
};

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
  MockDataProvider,
} from "radf";
import dashboardConfig from "./deps/${fileBase}.dashboard.js";${hasDataProvider ? `\nimport createExternalApiProvider from "./deps/${fileBase}.dataProvider.js";` : ""}${hasFilterBar ? `\nimport LazyFilterBar from "./utils/LazyFilterBar.jsx";` : ""}`;
  const defaultProvider = hasDataProvider
    ? 'createExternalApiProvider()'
    : 'MockDataProvider';
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

  return `${imports}

const defaultDataProvider = ${defaultProvider};

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

const ${componentName} = ({ dataProvider, datasetBinding, semanticLayer }) => {
  useEffect(() => {
    registerCharts();
    registerInsights();
  }, []);

  const resolvedProvider = dataProvider || defaultDataProvider;

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

export default ${componentName};
`;
};

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
  const fallbackDataset = generateModule('datasetConfig', {
    id: compiledOutput.config?.datasetId || `${dashboard?.id || 'dashboard'}_dataset`,
    label: resolvedModel?.meta?.title || dashboard?.name || 'Dataset',
    description: resolvedModel?.meta?.description || '',
    dimensions: resolvedModel?.semanticLayer?.dimensions || [],
    metrics: resolvedModel?.semanticLayer?.metrics || [],
  });
  const fallbackDimensions = generateModule(
    'dimensions',
    resolvedModel?.semanticLayer?.dimensions || []
  );
  const fallbackMetrics = generateModule(
    'metrics',
    resolvedModel?.semanticLayer?.metrics || []
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
