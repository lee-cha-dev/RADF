const DEFAULT_MAX_ROWS = 5000;
const DEFAULT_PREVIEW_ROWS = 10;
const LARGE_ROW_WARNING_COUNT = 100000;

/**
 * @typedef {Object} DatasetColumn
 * @property {string} id
 * @property {string} label
 * @property {string} [originalHeader]
 * @property {string} [originalKey]
 */

/**
 * @typedef {Object} DatasetTable
 * @property {DatasetColumn[]} columns
 * @property {Object[]} rows
 * @property {Object[]} preview
 * @property {string[]} warnings
 * @property {number} rowCount
 * @property {number} rawRowCount
 * @property {boolean} truncated
 * @property {boolean} sanitizedHeaders
 * @property {number} [expectedColumnCount]
 * @property {number} [inconsistentRowCount]
 */

/**
 * @typedef {Object} DatasetBinding
 * @property {string} id
 * @property {string} importedAt
 * @property {Object} source
 * @property {DatasetColumn[]} columns
 * @property {Object[]} rows
 * @property {Object[]} previewRows
 * @property {number} rowCount
 * @property {number} rawRowCount
 * @property {boolean} truncated
 * @property {string[]} warnings
 * @property {boolean} sanitizedHeaders
 * @property {Object[]} fieldProfiles
 */

const trimCell = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return String(value);
};

/**
 * Sanitizes a column header into a unique field id.
 *
 * @param {string} value
 * @param {number} index
 * @param {Set<string>} used
 * @returns {{ id: string, original: string, wasSanitized: boolean }}
 */
export const sanitizeFieldId = (value, index, used) => {
  const raw = trimCell(value);
  let cleaned = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  cleaned = cleaned.replace(/^_+|_+$/g, '');
  if (!cleaned) {
    cleaned = `column_${index + 1}`;
  }
  if (/^\d/.test(cleaned)) {
    cleaned = `col_${cleaned}`;
  }
  let unique = cleaned;
  let counter = 2;
  while (used.has(unique)) {
    unique = `${cleaned}_${counter}`;
    counter += 1;
  }
  used.add(unique);
  return { id: unique, original: raw, wasSanitized: raw !== unique };
};

const isRowEmpty = (row) =>
  !row.some((cell) => trimCell(cell) !== '');

const normalizeTable = (rows, options = {}) => {
  const maxRows = options.maxRows ?? DEFAULT_MAX_ROWS;
  const previewRows = options.previewRows ?? DEFAULT_PREVIEW_ROWS;
  if (!rows.length) {
    return {
      columns: [],
      rows: [],
      preview: [],
      warnings: ['No rows found in the dataset.'],
      rowCount: 0,
      rawRowCount: 0,
      truncated: false,
      sanitizedHeaders: false,
      expectedColumnCount: 0,
      inconsistentRowCount: 0,
    };
  }

  const maxColumns = rows.reduce(
    (max, row) => Math.max(max, row.length),
    0
  );
  const headerRow = rows[0] || [];
  const expectedColumnCount = headerRow.length || maxColumns;
  const used = new Set();
  let sanitizedHeaders = false;
  const columns = Array.from({ length: maxColumns }).map((_, index) => {
    const { id, original, wasSanitized } = sanitizeFieldId(
      headerRow[index],
      index,
      used
    );
    if (wasSanitized) {
      sanitizedHeaders = true;
    }
    return {
      id,
      label: original || id,
      originalHeader: original,
    };
  });

  const dataRows = rows.slice(1).filter((row) => !isRowEmpty(row));
  const rawRowCount = dataRows.length;
  const truncated = rawRowCount > maxRows;
  const limitedRows = truncated ? dataRows.slice(0, maxRows) : dataRows;
  const inconsistentRowCount = expectedColumnCount
    ? dataRows.filter((row) => row.length !== expectedColumnCount).length
    : 0;

  const formattedRows = limitedRows.map((row) => {
    const record = {};
    columns.forEach((column, index) => {
      record[column.id] = trimCell(row[index]);
    });
    return record;
  });

  return {
    columns,
    rows: formattedRows,
    preview: formattedRows.slice(0, previewRows),
    warnings: [],
    rowCount: formattedRows.length,
    rawRowCount,
    truncated,
    sanitizedHeaders,
    expectedColumnCount,
    inconsistentRowCount,
  };
};

