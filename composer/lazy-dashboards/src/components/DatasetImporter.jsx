import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  buildApiDatasetBinding,
  buildDatasetBinding,
  collectDatasetWarnings,
  formatBytes,
  parseCsvText,
  parseRowMatrix,
  sanitizeFieldId,
} from '../data/datasetImport.js';
import { inferSchemaForTable } from '../data/schemaInference.js';
import { trackTelemetryEvent } from '../data/telemetry.js';

/**
 * @typedef {Object} DatasetImportColumn
 * @property {string} id
 * @property {string} [label]
 * @property {string} [type]
 * @property {string} [role]
 * @property {string} [inferredRole]
 * @property {string} [inferredType]
 * @property {Object} [stats]
 * @property {number} [stats.nullRate]
 * @property {number} [stats.distinctCount]
 * @property {string|number|null} [stats.min]
 * @property {string|number|null} [stats.max]
 * @property {string[]} [sampleValues]
 */

/**
 * @typedef {Object} DatasetBinding
 * @property {{ type: 'file'|'api', fileName?: string, fileSize?: number, sheetName?: string, sheetNames?: string[], baseUrl?: string }} source
 * @property {DatasetImportColumn[]} [columns]
 * @property {Object[]} [rows]
 * @property {Object[]} [previewRows]
 * @property {Object[]} [warnings]
 * @property {number} [rowCount]
 * @property {number} [rawRowCount]
 * @property {boolean} [truncated]
 * @property {boolean} [sanitizedHeaders]
 * @property {Object[]} [fieldProfiles]
 */

/**
 * @typedef {Object} DatasetImporterProps
 * @property {DatasetBinding|null} [datasetBinding]
 * @property {(nextBinding: DatasetBinding) => void} [onUpdate]
 */

// The user really only needs about 100 rows to preview the data within the dashboard builder
const MAX_FILE_BYTES = 150 * 1024 * 1024; // max 150mb file
const WARN_FILE_BYTES = 50 * 1024 * 1024; // warn at 50mb file
const DEFAULT_PREVIEW_ROWS = 10;  // preview rows
const DEFAULT_MAX_ROWS = 500000;  // max rows
const DEFAULT_API_CONFIG = {
  baseUrl: '',
  method: 'GET',
  headers: [{ key: '', value: '' }],
  queryParams: [{ key: '', value: '' }],
  responsePath: '',
  refreshInterval: '',
};

/**
 * @param {File} file
 * @returns {'csv'|'xlsx'|''}
 */
const getFileType = (file) => {
  const name = file?.name?.toLowerCase() || '';
  if (name.endsWith('.csv')) {
    return 'csv';
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return 'xlsx';
  }
  return '';
};

/**
 * @param {Object|null|undefined} source
 * @returns {Object}
 */
const normalizeApiConfig = (source) => {
  if (!source) {
    return DEFAULT_API_CONFIG;
  }
  return {
    baseUrl: source.baseUrl || '',
    method: source.method || 'GET',
    headers:
      source.headers && source.headers.length > 0
        ? source.headers
        : DEFAULT_API_CONFIG.headers,
    queryParams:
      source.queryParams && source.queryParams.length > 0
        ? source.queryParams
        : DEFAULT_API_CONFIG.queryParams,
    responsePath: source.responsePath || '',
    refreshInterval:
      source.refreshInterval === null || source.refreshInterval === undefined
        ? ''
        : String(source.refreshInterval),
  };
};

/**
 * @param {Object} config
 * @returns {Object}
 */
const normalizeApiConfigForSave = (config) => {
  const refresh =
    config.refreshInterval === '' ? null : Number(config.refreshInterval);
  return {
    baseUrl: config.baseUrl.trim(),
    method: 'GET',
    headers: (config.headers || []).filter((pair) => pair?.key),
    queryParams: (config.queryParams || []).filter((pair) => pair?.key),
    responsePath: config.responsePath.trim(),
    refreshInterval:
      Number.isFinite(refresh) && refresh > 0 ? refresh : null,
  };
};

