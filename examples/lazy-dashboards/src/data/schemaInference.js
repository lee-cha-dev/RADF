const MAX_SAMPLE_VALUES = 5;

/**
 * @typedef {Object} DatasetColumn
 * @property {string} id
 * @property {string} [label]
 */

/**
 * @typedef {Object} DatasetTable
 * @property {DatasetColumn[]} columns
 * @property {Object[]} rows
 */

/**
 * @typedef {Object} ColumnProfile
 * @property {string} id
 * @property {string} inferredType
 * @property {string} type
 * @property {string} inferredRole
 * @property {string} role
 * @property {Object} stats
 * @property {string[]} sampleValues
 * @property {Object} coercion
 */

/**
 * @typedef {Object} SchemaInferenceResult
 * @property {DatasetColumn[]} columns
 * @property {ColumnProfile[]} profiles
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

const buildDate = (year, month, day) => {
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const parseDateValue = (raw) => {
  const value = normalizeValue(raw);
  if (!value) {
    return null;
  }

  const isoMatch = value.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/
  );
  if (isoMatch) {
    const date = buildDate(
      Number.parseInt(isoMatch[1], 10),
      Number.parseInt(isoMatch[2], 10),
      Number.parseInt(isoMatch[3], 10)
    );
    if (date) {
      return date;
    }
  }

  const commonMatch = value.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[T\s].*)?$/
  );
  if (commonMatch) {
    const part1 = Number.parseInt(commonMatch[1], 10);
    const part2 = Number.parseInt(commonMatch[2], 10);
    const year = Number.parseInt(commonMatch[3], 10);
    const isDayFirst = part1 > 12;
    const month = isDayFirst ? part2 : part1;
    const day = isDayFirst ? part1 : part2;
    const date = buildDate(year, month, day);
    if (date) {
      return date;
    }
  }

  if (!/[-/:\s]/.test(value)) {
    return null;
  }
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return null;
};

const getInferredType = (counts, nonNullCount) => {
  if (!nonNullCount) {
    return 'string';
  }
  const ratio = (count) => count / nonNullCount;
  if (ratio(counts.number) >= 0.9) {
    return 'number';
  }
  if (ratio(counts.date) >= 0.9) {
    return 'date';
  }
  if (ratio(counts.bool) >= 0.9) {
    return 'bool';
  }
  return 'string';
};

const buildProfile = (column, rows) => {
  let nullCount = 0;
  const distinct = new Set();
  const samples = [];
  const sampleSet = new Set();
  const counts = {
    number: 0,
    date: 0,
    bool: 0,
  };
  let minNumber = null;
  let maxNumber = null;
  let minDate = null;
  let maxDate = null;

  rows.forEach((row) => {
    const raw = row[column.id];
    const value = normalizeValue(raw);
    if (!value) {
      nullCount += 1;
      return;
    }

    distinct.add(value);
    if (sampleSet.size < MAX_SAMPLE_VALUES && !sampleSet.has(value)) {
      sampleSet.add(value);
      samples.push(value);
    }

    const numeric = parseNumericValue(value);
    if (numeric !== null) {
      counts.number += 1;
      minNumber = minNumber === null ? numeric : Math.min(minNumber, numeric);
      maxNumber = maxNumber === null ? numeric : Math.max(maxNumber, numeric);
    }

    const date = parseDateValue(value);
    if (date) {
      counts.date += 1;
      const time = date.getTime();
      minDate = minDate === null ? time : Math.min(minDate, time);
      maxDate = maxDate === null ? time : Math.max(maxDate, time);
    }

    const bool = parseBooleanValue(value);
    if (bool !== null) {
      counts.bool += 1;
    }
  });

  const nonNullCount = rows.length - nullCount;
  const inferredType = getInferredType(counts, nonNullCount);
  const inferredRole = inferredType === 'number' ? 'metric' : 'dimension';

  const stats = {
    nullRate: rows.length
      ? Math.round((nullCount / rows.length) * 1000) / 10
      : 0,
    distinctCount: distinct.size,
    min:
      inferredType === 'number'
        ? minNumber
        : inferredType === 'date' && minDate !== null
          ? new Date(minDate).toISOString()
          : null,
    max:
      inferredType === 'number'
        ? maxNumber
        : inferredType === 'date' && maxDate !== null
          ? new Date(maxDate).toISOString()
          : null,
  };

  return {
    id: column.id,
    inferredType,
    type: inferredType,
    inferredRole,
    role: inferredRole,
    stats,
    sampleValues: samples,
    coercion: {
      numeric: {
        allowCommas: true,
        allowCurrency: true,
        allowPercent: true,
        allowParens: true,
      },
      date: {
        formats: ['iso', 'ymd', 'mdy', 'dmy'],
      },
    },
  };
};

/**
 * Infers column types and profile stats from a dataset table.
 *
 * @param {DatasetTable} table
 * @returns {SchemaInferenceResult} The inferred schema.
 */
export const inferSchemaForTable = (table) => {
  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) {
    return { columns: [], profiles: [] };
  }
  const profiles = table.columns.map((column) =>
    buildProfile(column, table.rows)
  );
  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile])
  );
  const columns = table.columns.map((column) => ({
    ...column,
    ...profileMap.get(column.id),
  }));
  return { columns, profiles };
};
