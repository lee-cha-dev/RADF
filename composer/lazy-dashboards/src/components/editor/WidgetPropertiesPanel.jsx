import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { updateWidgetInModel } from '../../authoring/authoringModel.js';
import { resolveEditorControl } from '../../authoring/editorFieldCatalog.js';
import {
  flattenOptionPaths,
  getNestedValue,
  isPlainObject,
  mergeDeep,
  setNestedValue,
} from '../../authoring/optionUtils.js';
import {
  getVizEncodingDefaults,
  getVizManifest,
  getVizOptionDefaults,
} from '../../authoring/vizManifest.js';
import { trackTelemetryEvent } from '../../data/telemetry.js';

const getOptionPath = (schema, optionKey) => schema?.path || optionKey;

const getOptionValue = (schema, optionKey, options) =>
  getNestedValue(options, getOptionPath(schema, optionKey));

const buildOptionPatch = (schema, optionKey, value) =>
  setNestedValue({}, getOptionPath(schema, optionKey), value);

const resolveSelectOptions = (schema, options) => {
  if (!schema?.optionsByOption) {
    return schema?.options || [];
  }
  const { option, map, fallback } = schema.optionsByOption;
  if (!option || !map) {
    return schema?.options || [];
  }
  const selected = getNestedValue(options, option);
  const mapped = map?.[selected];
  if (Array.isArray(mapped) && mapped.length > 0) {
    return mapped;
  }
  if (Array.isArray(fallback) && fallback.length > 0) {
    return fallback;
  }
  return schema?.options || [];
};

const resolveSelectValue = (schema, optionValue, options) => {
  const selectOptions = resolveSelectOptions(schema, options);
  if (selectOptions.includes(optionValue)) {
    return optionValue;
  }
  if (selectOptions.includes(schema?.default)) {
    return schema.default;
  }
  return selectOptions[0] ?? '';
};

const DEFAULT_CURRENCY_COMPACT_THRESHOLD = 1000000;

const KPI_SUBVARIANT_FORMAT_PRESETS = {
  standard: { format: 'number', decimals: 0, compact: null, compactThreshold: null },
  currency: {
    format: 'currency',
    decimals: 0,
    compact: 'auto',
    compactThreshold: DEFAULT_CURRENCY_COMPACT_THRESHOLD,
  },
  amount: {
    format: 'currency',
    decimals: 0,
    compact: null,
    compactThreshold: null,
  },
  'large-value': { format: 'compact', decimals: 1 },
  integer: { format: 'number', decimals: 0 },
  count: { format: 'number', decimals: 0 },
  percentage: { format: 'percent', decimals: 1 },
  'decimal-percentage': { format: 'percent', decimals: 2 },
  decimal: { format: 'number', decimals: 2 },
  ratio: { format: 'ratio' },
  time: { format: 'hours', decimals: 1 },
  duration: { format: 'duration', decimals: 0 },
  index: { format: 'number', decimals: 0 },
  rating: { format: 'number', decimals: 1 },
};

const normalizeSubvariantKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

const buildKpiSubtypePatch = (value) => {
  const preset = KPI_SUBVARIANT_FORMAT_PRESETS[normalizeSubvariantKey(value)];
  if (!preset) {
    return null;
  }
  const patch = {};
  if (preset.format !== undefined) {
    patch.format = preset.format;
  }
  if (typeof preset.decimals === 'number') {
    patch.decimals = preset.decimals;
  }
  if (Object.prototype.hasOwnProperty.call(preset, 'compact')) {
    patch.compact = preset.compact;
  }
  if (Object.prototype.hasOwnProperty.call(preset, 'compactThreshold')) {
    patch.compactThreshold = preset.compactThreshold;
  }
  return patch;
};

/**
 * @typedef {Object} WidgetPropertiesPanelProps
 * @property {{ widgets: Object[] }} authoringModel
 * @property {string|null} activeWidgetId
 * @property {Object[]} vizManifests
 * @property {Object[]} datasources
 * @property {string|null} activeDatasourceId
 * @property {Object} validation
 * @property {Object} manifestCoverage
 * @property {Map<string, Object>} compiledPanelMap
 * @property {(updater: (model: Object) => Object) => void} onUpdateAuthoringModel
 * @property {(widgetId: string) => void} onRequestRemoveWidget
 */

