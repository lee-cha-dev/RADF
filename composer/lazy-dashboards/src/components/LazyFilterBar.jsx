import { useMemo, useState } from 'react';
import {
  dashboardSelectors,
  removeBrushFilter,
  upsertBrushFilter,
  useDashboardActions,
  useDashboardState,
} from 'radf';

/**
 * @typedef {Object} FilterBarOptions
 * @property {boolean} [allowMultiSelect]
 * @property {boolean} [showSearch]
 * @property {boolean} [showClear]
 * @property {'inline'|'stacked'} [layout]
 */

/**
 * @typedef {Object} DatasetBinding
 * @property {{ id: string, label?: string, type?: string, inferredType?: string }[]} [columns]
 * @property {Object[]} [rows]
 */

/**
 * @typedef {Object} SemanticLayer
 * @property {{ id: string, label?: string, type?: string, sourceField?: string }[]} [dimensions]
 */

/**
 * @typedef {Object} LazyFilterBarProps
 * @property {string|string[]} fields
 * @property {DatasetBinding} datasetBinding
 * @property {SemanticLayer} [semanticLayer]
 * @property {FilterBarOptions} [options]
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
  dimension?.type || column?.type || column?.inferredType || 'string';

const getFieldLabel = (column, dimension, fieldId) =>
  dimension?.label || column?.label || fieldId;

const getDistinctValues = (rows, fieldId, limit) => {
  const seen = new Set();
  const values = [];
  for (let i = 0; i < rows.length; i += 1) {
    const raw = rows[i]?.[fieldId];
    if (raw === null || raw === undefined || raw === '') {
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
  if (type === 'number') {
    return [...values].sort((a, b) => Number(a) - Number(b));
  }
  if (type === 'date') {
    return [...values].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }
  if (type === 'boolean') {
    return [...values].sort((a, b) => a.localeCompare(b));
  }
  return [...values].sort((a, b) => a.localeCompare(b));
};

/**
 * Renders a dashboard filter bar bound to dataset values.
 *
 * @param {LazyFilterBarProps} props
 * @returns {JSX.Element}
 */
const LazyFilterBar = ({
  fields,
  datasetBinding,
  semanticLayer,
  options,
}) => {
  const dashboardState = useDashboardState();
  const { setGlobalFilters } = useDashboardActions();
  const globalFilters = dashboardSelectors.selectGlobalFilters(dashboardState);
  const [searchByField, setSearchByField] = useState({});
  const allowMultiSelect = options?.allowMultiSelect !== false;
  const showSearch = options?.showSearch !== false;
  const showClear = options?.showClear !== false;
  const layout = options?.layout === 'stacked' ? 'stacked' : 'inline';

  const columns = useMemo(() => datasetBinding?.columns || [], [
    datasetBinding?.columns,
  ]);
  const rows = useMemo(() => datasetBinding?.rows || [], [datasetBinding?.rows]);
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
          columnMap.get(fieldId) ||
          columnMap.get(dimension?.sourceField || '');
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
        ? { field: fieldId, op: 'IN', values: trimmed }
        : null;
    const nextFilters = nextFilter
      ? upsertBrushFilter(globalFilters, nextFilter)
      : removeBrushFilter(globalFilters, fieldId);
    setGlobalFilters(nextFilters);
  };

  if (!datasetBinding) {
    return (
      <div className="lazy-filter-bar__empty">
        Import a dataset to enable filter interactions.
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
    <div className={`radf-filter-bar lazy-filter-bar ${layout}`}>
      {resolvedFields.map((field) => {
        const activeFilter = filtersByField.get(field.id);
        const activeValues = Array.isArray(activeFilter?.values)
          ? activeFilter.values.map(String)
          : activeFilter?.value
            ? [String(activeFilter.value)]
            : [];
        const availableValues = valuesByField.get(field.id) || [];
        const searchValue = searchByField[field.id] || '';
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
                value={allowMultiSelect ? activeValues : activeValues[0] || ''}
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
                  handleSelectionChange(
                    field.id,
                    nextValue ? [nextValue] : []
                  );
                }}
              >
                {!allowMultiSelect ? (
                  <option value="">All</option>
                ) : null}
                {visibleValues.map((value) => (
                  <option key={`${field.id}-${value}`} value={value}>
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