/**
 * Parses CSV text into a normalized table.
 *
 * @param {string} text
 * @param {{ maxRows?: number, previewRows?: number }} [options]
 * @returns {DatasetTable} The normalized table.
 * @throws {Error} When the CSV is empty or malformed.
 */
export const parseCsvText = (text, options = {}) => {
  if (!text || text.trim().length === 0) {
    throw new Error('The file is empty.');
  }
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        const next = text[i + 1];
        if (next === '"') {
          value += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        value += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(value);
        value = '';
      } else if (char === '\n') {
        row.push(value);
        rows.push(row);
        row = [];
        value = '';
      } else if (char !== '\r') {
        value += char;
      }
    }
    i += 1;
  }

  row.push(value);
  rows.push(row);

  if (inQuotes) {
    throw new Error('Malformed CSV: unterminated quote.');
  }

  return normalizeTable(rows, options);
};

/**
 * Normalizes a 2D matrix of rows into a table.
 *
 * @param {Array<Array<unknown>>} rows
 * @param {{ maxRows?: number, previewRows?: number }} [options]
 * @returns {DatasetTable} The normalized table.
 */
export const parseRowMatrix = (rows, options = {}) =>
  normalizeTable(rows, options);

/**
 * Builds a table from an array of object rows (API payloads).
 *
 * @param {Object[]} [rows]
 * @param {{ maxRows?: number, previewRows?: number }} [options]
 * @returns {DatasetTable} The normalized table.
 */
export const buildTableFromObjectRows = (rows = [], options = {}) => {
  const maxRows = options.maxRows ?? DEFAULT_MAX_ROWS;
  const previewRows = options.previewRows ?? DEFAULT_PREVIEW_ROWS;
  const rawRows = Array.isArray(rows) ? rows : [];
  const objectRows = rawRows.filter(
    (row) => row && typeof row === 'object' && !Array.isArray(row)
  );
  if (objectRows.length === 0) {
    return {
      columns: [],
      rows: [],
      preview: [],
      warnings: ['No rows found in the API response.'],
      rowCount: 0,
      rawRowCount: rawRows.length,
      truncated: false,
      sanitizedHeaders: false,
    };
  }

  const truncated = objectRows.length > maxRows;
  const limitedRows = truncated ? objectRows.slice(0, maxRows) : objectRows;
  const keys = new Set();
  limitedRows.forEach((row) => {
    Object.keys(row).forEach((key) => keys.add(key));
  });

  const used = new Set();
  let sanitizedHeaders = false;
  const columns = Array.from(keys).map((key, index) => {
    const { id, original, wasSanitized } = sanitizeFieldId(
      key,
      index,
      used
    );
    if (wasSanitized) {
      sanitizedHeaders = true;
    }
    return {
      id,
      label: original || id,
      originalKey: key,
    };
  });

  let hasNonPrimitive = false;
  const formattedRows = limitedRows.map((row) => {
    const record = {};
    columns.forEach((column) => {
      const rawValue = row[column.originalKey];
      if (rawValue && typeof rawValue === 'object') {
        hasNonPrimitive = true;
        try {
          record[column.id] = JSON.stringify(rawValue);
        } catch {
          record[column.id] = String(rawValue);
        }
        return;
      }
      record[column.id] =
        typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    });
    return record;
  });

  const warnings = [];
  if (sanitizedHeaders) {
    warnings.push(
      'Some API fields were renamed to keep column names consistent.'
    );
  }
  if (hasNonPrimitive) {
    warnings.push(
      'Some API fields contained nested values and were stringified.'
    );
  }
  if (truncated) {
    warnings.push(
      `Loaded the first ${formattedRows.length} rows to keep editing responsive.`
    );
  }
  if (formattedRows.length > LARGE_ROW_WARNING_COUNT) {
    warnings.push(
      `Large dataset loaded (${formattedRows.length} rows). Editing may feel slower.`
    );
  }

  return {
    columns,
    rows: formattedRows,
    preview: formattedRows.slice(0, previewRows),
    warnings,
    rowCount: formattedRows.length,
    rawRowCount: objectRows.length,
    truncated,
    sanitizedHeaders,
  };
};