/**
 * Editor panel for configuring widget encodings and options.
 *
 * @param {WidgetPropertiesPanelProps} props
 * @returns {JSX.Element}
 */
const WidgetPropertiesPanel = ({
  authoringModel,
  activeWidgetId,
  vizManifests,
  datasources,
  activeDatasourceId,
  validation,
  manifestCoverage,
  compiledPanelMap,
  onUpdateAuthoringModel,
  onRequestRemoveWidget,
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showExpertOptions, setShowExpertOptions] = useState(false);
  const [rawOptionsText, setRawOptionsText] = useState('');
  const [rawOptionsError, setRawOptionsError] = useState('');
  const [showCompiledConfig, setShowCompiledConfig] = useState(false);
  const unsupportedOptionLogRef = useRef(new Set());
  const widgets = authoringModel?.widgets || [];

  useEffect(() => {
    setShowAdvancedOptions(false);
    setShowExpertOptions(false);
    setRawOptionsError('');
  }, [activeWidgetId]);

  const activeWidget = widgets.find(
    (widget) => widget.id === activeWidgetId
  );
  const resolvedDatasourceId =
    activeWidget?.datasourceId ||
    activeWidget?.datasetId ||
    activeDatasourceId ||
    null;
  const activeDatasource =
    (datasources || []).find(
      (datasource) => datasource.id === resolvedDatasourceId
    ) || datasources?.[0] || null;
  const datasetColumns = useMemo(
    () => activeDatasource?.datasetBinding?.columns || [],
    [activeDatasource?.datasetBinding?.columns]
  );
  const normalizedSemanticLayer = useMemo(
    () =>
      activeDatasource?.semanticLayer || {
        enabled: false,
        metrics: [],
        dimensions: [],
      },
    [activeDatasource?.semanticLayer]
  );

  useEffect(() => {
    if (!activeWidget || showExpertOptions) {
      return;
    }
    setRawOptionsText(JSON.stringify(activeWidget.options || {}, null, 2));
    setRawOptionsError('');
  }, [activeWidget, showExpertOptions]);

  const updateAuthoringModel = useCallback((updater) => {
    if (typeof onUpdateAuthoringModel === 'function') {
      onUpdateAuthoringModel(updater);
    }
  }, [onUpdateAuthoringModel]);

  const getEncodingInputValue = (encoding, value) => {
    if (encoding?.multi) {
      return Array.isArray(value) ? value.join(', ') : '';
    }
    return value ?? '';
  };

  const getEncodingInputNextValue = (encoding, rawValue) => {
    if (encoding?.multi) {
      return rawValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return rawValue;
  };

  const parseStringList = (rawValue) =>
    rawValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const formatStringList = (value) =>
    Array.isArray(value) ? value.join(', ') : value ?? '';

  const normalizeColorValue = (value, fallback = '#000000') => {
    if (typeof value === 'string' && value.startsWith('#')) {
      return value;
    }
    return fallback;
  };

  const isOptionVisible = (schema, options) => {
    if (!schema?.visibleWhen) {
      return true;
    }
    const { option, equals } = schema.visibleWhen;
    if (!option) {
      return true;
    }
    const current = getNestedValue(options, option);
    if (Array.isArray(equals)) {
      return equals.includes(current);
    }
    return current === equals;
  };

  const handleWidgetFieldChange = (widgetId, key, value) => {
    updateAuthoringModel((current) => {
      if (key !== 'vizType') {
        return updateWidgetInModel(current, widgetId, {
          [key]: value,
          draft: false,
        });
      }
      const nextEncodings = getVizEncodingDefaults(value);
      const nextOptions = getVizOptionDefaults(value);
      return updateWidgetInModel(current, widgetId, {
        [key]: value,
        encodings: nextEncodings,
        options: nextOptions,
        replaceEncodings: true,
        replaceOptions: true,
        draft: false,
      });
    });
  };

  const handleEncodingChange = (widgetId, key, value) => {
    updateAuthoringModel((current) =>
      updateWidgetInModel(current, widgetId, {
        encodings: { [key]: value },
        draft: false,
      })
    );
  };

  const handleOptionChange = (widgetId, optionKey, schema, value) => {
    let patch = buildOptionPatch(schema, optionKey, value);
    const isKpiSubtypeChange =
      (activeWidget?.vizType === 'kpi' && optionKey === 'subtype') ||
      (activeWidget?.vizType === 'kpiVariant' && optionKey === 'subvariant');
    if (isKpiSubtypeChange) {
      const subtypePatch = buildKpiSubtypePatch(value);
      if (subtypePatch) {
        patch = mergeDeep(patch, subtypePatch);
      }
    }
    updateAuthoringModel((current) =>
      updateWidgetInModel(current, widgetId, {
        options: patch,
        draft: false,
      })
    );
  };

  const handleToggleExpertOptions = () => {
    setShowExpertOptions((current) => {
      const next = !current;
      if (next && activeWidget) {
        setRawOptionsText(
          JSON.stringify(activeWidget.options || {}, null, 2)
        );
      }
      setRawOptionsError('');
      return next;
    });
  };

  const handleApplyRawOptions = () => {
    if (!activeWidget) {
      return;
    }
    try {
      const parsed = rawOptionsText ? JSON.parse(rawOptionsText) : {};
      if (!isPlainObject(parsed)) {
        throw new Error('Options JSON must be an object.');
      }
      updateAuthoringModel((current) =>
        updateWidgetInModel(current, activeWidget.id, {
          options: parsed,
          replaceOptions: true,
          draft: false,
        })
      );
      setRawOptionsError('');
    } catch (error) {
      setRawOptionsError(error?.message || 'Options JSON is invalid.');
    }
  };

  const handleResetRawOptions = () => {
    if (!activeWidget) {
      return;
    }
    setRawOptionsText(JSON.stringify(activeWidget.options || {}, null, 2));
    setRawOptionsError('');
  };

  const activeVizManifest = useMemo(
    () => getVizManifest(activeWidget?.vizType),
    [activeWidget?.vizType]
  );
  const requiredEncodings = useMemo(
    () => activeVizManifest?.encodings?.required || [],
    [activeVizManifest]
  );
  const optionalEncodings = useMemo(
    () => activeVizManifest?.encodings?.optional || [],
    [activeVizManifest]
  );
  const optionEntries = useMemo(
    () => Object.entries(activeVizManifest?.options || {}),
    [activeVizManifest]
  );
  const visibleOptions = optionEntries.filter(([, schema]) =>
    isOptionVisible(schema, activeWidget?.options)
  );
  const basicOptions = visibleOptions.filter(([, schema]) => !schema.advanced);
  const advancedOptions = visibleOptions.filter(
    ([, schema]) => schema.advanced
  );
  const supportedOptionPaths = useMemo(() => {
    const paths = new Set();
    optionEntries.forEach(([key, schema]) => {
      paths.add(getOptionPath(schema, key));
    });
    return paths;
  }, [optionEntries]);
  const unsupportedOptionPaths = useMemo(() => {
    if (!activeWidget) {
      return [];
    }
    return flattenOptionPaths(activeWidget.options || {}).filter(
      (path) => !supportedOptionPaths.has(path)
    );
  }, [activeWidget, supportedOptionPaths]);

  useEffect(() => {
    if (!activeWidget || unsupportedOptionPaths.length === 0) {
      return;
    }
    const logged = unsupportedOptionLogRef.current;
    unsupportedOptionPaths.forEach((path) => {
      const key = `${activeWidget.id}:${path}`;
      if (logged.has(key)) {
        return;
      }
      logged.add(key);
      trackTelemetryEvent('widget_option_unsupported', {
        widgetId: activeWidget.id,
        vizType: activeWidget.vizType,
        optionPath: path,
      });
    });
  }, [activeWidget, unsupportedOptionPaths]);

  const compiledActivePanel = activeWidget
    ? compiledPanelMap.get(activeWidget.id)
    : null;
  const compiledPanelJson = useMemo(
    () =>
      compiledActivePanel ? JSON.stringify(compiledActivePanel, null, 2) : '',
    [compiledActivePanel]
  );

  useEffect(() => {
    if (!activeWidget) {
      return;
    }
    const nextOptions = optionEntries.reduce((acc, [optionKey, schema]) => {
      if (!schema?.optionsByOption) {
        return acc;
      }
      const selectOptions = resolveSelectOptions(schema, activeWidget.options);
      if (!selectOptions.length) {
        return acc;
      }
      const currentValue = getOptionValue(
        schema,
        optionKey,
        activeWidget.options
      );
      const nextValue = resolveSelectValue(
        schema,
        currentValue,
        activeWidget.options
      );
      if (nextValue === currentValue) {
        return acc;
      }
      return mergeDeep(
        acc,
        buildOptionPatch(schema, optionKey, nextValue)
      );
    }, {});
    if (Object.keys(nextOptions).length === 0) {
      return;
    }
    updateAuthoringModel((current) =>
      updateWidgetInModel(current, activeWidget.id, {
        options: nextOptions,
        draft: false,
      })
    );
  }, [activeWidget, optionEntries, updateAuthoringModel]);

  const renderOptionField = (optionKey, schema) => {
    if (!activeWidget) {
      return null;
    }
    const optionValue = getOptionValue(
      schema,
      optionKey,
      activeWidget.options
    );
    const label = schema.label || optionKey;
    const helpText = schema.help;
    const fieldId = `${activeWidget.id}-${optionKey}`;
    const control = resolveEditorControl(schema);
    const listId =
      schema.suggestFrom === 'fields' ? fieldOptionsListId : undefined;

    if (control === 'toggle') {
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <input
            id={fieldId}
            className="lazy-input__field"
            type="checkbox"
            checked={Boolean(optionValue)}
            onChange={(event) =>
              handleOptionChange(
                activeWidget.id,
                optionKey,
                schema,
                event.target.checked
              )
            }
          />
          {helpText ? (
            <span className="lazy-input__help">{helpText}</span>
          ) : null}
        </label>
      );
    }

    if (control === 'select') {
      const selectOptions = resolveSelectOptions(schema, activeWidget.options);
      const resolvedValue = resolveSelectValue(
        schema,
        optionValue,
        activeWidget.options
      );
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <select
            id={fieldId}
            className="lazy-input__field"
            value={resolvedValue}
            onChange={(event) =>
              handleOptionChange(
                activeWidget.id,
                optionKey,
                schema,
                event.target.value
              )
            }
          >
            {selectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {helpText ? (
            <span className="lazy-input__help">{helpText}</span>
          ) : null}
        </label>
      );
    }

    if (control === 'number') {
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <input
            id={fieldId}
            className="lazy-input__field"
            type="number"
            min={schema.min}
            max={schema.max}
            value={Number.isFinite(optionValue) ? optionValue : ''}
            onChange={(event) => {
              const rawValue = event.target.value;
              const parsed = rawValue === '' ? null : Number(rawValue);
              handleOptionChange(
                activeWidget.id,
                optionKey,
                schema,
                Number.isNaN(parsed) ? null : parsed
              );
            }}
          />
          {helpText ? (
            <span className="lazy-input__help">{helpText}</span>
          ) : null}
        </label>
      );
    }

    if (control === 'list') {
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <input
            id={fieldId}
            className="lazy-input__field"
            type="text"
            placeholder="Comma-separated values"
            value={formatStringList(optionValue)}
            onChange={(event) =>
              handleOptionChange(
                activeWidget.id,
                optionKey,
                schema,
                parseStringList(event.target.value)
              )
            }
          />
          {helpText ? (
            <span className="lazy-input__help">{helpText}</span>
          ) : null}
        </label>
      );
    }

    if (control === 'color') {
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <input
            id={fieldId}
            className="lazy-input__field"
            type="color"
            value={normalizeColorValue(optionValue, schema.default)}
            onChange={(event) =>
              handleOptionChange(
                activeWidget.id,
                optionKey,
                schema,
                event.target.value
              )
            }
          />
          {helpText ? (
            <span className="lazy-input__help">{helpText}</span>
          ) : null}
        </label>
      );
    }

    return (
      <label key={optionKey} className="lazy-form__field">
        <span className="lazy-input__label">{label}</span>
        <input
          id={fieldId}
          className="lazy-input__field"
          type="text"
          list={listId}
          value={optionValue ?? ''}
          onChange={(event) =>
            handleOptionChange(
              activeWidget.id,
              optionKey,
              schema,
              event.target.value
            )
          }
        />
        {helpText ? (
          <span className="lazy-input__help">{helpText}</span>
        ) : null}
      </label>
    );
  };

  const activeValidation = activeWidget
    ? validation.widgets[activeWidget.id]
    : null;
  const widgetErrors = activeValidation?.errors || [];
  const fieldOptionsByRole = useMemo(() => {
    const all = new Set();
    const metrics = new Set();
    const dimensions = new Set();
    const addOption = (id, role) => {
      if (!id) {
        return;
      }
      all.add(id);
      if (role === 'metric') {
        metrics.add(id);
      } else if (role === 'dimension') {
        dimensions.add(id);
      }
    };
    (datasetColumns || []).forEach((column) => {
      const id = column?.id;
      let role = column?.role || column?.inferredRole || null;
      if (!role) {
        const type = column?.type || column?.inferredType || 'string';
        role = type === 'number' ? 'metric' : 'dimension';
      }
      addOption(id, role);
    });
    if (normalizedSemanticLayer.enabled) {
      normalizedSemanticLayer.dimensions.forEach((dimension) =>
        addOption(dimension?.id, 'dimension')
      );
      normalizedSemanticLayer.metrics.forEach((metric) =>
        addOption(metric?.id, 'metric')
      );
    }
    return {
      all: Array.from(all),
      metric: Array.from(metrics),
      dimension: Array.from(dimensions),
    };
  }, [datasetColumns, normalizedSemanticLayer]);
  const getFieldOptionsForEncoding = useCallback((encoding) => {
    if (encoding?.role === 'metric') {
      return fieldOptionsByRole.metric;
    }
    if (encoding?.role === 'dimension') {
      return fieldOptionsByRole.dimension;
    }
    return fieldOptionsByRole.all;
  }, [fieldOptionsByRole]);
  const isEncodingValueAllowed = useCallback((encoding, value) => {
    const allowed = getFieldOptionsForEncoding(encoding);
    if (!allowed.length) {
      return true;
    }
    if (encoding?.multi) {
      return Array.isArray(value)
        ? value.every((entry) => allowed.includes(entry))
        : false;
    }
    if (value === '' || value === null || value === undefined) {
      return true;
    }
    return allowed.includes(value);
  }, [getFieldOptionsForEncoding]);
  const fieldOptionsListId = 'lazy-field-options';

  useEffect(() => {
    if (!activeWidget) {
      return;
    }
    const encodingsToCheck = [
      ...(requiredEncodings || []),
      ...(optionalEncodings || []),
    ];
    const patch = {};
    encodingsToCheck.forEach((encoding) => {
      if (encoding?.role !== 'metric') {
        return;
      }
      const allowed = getFieldOptionsForEncoding(encoding);
      if (allowed.length !== 1) {
        return;
      }
      const current = activeWidget.encodings?.[encoding.id];
      if (!current || isEncodingValueAllowed(encoding, current)) {
        return;
      }
      patch[encoding.id] = allowed[0];
    });
    if (Object.keys(patch).length) {
      updateAuthoringModel((current) =>
        updateWidgetInModel(current, activeWidget.id, {
          encodings: patch,
          draft: false,
        })
      );
    }
  }, [
    activeWidget,
    optionalEncodings,
    requiredEncodings,
    fieldOptionsByRole,
    getFieldOptionsForEncoding,
    isEncodingValueAllowed,
    updateAuthoringModel,
  ]);

  return (
    <section className="lazy-panel">
      <h2 className="lazy-panel__title">Widget Properties</h2>
      {manifestCoverage.errors.length > 0 ? (
        <div className="lazy-alert danger">
          <strong>Manifest coverage check failed.</strong>
          <span>{manifestCoverage.errors.join(' ')}</span>
        </div>
      ) : null}
      {!activeWidget ? (
        <p className="lazy-panel__body">
          Select a widget to tune encodings, options, and filters.
        </p>
      ) : (
        <div className="lazy-form">
          <datalist id={fieldOptionsListId}>
            {fieldOptionsByRole.all.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <label className="lazy-form__field">
            <span className="lazy-input__label">Title</span>
            <input
              className="lazy-input__field"
              type="text"
              value={activeWidget.title}
              onChange={(event) =>
                handleWidgetFieldChange(
                  activeWidget.id,
                  'title',
                  event.target.value
                )
              }
            />
          </label>
          <label className="lazy-form__field">
            <span className="lazy-input__label">Subtitle</span>
            <input
              className="lazy-input__field"
              type="text"
              value={activeWidget.subtitle}
              onChange={(event) =>
                handleWidgetFieldChange(
                  activeWidget.id,
                  'subtitle',
                  event.target.value
                )
              }
            />
          </label>
          <label className="lazy-form__field">
            <span className="lazy-input__label">Datasource</span>
            <select
              className="lazy-input__field"
              value={resolvedDatasourceId || ''}
              onChange={(event) =>
                handleWidgetFieldChange(
                  activeWidget.id,
                  'datasourceId',
                  event.target.value
                )
              }
              disabled={(datasources || []).length <= 1}
            >
              {(datasources || []).map((datasource) => (
                <option key={datasource.id} value={datasource.id}>
                  {datasource.name || datasource.id}
                </option>
              ))}
            </select>
          </label>
          <label className="lazy-form__field">
            <span className="lazy-input__label">Viz Type</span>
            <select
              className="lazy-input__field"
              value={activeWidget.vizType}
              onChange={(event) =>
                handleWidgetFieldChange(
                  activeWidget.id,
                  'vizType',
                  event.target.value
                )
              }
            >
              {vizManifests.map((manifest) => (
                <option
                  key={manifest.id}
                  value={manifest.id}
                  disabled={manifest.supportLevel === 'deferred'}
                >
                  {manifest.label}
                </option>
              ))}
            </select>
          </label>
          {activeVizManifest?.supportLevel === 'partial' ? (
            <div className="lazy-alert warning">
              <strong>Partial support.</strong>
              <span>
                Some options for this widget are only editable in Expert mode.
              </span>
            </div>
          ) : null}
          {activeVizManifest?.supportLevel === 'deferred' ? (
            <div className="lazy-alert danger">
              <strong>Deferred widget.</strong>
              <span>
                This widget is not fully supported yet. Preview output may be
                incomplete.
              </span>
            </div>
          ) : null}
          {requiredEncodings.length > 0 ? (
            <p className="lazy-panel__body">Required encodings</p>
          ) : null}
          {requiredEncodings.map((encoding) => (
            <label key={encoding.id} className="lazy-form__field">
              <datalist id={`${fieldOptionsListId}-${encoding.id}`}>
                {getFieldOptionsForEncoding(encoding).map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <span className="lazy-input__label">
                {encoding.label || encoding.id}
              </span>
              <input
                className="lazy-input__field"
                type="text"
                placeholder={
                  encoding.multi ? 'Comma-separated fields' : ''
                }
                list={`${fieldOptionsListId}-${encoding.id}`}
                value={getEncodingInputValue(
                  encoding,
                  activeWidget.encodings?.[encoding.id]
                )}
                onChange={(event) =>
                  handleEncodingChange(
                    activeWidget.id,
                    encoding.id,
                    getEncodingInputNextValue(
                      encoding,
                      event.target.value
                    )
                  )
                }
              />
              {encoding.help ? (
                <span className="lazy-input__help">{encoding.help}</span>
              ) : null}
              {!isEncodingValueAllowed(
                encoding,
                activeWidget.encodings?.[encoding.id]
              ) ? (
                <span className="lazy-input__help">
                  Select a {encoding.role || 'valid'} field.
                </span>
              ) : null}
            </label>
          ))}
          {optionalEncodings.length > 0 ? (
            <p className="lazy-panel__body">Optional encodings</p>
          ) : null}
          {optionalEncodings.map((encoding) => (
            <label key={encoding.id} className="lazy-form__field">
              <datalist id={`${fieldOptionsListId}-${encoding.id}`}>
                {getFieldOptionsForEncoding(encoding).map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <span className="lazy-input__label">
                {encoding.label || encoding.id}
              </span>
              <input
                className="lazy-input__field"
                type="text"
                placeholder={
                  encoding.multi ? 'Comma-separated fields' : ''
                }
                list={`${fieldOptionsListId}-${encoding.id}`}
                value={getEncodingInputValue(
                  encoding,
                  activeWidget.encodings?.[encoding.id]
                )}
                onChange={(event) =>
                  handleEncodingChange(
                    activeWidget.id,
                    encoding.id,
                    getEncodingInputNextValue(
                      encoding,
                      event.target.value
                    )
                  )
                }
              />
              {encoding.help ? (
                <span className="lazy-input__help">{encoding.help}</span>
              ) : null}
              {!isEncodingValueAllowed(
                encoding,
                activeWidget.encodings?.[encoding.id]
              ) ? (
                <span className="lazy-input__help">
                  Select a {encoding.role || 'valid'} field.
                </span>
              ) : null}
            </label>
          ))}
          {basicOptions.length > 0 ? (
            <p className="lazy-panel__body">Options</p>
          ) : null}
          {basicOptions.map(([optionKey, schema]) =>
            renderOptionField(optionKey, schema)
          )}
          {advancedOptions.length > 0 ? (
            <button
              className="lazy-button ghost"
              type="button"
              onClick={() =>
                setShowAdvancedOptions((current) => !current)
              }
            >
              {showAdvancedOptions
                ? 'Hide advanced options'
                : 'Show advanced options'}
            </button>
          ) : null}
          {showAdvancedOptions
            ? advancedOptions.map(([optionKey, schema]) =>
                renderOptionField(optionKey, schema)
              )
            : null}
          {unsupportedOptionPaths.length > 0 ? (
            <div className="lazy-alert warning">
              <strong>Unsupported options detected.</strong>
              <span>
                These fields are preserved but not editable yet:{' '}
                {unsupportedOptionPaths.join(', ')}
              </span>
            </div>
          ) : null}
          <div className="lazy-expert__actions">
            <button
              className="lazy-button ghost"
              type="button"
              onClick={handleToggleExpertOptions}
            >
              {showExpertOptions ? 'Hide expert mode' : 'Show expert mode'}
            </button>
            <button
              className="lazy-button ghost"
              type="button"
              onClick={() => setShowCompiledConfig((current) => !current)}
            >
              {showCompiledConfig
                ? 'Hide compiled config'
                : 'Show compiled config'}
            </button>
          </div>
          {showExpertOptions ? (
            <div className="lazy-expert">
              <label className="lazy-form__field">
                <span className="lazy-input__label">Options JSON</span>
                <textarea
                  className="lazy-input__field lazy-input__field--code"
                  rows={8}
                  value={rawOptionsText}
                  onChange={(event) => setRawOptionsText(event.target.value)}
                />
              </label>
              {rawOptionsError ? (
                <div className="lazy-alert danger">{rawOptionsError}</div>
              ) : null}
              <div className="lazy-form__actions">
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={handleResetRawOptions}
                >
                  Reset JSON
                </button>
                <button
                  className="lazy-button"
                  type="button"
                  onClick={handleApplyRawOptions}
                >
                  Apply JSON
                </button>
              </div>
            </div>
          ) : null}
          {showCompiledConfig ? (
            <pre className="lazy-code-block lazy-code-block--panel">
              {compiledPanelJson || 'No compiled config available.'}
            </pre>
          ) : null}
          {widgetErrors.length > 0 ? (
            <div className="lazy-validation">
              <p className="lazy-validation__title">Needs attention</p>
              <ul className="lazy-validation__list">
                {widgetErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="lazy-form__actions">
            <button
              className="lazy-button danger"
              type="button"
              onClick={() => onRequestRemoveWidget(activeWidget.id)}
            >
              Remove widget
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default WidgetPropertiesPanel;
