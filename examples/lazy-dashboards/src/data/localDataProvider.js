import { createDataProvider } from 'radf';

/**
 * @typedef {Object} DatasetColumn
 * @property {string} id
 * @property {string} [type]
 * @property {string} [inferredType]
 */

/**
 * @typedef {Object} SemanticLayer
 * @property {Object[]} [dimensions]
 * @property {Object[]} [metrics]
 */

/**
 * @typedef {Object} LocalDataProviderInput
 * @property {Object[]} [rows]
 * @property {DatasetColumn[]} [columns]
 * @property {SemanticLayer|null} [semanticLayer]
 */

/**
 * @typedef {Object} QuerySpec
 * @property {string[]} [measures]
 * @property {string[]} [dimensions]
 * @property {Object[]} [filters]
 * @property {number} [offset]
 * @property {number} [limit]
 */

/**
 * @typedef {Object} DataProviderResult
 * @property {Object[]} rows
 * @property {{ rowCount: number, totalRows: number, filteredRows: number }} meta
 */

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return '';
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
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    isNegative = true;
    cleaned = cleaned.slice(1, -1);
  }
  let isPercent = false;
  if (cleaned.endsWith('%')) {
    isPercent = true;
    cleaned = cleaned.slice(0, -1);
  }
  cleaned = cleaned.replace(/[$€£¥]/g, '');
  cleaned = cleaned.replace(/,/g, '');
  cleaned = cleaned.trim();
  if (!cleaned || !/^[-+]?\d*\.?\d+$/.test(cleaned)) {
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
  if (['true', 'yes', 'y'].includes(value)) {
    return true;
  }
  if (['false', 'no', 'n'].includes(value)) {
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
  if (type === 'number') {
    return parseNumericValue(raw);
  }
  if (type === 'date') {
    return parseDateValue(raw);
  }
  if (type === 'bool' || type === 'boolean') {
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
  if (typeof left === 'number' && typeof right === 'number') {
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
      const op = String(filter.op || filter.operator || 'IN').toUpperCase();
      const values = resolveFilterValues(filter, type);
      const value = values[0];

      if (op === 'IN') {
        return values.some((candidate) => candidate === rowValue);
      }
      if (op === 'EQ') {
        return rowValue === value;
      }
      if (op === 'NEQ') {
        return rowValue !== value;
      }
      if (op === 'CONTAINS') {
        return String(rowValue).includes(String(value ?? ''));
      }
      if (op === 'BETWEEN') {
        const maxValue = values[1];
        if (value === null || maxValue === null) {
          return false;
        }
        return (
          compareValues(rowValue, value) >= 0 &&
          compareValues(rowValue, maxValue) <= 0
        );
      }
      if (op === 'GT') {
        return compareValues(rowValue, value) > 0;
      }
      if (op === 'GTE') {
        return compareValues(rowValue, value) >= 0;
      }
      if (op === 'LT') {
        return compareValues(rowValue, value) < 0;
      }
      if (op === 'LTE') {
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
    if (op === 'AVG') {
      row[measure.id] = state.count ? state.sum / state.count : null;
      return;
    }
    if (op === 'MIN') {
      row[measure.id] = state.min;
      return;
    }
    if (op === 'MAX') {
      row[measure.id] = state.max;
      return;
    }
    if (op === 'COUNT') {
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
        if (measure.op === 'COUNT') {
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
      if (measure.op === 'COUNT') {
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
 * Creates a data provider that filters and aggregates local rows.
 *
 * @param {LocalDataProviderInput} [options]
 * @returns {function(QuerySpec): Promise<DataProviderResult>} The data provider.
 */
export const createLocalDataProvider = ({
  rows = [],
  columns = [],
  semanticLayer = null,
} = {}) => {
  const columnMap = new Map(
    columns.map((column) => [column.id, column])
  );
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
    columnMap.get(fieldId)?.type || columnMap.get(fieldId)?.inferredType || 'string';

  const resolveDimensionField = (dimensionId) =>
    dimensionMap.get(dimensionId)?.sourceField || dimensionId;

  const resolveMeasure = (measureId) => {
    const metric = metricMap.get(measureId);
    if (metric?.query?.field) {
      return {
        id: measureId,
        field: metric.query.field,
        op: metric.query.op || 'SUM',
      };
    }
    return {
      id: measureId,
      field: measureId,
      op: 'SUM',
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

    const offset = Number.isFinite(querySpec?.offset)
      ? querySpec.offset
      : 0;
    const limit = Number.isFinite(querySpec?.limit)
      ? querySpec.limit
      : null;
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