/**
 * Formats bytes into a readable size label.
 *
 * @param {number} bytes
 * @returns {string} The formatted size.
 */
export const formatBytes = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

/**
 * Builds a dataset binding from a file import.
 *
 * @param {Object} options
 * @param {string} options.fileName
 * @param {number} options.fileSize
 * @param {string} options.fileType
 * @param {string} [options.sheetName]
 * @param {string[]} [options.sheetNames]
 * @param {DatasetTable} options.table
 * @param {Object[]} [options.fieldProfiles]
 * @returns {DatasetBinding} The dataset binding.
 */
export const buildDatasetBinding = ({
  fileName,
  fileSize,
  fileType,
  sheetName,
  sheetNames,
  table,
  fieldProfiles,
}) => ({
  id: `dataset_${Date.now().toString(36)}`,
  importedAt: new Date().toISOString(),
  source: {
    type: 'file',
    fileName,
    fileSize,
    fileType,
    sheetName: sheetName || null,
    sheetNames: sheetNames || [],
  },
  columns: table.columns,
  rows: table.rows,
  previewRows: table.preview,
  rowCount: table.rowCount,
  rawRowCount: table.rawRowCount,
  truncated: table.truncated,
  warnings: table.warnings,
  sanitizedHeaders: table.sanitizedHeaders,
  fieldProfiles: fieldProfiles || [],
});

/**
 * Builds a dataset binding from an API import.
 *
 * @param {Object} [options]
 * @param {{ baseUrl?: string, method?: string, headers?: Object[], queryParams?: Object[], responsePath?: string, refreshInterval?: number|null }} [options.apiConfig]
 * @param {DatasetTable} [options.table]
 * @param {Object[]} [options.fieldProfiles]
 * @returns {DatasetBinding} The dataset binding.
 */
export const buildApiDatasetBinding = ({
  apiConfig,
  table,
  fieldProfiles,
} = {}) => ({
  id: `dataset_${Date.now().toString(36)}`,
  importedAt: new Date().toISOString(),
  source: {
    type: 'api',
    baseUrl: apiConfig?.baseUrl || '',
    method: apiConfig?.method || 'GET',
    headers: apiConfig?.headers || [],
    queryParams: apiConfig?.queryParams || [],
    responsePath: apiConfig?.responsePath || '',
    refreshInterval: apiConfig?.refreshInterval || null,
  },
  columns: table?.columns || [],
  rows: table?.rows || [],
  previewRows: table?.preview || [],
  rowCount: table?.rowCount || 0,
  rawRowCount: table?.rawRowCount || 0,
  truncated: table?.truncated || false,
  warnings: table?.warnings || [],
  sanitizedHeaders: table?.sanitizedHeaders || false,
  fieldProfiles: fieldProfiles || [],
});

/**
 * Collects display warnings for a dataset table.
 *
 * @param {DatasetTable} table
 * @returns {string[]} Warning messages.
 */
export const collectDatasetWarnings = (table) => {
  const warnings = [];
  if (table.sanitizedHeaders) {
    warnings.push(
      'Some headers were empty or duplicated, so they were normalized.'
    );
  }
  if (table.truncated) {
    warnings.push(
      `Loaded the first ${table.rowCount} rows to keep editing responsive.`
    );
  }
  if (table.rowCount > LARGE_ROW_WARNING_COUNT) {
    warnings.push(
      `Large dataset loaded (${table.rowCount} rows). Editing may feel slower.`
    );
  }
  if (table.rowCount === 0) {
    warnings.push('No data rows were found after the header row.');
  }
  return warnings;
};