const buildEmptyApiTable = () => ({
  columns: [],
  rows: [],
  preview: [],
  warnings: [],
  rowCount: 0,
  rawRowCount: 0,
  truncated: false,
  sanitizedHeaders: false,
});

/**
 * Imports a dataset from file or API sample and emits normalized bindings.
 *
 * @param {DatasetImporterProps} props
 * @returns {JSX.Element}
 */
const DatasetImporter = ({ datasetBinding, onUpdate }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [isFieldEditorOpen, setIsFieldEditorOpen] = useState(false);
  const [fieldSearch, setFieldSearch] = useState('');
  const [fieldRoleFilter, setFieldRoleFilter] = useState('all');
  const [datasetMode, setDatasetMode] = useState(
    datasetBinding?.source?.type === 'api' ? 'api' : 'file'
  );
  const [apiConfig, setApiConfig] = useState(() =>
    normalizeApiConfig(datasetBinding?.source)
  );
  const [warnings, setWarnings] = useState(
    datasetBinding?.warnings || []
  );
  const [pendingWorkbook, setPendingWorkbook] = useState(null);
  const reportImportError = useCallback((message, details = {}) => {
    trackTelemetryEvent('dataset_import_error', { message, ...details });
  }, []);

  const datasetSummary = useMemo(() => {
    if (!datasetBinding) {
      return null;
    }
    const isApi = datasetBinding.source?.type === 'api';
    return {
      name: isApi
        ? 'External API'
        : datasetBinding.source?.fileName || 'Dataset',
      size: isApi ? 0 : datasetBinding.source?.fileSize || 0,
      rows: datasetBinding.rowCount || 0,
      columns: datasetBinding.columns?.length || 0,
      sheetName: isApi ? null : datasetBinding.source?.sheetName,
      sheetNames: isApi ? [] : datasetBinding.source?.sheetNames || [],
      truncated: datasetBinding.truncated,
      sourceType: isApi ? 'api' : 'file',
      endpoint: isApi ? datasetBinding.source?.baseUrl : null,
    };
  }, [datasetBinding]);
  const datasetColumns = useMemo(
    () => datasetBinding?.columns || [],
    [datasetBinding?.columns]
  );
  const previewRows = datasetBinding?.previewRows || [];
  const fieldRoleCounts = useMemo(() => {
    const counts = { metric: 0, dimension: 0, unknown: 0 };
    datasetColumns.forEach((column) => {
      const role = column.role || column.inferredRole;
      if (role === 'metric') {
        counts.metric += 1;
      } else if (role === 'dimension') {
        counts.dimension += 1;
      } else {
        counts.unknown += 1;
      }
    });
    return counts;
  }, [datasetColumns]);
  const filteredColumns = useMemo(() => {
    const normalizedSearch = fieldSearch.trim().toLowerCase();
    return datasetColumns.filter((column) => {
      const role = column.role || column.inferredRole || 'unassigned';
      if (fieldRoleFilter !== 'all' && role !== fieldRoleFilter) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      const label = (column.label || '').toLowerCase();
      const id = (column.id || '').toLowerCase();
      return label.includes(normalizedSearch) || id.includes(normalizedSearch);
    });
  }, [datasetColumns, fieldRoleFilter, fieldSearch]);

  useEffect(() => {
    const nextMode =
      datasetBinding?.source?.type === 'api' ? 'api' : 'file';
    setDatasetMode(nextMode);
    if (nextMode === 'api') {
      setApiConfig(normalizeApiConfig(datasetBinding?.source));
    }
  }, [datasetBinding]);

  useEffect(() => {
    setError('');
  }, [datasetMode]);

  const applyDataset = useCallback(
    (dataset) => {
      onUpdate?.(dataset);
      setWarnings(dataset?.warnings || []);
    },
    [onUpdate]
  );

  const buildFieldProfiles = useCallback(
    (columns) =>
      columns.map(
        ({
          id,
          label,
          inferredType,
          type,
          inferredRole,
          role,
          stats,
          sampleValues,
          coercion,
        }) => ({
          id,
          label,
          inferredType,
          type,
          inferredRole,
          role,
          stats,
          sampleValues,
          coercion,
        })
      ),
    []
  );

  const applyInference = useCallback(
    (table) => {
      const inferred = inferSchemaForTable(table);
      return {
        columns: inferred.columns,
        fieldProfiles: buildFieldProfiles(inferred.columns),
      };
    },
    [buildFieldProfiles]
  );

  const applyTableAsDataset = useCallback(
    (table, fileMeta = {}) => {
      const inference = applyInference(table);
      const tableWithColumns = {
        ...table,
        columns: inference.columns,
      };
      if (datasetMode === 'api') {
        const normalized = normalizeApiConfigForSave(apiConfig);
        const dataset = buildApiDatasetBinding({
          apiConfig: normalized,
          table: tableWithColumns,
          fieldProfiles: inference.fieldProfiles,
        });
        applyDataset(dataset);
        return;
      }
      const dataset = buildDatasetBinding({
        fileName: fileMeta.fileName,
        fileSize: fileMeta.fileSize,
        fileType: fileMeta.fileType,
        sheetName: fileMeta.sheetName,
        sheetNames: fileMeta.sheetNames,
        table: tableWithColumns,
        fieldProfiles: inference.fieldProfiles,
      });
      applyDataset(dataset);
    },
    [
      applyDataset,
      applyInference,
      apiConfig,
      datasetMode,
    ]
  );

  const parseCsvFile = useCallback(
    async (file, extraWarnings = []) => {
      const text = await file.text();
      const table = parseCsvText(text, {
        maxRows: DEFAULT_MAX_ROWS,
        previewRows: DEFAULT_PREVIEW_ROWS,
      });
      if (table.inconsistentRowCount > 0) {
        throw new Error(
          `Inconsistent rows detected. Expected ${table.expectedColumnCount} columns, but ${table.inconsistentRowCount} rows differ.`
        );
      }
      table.warnings = [...extraWarnings, ...collectDatasetWarnings(table)];
      setPendingWorkbook(null);
      applyTableAsDataset(table, {
        fileName: file.name,
        fileSize: file.size,
        fileType: 'csv',
      });
    },
    [applyTableAsDataset]
  );

  const parseWorkbook = useCallback(
    (arrayBuffer, sheetName) => {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const targetSheetName = sheetName || workbook.SheetNames?.[0];
      if (!targetSheetName) {
        return { error: 'No sheets were found in this workbook.' };
      }
      const sheet = workbook.Sheets[targetSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        blankrows: false,
      });
      if (!rows || rows.length === 0) {
        return { error: 'The selected sheet is empty.' };
      }
      const table = parseRowMatrix(rows, {
        maxRows: DEFAULT_MAX_ROWS,
        previewRows: DEFAULT_PREVIEW_ROWS,
      });
      if (table.inconsistentRowCount > 0) {
        return {
          error: `Inconsistent rows detected. Expected ${table.expectedColumnCount} columns, but ${table.inconsistentRowCount} rows differ.`,
        };
      }
      return {
        table: { ...table, warnings: collectDatasetWarnings(table) },
        sheetNames: workbook.SheetNames || [],
        sheetName: targetSheetName,
      };
    },
    []
  );

  const parseXlsxFile = useCallback(
    async (file, extraWarnings = []) => {
      const arrayBuffer = await file.arrayBuffer();
      const parsed = parseWorkbook(arrayBuffer);
      if (parsed.error) {
        setError(parsed.error);
        reportImportError(parsed.error, {
          source: 'xlsx',
          fileName: file.name,
          fileSize: file.size,
        });
        return;
      }
      parsed.table.warnings = [
        ...extraWarnings,
        ...(parsed.table.warnings || []),
      ];
      setPendingWorkbook({
        arrayBuffer,
        fileName: file.name,
        fileSize: file.size,
        sheetNames: parsed.sheetNames,
        sheetName: parsed.sheetName,
      });
      applyTableAsDataset(parsed.table, {
        fileName: file.name,
        fileSize: file.size,
        fileType: 'xlsx',
        sheetName: parsed.sheetName,
        sheetNames: parsed.sheetNames,
      });
    },
    [applyTableAsDataset, parseWorkbook, reportImportError]
  );

  const handleFile = useCallback(
    async (file) => {
      if (!file) {
        return;
      }
      setError('');
      setWarnings([]);
      const sizeWarnings = [];
      if (file.size > MAX_FILE_BYTES) {
        const message = `This file is ${formatBytes(
          file.size
        )}. Please import a file smaller than ${formatBytes(
          MAX_FILE_BYTES
        )}.`;
        setError(message);
        reportImportError(message, {
          source: getFileType(file) || 'unknown',
          fileName: file.name,
          fileSize: file.size,
        });
        return;
      }
      if (file.size > WARN_FILE_BYTES) {
        sizeWarnings.push(
          'Large file detected. Import may take a moment and will sample rows if needed.',
        );
      }
      const fileType = getFileType(file);
      try {
        setIsParsing(true);
        if (fileType === 'csv') {
          await parseCsvFile(file, sizeWarnings);
        } else if (fileType === 'xlsx') {
          await parseXlsxFile(file, sizeWarnings);
        } else {
          setError('Unsupported file type. Please use CSV or XLSX.');
          reportImportError('Unsupported file type.', {
            source: 'unknown',
            fileName: file.name,
            fileSize: file.size,
          });
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to parse this file. Please check the format.';
        setError(message);
        reportImportError(message, {
          source: fileType || 'unknown',
          fileName: file.name,
          fileSize: file.size,
        });
      } finally {
        setIsParsing(false);
      }
    },
    [parseCsvFile, parseXlsxFile, reportImportError]
  );

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      event.target.value = null;
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePickFile = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleSheetChange = useCallback(
    (event) => {
      const nextSheet = event.target.value;
      if (!pendingWorkbook || !nextSheet) {
        return;
      }
      const parsed = parseWorkbook(
        pendingWorkbook.arrayBuffer,
        nextSheet
      );
      if (parsed.error) {
        setError(parsed.error);
        reportImportError(parsed.error, {
          source: 'xlsx',
          sheetName: nextSheet,
        });
        return;
      }
      setPendingWorkbook((current) =>
        current
          ? {
              ...current,
              sheetName: parsed.sheetName,
            }
          : current
      );
      applyTableAsDataset(parsed.table, {
        fileName: pendingWorkbook.fileName,
        fileSize: pendingWorkbook.fileSize,
        fileType: 'xlsx',
        sheetName: parsed.sheetName,
        sheetNames: pendingWorkbook.sheetNames,
      });
    },
    [applyTableAsDataset, parseWorkbook, pendingWorkbook, reportImportError]
  );

  const updateApiConfigField = useCallback((field, value) => {
    setApiConfig((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const updateApiConfigPair = useCallback((listKey, index, field, value) => {
    setApiConfig((current) => {
      const nextList = [...(current[listKey] || [])];
      nextList[index] = {
        ...nextList[index],
        [field]: value,
      };
      return {
        ...current,
        [listKey]: nextList,
      };
    });
  }, []);

  const addApiConfigPair = useCallback((listKey) => {
    setApiConfig((current) => ({
      ...current,
      [listKey]: [...(current[listKey] || []), { key: '', value: '' }],
    }));
  }, []);

  const removeApiConfigPair = useCallback((listKey, index) => {
    setApiConfig((current) => ({
      ...current,
      [listKey]: (current[listKey] || []).filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
  }, []);

  const handleApiSave = useCallback(() => {
    const normalized = normalizeApiConfigForSave(apiConfig);
    const table =
      datasetBinding?.columns?.length || datasetBinding?.rows?.length
        ? {
            columns: datasetBinding.columns || [],
            rows: datasetBinding.rows || [],
            preview: datasetBinding.previewRows || [],
            warnings: datasetBinding.warnings || [],
            rowCount: datasetBinding.rowCount || 0,
            rawRowCount: datasetBinding.rawRowCount || 0,
            truncated: datasetBinding.truncated || false,
            sanitizedHeaders: datasetBinding.sanitizedHeaders || false,
          }
        : buildEmptyApiTable();
    const dataset = buildApiDatasetBinding({
      apiConfig: normalized,
      table,
      fieldProfiles: datasetBinding?.fieldProfiles || [],
    });
    applyDataset(dataset);
  }, [apiConfig, applyDataset, datasetBinding]);

  useEffect(() => {
    if (!datasetBinding?.columns?.length) {
      return;
    }
    const needsInference = datasetBinding.columns.some(
      (column) => !column.type || !column.stats
    );
    if (!needsInference) {
      return;
    }
    const inference = applyInference({
      columns: datasetBinding.columns,
      rows: datasetBinding.rows || [],
    });
    applyDataset({
      ...datasetBinding,
      columns: inference.columns,
      fieldProfiles: inference.fieldProfiles,
    });
  }, [datasetBinding, applyDataset, applyInference]);

  const updateDataset = useCallback(
    (updater) => {
      if (!datasetBinding) {
        return;
      }
      const next = updater(datasetBinding);
      if (next) {
        applyDataset(next);
      }
    },
    [datasetBinding, applyDataset]
  );

  const handleFieldRename = useCallback(
    (fieldId, nextLabel) => {
      updateDataset((current) => {
        let resolvedId = fieldId;
        const nextColumns = current.columns.map((column, index) => {
          if (column.id !== fieldId) {
            return column;
          }
          const used = new Set(
            current.columns
              .filter((col) => col.id !== fieldId)
              .map((col) => col.id)
          );
          const labelValue = nextLabel.trim();
          const { id: nextId } = sanitizeFieldId(
            labelValue || column.label || column.id,
            index,
            used
          );
          resolvedId = nextId;
          return {
            ...column,
            id: nextId,
            label: labelValue || column.label || nextId,
          };
        });
        if (resolvedId === fieldId) {
          return {
            ...current,
            columns: nextColumns,
            fieldProfiles: buildFieldProfiles(nextColumns),
          };
        }

        const nextRows = (current.rows || []).map((row) => {
          if (!Object.prototype.hasOwnProperty.call(row, fieldId)) {
            return row;
          }
          const nextRow = { ...row };
          nextRow[resolvedId] = row[fieldId];
          delete nextRow[fieldId];
          return nextRow;
        });
        const previewCount = current.previewRows?.length || 0;
        return {
          ...current,
          columns: nextColumns,
          rows: nextRows,
          previewRows: nextRows.slice(0, previewCount),
          fieldProfiles: buildFieldProfiles(nextColumns),
        };
      });
    },
    [updateDataset, buildFieldProfiles]
  );

  const handleFieldTypeChange = useCallback(
    (fieldId, nextType) => {
      updateDataset((current) => {
        const nextColumns = current.columns.map((column) =>
          column.id === fieldId ? { ...column, type: nextType } : column
        );
        return {
          ...current,
          columns: nextColumns,
          fieldProfiles: buildFieldProfiles(nextColumns),
        };
      });
    },
    [updateDataset, buildFieldProfiles]
  );

  const handleFieldRoleChange = useCallback(
    (fieldId, nextRole) => {
      updateDataset((current) => {
        const nextColumns = current.columns.map((column) =>
          column.id === fieldId ? { ...column, role: nextRole } : column
        );
        return {
          ...current,
          columns: nextColumns,
          fieldProfiles: buildFieldProfiles(nextColumns),
        };
      });
    },
    [updateDataset, buildFieldProfiles]
  );

  const formatStatValue = useCallback((value, type) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (type === 'date') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
    if (typeof value === 'number') {
      return value.toLocaleString('en-US');
    }
    return String(value);
  }, []);

  return (
    <div className="lazy-dataset">
      <div className="lazy-source-toggle">
        <p className="lazy-dataset__label">Data source</p>
        <div className="lazy-toggle">
          <button
            className={`lazy-toggle__button${
              datasetMode === 'file' ? ' active' : ''
            }`}
            type="button"
            onClick={() => setDatasetMode('file')}
          >
            File upload
          </button>
          <button
            className={`lazy-toggle__button${
              datasetMode === 'api' ? ' active' : ''
            }`}
            type="button"
            onClick={() => setDatasetMode('api')}
          >
            External API
          </button>
        </div>
      </div>

      {datasetMode === 'file' ? (
        <>
          <div
            className={`lazy-dropzone ${
              isDragging ? 'is-active' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onClick={handlePickFile}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handlePickFile();
              }
            }}
          >
            <input
              ref={inputRef}
              className="lazy-dropzone__input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
            <div className="lazy-dropzone__content">
              <p className="lazy-dropzone__title">
                Drop a CSV or XLSX here
              </p>
              <p className="lazy-dropzone__subtitle">
                Or click to browse from your computer.
              </p>
              <button className="lazy-button ghost" type="button">
                Choose File
              </button>
            </div>
          </div>

          {isParsing && (
            <div className="lazy-alert">
              Parsing dataset, please wait…
            </div>
          )}
          {error && (
            <div className="lazy-alert danger">{error}</div>
          )}
        </>
      ) : (
        <div className="lazy-api">
          <div className="lazy-api__intro">
            <p className="lazy-panel__body">
              Upload a sample file to shape fields and preview the dashboard.
              The composer does not call your API. The Base URL and options
              below are saved into the exported DataProvider so your environment
              can fetch real data later.
            </p>
            <div className="lazy-alert warning">
              <strong>Export note.</strong>
              <span>
                The exported dashboard runs in the browser, so CORS and secrets
                still apply when it calls your API.
              </span>
            </div>
          </div>
          <div className="lazy-api__sample">
            <div
              className={`lazy-dropzone ${
                isDragging ? 'is-active' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onClick={handlePickFile}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  handlePickFile();
                }
              }}
            >
              <input
                ref={inputRef}
                className="lazy-dropzone__input"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              <div className="lazy-dropzone__content">
                <p className="lazy-dropzone__title">
                  Upload a sample CSV or XLSX
                </p>
                <p className="lazy-dropzone__subtitle">
                  This sample powers the editor preview only.
                </p>
                <button className="lazy-button ghost" type="button">
                  Choose Sample File
                </button>
              </div>
            </div>

            {isParsing && (
              <div className="lazy-alert">
                Parsing dataset, please wait…
              </div>
            )}
            {error && (
              <div className="lazy-alert danger">{error}</div>
            )}
          </div>
          <div className="lazy-api__form">
            <label className="lazy-input">
              <span className="lazy-input__label">Base URL</span>
              <input
                className="lazy-input__field"
                type="text"
                value={apiConfig.baseUrl}
                onChange={(event) =>
                  updateApiConfigField('baseUrl', event.target.value)
                }
                placeholder="https://api.example.com/v1/data"
              />
            </label>
            <label className="lazy-input">
              <span className="lazy-input__label">Method</span>
              <select className="lazy-input__field" value="GET" disabled>
                <option value="GET">GET</option>
              </select>
            </label>
            <label className="lazy-input">
              <span className="lazy-input__label">Response path</span>
              <input
                className="lazy-input__field"
                type="text"
                value={apiConfig.responsePath}
                onChange={(event) =>
                  updateApiConfigField('responsePath', event.target.value)
                }
                placeholder="data.items"
              />
            </label>
            <label className="lazy-input">
              <span className="lazy-input__label">
                Refresh interval (seconds)
              </span>
              <input
                className="lazy-input__field"
                type="number"
                min="0"
                value={apiConfig.refreshInterval}
                onChange={(event) =>
                  updateApiConfigField('refreshInterval', event.target.value)
                }
                placeholder="60"
              />
            </label>
          </div>

          <div className="lazy-api__list">
            <div className="lazy-api__list-header">
              <p className="lazy-dataset__label">Query params</p>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => addApiConfigPair('queryParams')}
              >
                Add param
              </button>
            </div>
            {(apiConfig.queryParams || []).map((param, index) => (
              <div key={`param-${index}`} className="lazy-api__row">
                <input
                  className="lazy-input__field"
                  type="text"
                  value={param.key}
                  onChange={(event) =>
                    updateApiConfigPair(
                      'queryParams',
                      index,
                      'key',
                      event.target.value
                    )
                  }
                  placeholder="param"
                />
                <input
                  className="lazy-input__field"
                  type="text"
                  value={param.value}
                  onChange={(event) =>
                    updateApiConfigPair(
                      'queryParams',
                      index,
                      'value',
                      event.target.value
                    )
                  }
                  placeholder="value"
                />
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={() => removeApiConfigPair('queryParams', index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="lazy-api__list">
            <div className="lazy-api__list-header">
              <p className="lazy-dataset__label">Headers</p>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => addApiConfigPair('headers')}
              >
                Add header
              </button>
            </div>
            {(apiConfig.headers || []).map((header, index) => (
              <div key={`header-${index}`} className="lazy-api__row">
                <input
                  className="lazy-input__field"
                  type="text"
                  value={header.key}
                  onChange={(event) =>
                    updateApiConfigPair(
                      'headers',
                      index,
                      'key',
                      event.target.value
                    )
                  }
                  placeholder="Header-Name"
                />
                <input
                  className="lazy-input__field"
                  type="text"
                  value={header.value}
                  onChange={(event) =>
                    updateApiConfigPair(
                      'headers',
                      index,
                      'value',
                      event.target.value
                    )
                  }
                  placeholder="value"
                />
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={() => removeApiConfigPair('headers', index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="lazy-api__actions">
            <button
              className="lazy-button ghost"
              type="button"
              onClick={handleApiSave}
            >
              Save API settings
            </button>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="lazy-alert warning">
          {warnings.map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      )}

      {datasetSummary && (
        <div className="lazy-dataset__details">
          <div className="lazy-dataset__meta">
            <div>
              <p className="lazy-dataset__label">Current dataset</p>
              <p className="lazy-dataset__name">
                {datasetSummary.name}
              </p>
              <p className="lazy-dataset__info">
                {datasetSummary.columns} columns{' · '}
                {datasetSummary.rows} rows{' · '}
                {datasetSummary.sourceType === 'file'
                  ? formatBytes(datasetSummary.size)
                  : 'External API'}
                {datasetSummary.endpoint
                  ? ` · Endpoint: ${datasetSummary.endpoint}`
                  : ''}
                {datasetSummary.sheetName
                  ? ` · Sheet: ${datasetSummary.sheetName}`
                  : ''}
              </p>
            </div>
            {datasetSummary.sourceType === 'file' ? (
              <button
                className="lazy-button ghost"
                type="button"
                onClick={handlePickFile}
              >
                Replace Dataset
              </button>
            ) : null}
          </div>

          {pendingWorkbook?.sheetNames?.length > 1 ? (
            <label className="lazy-input">
              <span className="lazy-input__label">Sheet</span>
              <select
                className="lazy-input__field"
                value={pendingWorkbook.sheetName || ''}
                onChange={handleSheetChange}
              >
                {pendingWorkbook.sheetNames.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="lazy-dataset__preview">
            <p className="lazy-dataset__label">Preview</p>
            <div className="lazy-table">
              <div className="lazy-table__row lazy-table__head">
                {datasetColumns.map((column) => (
                  <span key={column.id} className="lazy-table__cell">
                    {column.label || column.id}
                  </span>
                ))}
              </div>
              {previewRows.map((row, index) => (
                <div
                  key={`row-${index}`}
                  className="lazy-table__row"
                >
                  {datasetColumns.map((column) => (
                    <span
                      key={`${index}-${column.id}`}
                      className="lazy-table__cell"
                    >
                      {row[column.id]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
            {datasetSummary.truncated && (
              <p className="lazy-dataset__note">
                Showing sample rows. The dataset was truncated for performance.
              </p>
            )}
          </div>

          {datasetColumns.length > 0 && (
            <div className="lazy-fields lazy-fields--summary">
              <div className="lazy-fields__header">
                <div>
                  <p className="lazy-dataset__label">Fields</p>
                  <p className="lazy-fields__hint">
                    Edit labels, types, and roles in the field editor.
                  </p>
                </div>
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={() => setIsFieldEditorOpen(true)}
                >
                  Edit fields
                </button>
              </div>
              <div className="lazy-fields__summary">
                <span className="lazy-pill">
                  Total: {datasetColumns.length}
                </span>
                <span className="lazy-pill">
                  Metrics: {fieldRoleCounts.metric}
                </span>
                <span className="lazy-pill">
                  Dimensions: {fieldRoleCounts.dimension}
                </span>
                {fieldRoleCounts.unknown ? (
                  <span className="lazy-pill">
                    Unassigned: {fieldRoleCounts.unknown}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
      {isFieldEditorOpen ? (
        <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
          <div className="lazy-modal">
            <div className="lazy-modal__header">
              <div>
                <p className="lazy-modal__eyebrow">Dataset fields</p>
                <h2 className="lazy-modal__title">Edit field metadata</h2>
              </div>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => setIsFieldEditorOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="lazy-modal__body lazy-modal__body-expanded">
              <div className="lazy-field-modal__controls">
                <label className="lazy-input">
                  <span className="lazy-input__label">Search</span>
                  <input
                    className="lazy-input__field"
                    type="text"
                    value={fieldSearch}
                    onChange={(event) => setFieldSearch(event.target.value)}
                    placeholder="Filter by name or id"
                  />
                </label>
                <label className="lazy-input">
                  <span className="lazy-input__label">Role</span>
                  <select
                    className="lazy-input__field"
                    value={fieldRoleFilter}
                    onChange={(event) =>
                      setFieldRoleFilter(event.target.value)
                    }
                  >
                    <option value="all">All</option>
                    <option value="dimension">Dimensions</option>
                    <option value="metric">Metrics</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </label>
              </div>
              <div className="lazy-field-modal__list">
                {filteredColumns.length === 0 ? (
                  <p className="lazy-panel__body">No matching fields.</p>
                ) : (
                  filteredColumns.map((column) => (
                    <div key={column.id} className="lazy-field-row">
                      <div className="lazy-field-row__main">
                        <label className="lazy-input">
                          <span className="lazy-input__label">
                            Field name
                          </span>
                          <input
                            className="lazy-input__field"
                            type="text"
                            value={column.label || column.id}
                            onChange={(event) =>
                              handleFieldRename(
                                column.id,
                                event.target.value
                              )
                            }
                          />
                        </label>
                        <div className="lazy-field-row__meta">
                          <span>Id: {column.id}</span>
                          <span>
                            Nulls: {column.stats?.nullRate ?? 0}%
                          </span>
                          <span>
                            Distinct: {column.stats?.distinctCount ?? 0}
                          </span>
                          <span>
                            Min:{' '}
                            {formatStatValue(
                              column.stats?.min,
                              column.type
                            )}
                          </span>
                          <span>
                            Max:{' '}
                            {formatStatValue(
                              column.stats?.max,
                              column.type
                            )}
                          </span>
                        </div>
                        {column.sampleValues?.length > 0 ? (
                          <p className="lazy-field-row__samples">
                            Samples: {column.sampleValues.join(', ')}
                          </p>
                        ) : null}
                        {(column.inferredType || column.inferredRole) && (
                          <p className="lazy-field-row__hint">
                            Inferred as {column.inferredType || 'string'} /{' '}
                            {column.inferredRole || 'dimension'}.
                          </p>
                        )}
                      </div>
                      <label className="lazy-input">
                        <span className="lazy-input__label">Field type</span>
                        <select
                          className="lazy-input__field"
                          value={column.type || 'string'}
                          onChange={(event) =>
                            handleFieldTypeChange(
                              column.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="string">String</option>
                          <option value="bool">Boolean</option>
                        </select>
                      </label>
                      <label className="lazy-input">
                        <span className="lazy-input__label">Field role</span>
                        <select
                          className="lazy-input__field"
                          value={column.role || column.inferredRole || 'dimension'}
                          onChange={(event) =>
                            handleFieldRoleChange(
                              column.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="metric">Metric</option>
                          <option value="dimension">Dimension</option>
                        </select>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="lazy-modal__footer">
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => setIsFieldEditorOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DatasetImporter;
