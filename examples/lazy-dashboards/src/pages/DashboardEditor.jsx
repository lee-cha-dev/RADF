import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useDashboardRegistry from '../hooks/useDashboardRegistry.js';
import {
  addWidgetToModel,
  createAuthoringModel,
  createWidgetDraft,
  normalizeAuthoringModel,
  removeWidgetFromModel,
  updateWidgetInModel,
} from '../authoring/authoringModel.js';
import { compileAuthoringModel } from '../authoring/compiler.js';
import { validateAuthoringModel } from '../authoring/validation.js';
import {
  getVizEncodingDefaults,
  getVizManifest,
  getVizOptionDefaults,
  listVizManifests,
} from '../authoring/vizManifest.js';
import DatasetImporter from '../components/DatasetImporter.jsx';
import {
  buildDefaultSemanticLayer,
  buildDimensionSuggestions,
  buildMetricSuggestions,
} from '../data/semanticLayer.js';

const DashboardEditor = () => {
  const { dashboardId } = useParams();
  const { getDashboardById, updateDashboard } = useDashboardRegistry();
  const dashboard = getDashboardById(dashboardId);
  const [lastSavedAt, setLastSavedAt] = useState(
    dashboard?.updatedAt || null
  );
  const [authoringModel, setAuthoringModel] = useState(() =>
    normalizeAuthoringModel(
      dashboard?.authoringModel ||
        createAuthoringModel({ title: dashboard?.name })
    )
  );
  const [activeWidgetId, setActiveWidgetId] = useState(
    dashboard?.authoringModel?.widgets?.[0]?.id || null
  );
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    setLastSavedAt(dashboard?.updatedAt || null);
  }, [dashboard?.updatedAt]);

  useEffect(() => {
    if (!dashboard) {
      return;
    }
    const normalized = normalizeAuthoringModel(dashboard.authoringModel, {
      title: dashboard.name,
    });
    if (!normalized.datasetBinding && dashboard.datasetBinding) {
      normalized.datasetBinding = dashboard.datasetBinding;
    }
    setAuthoringModel(normalized);
    if (!activeWidgetId && normalized.widgets.length > 0) {
      setActiveWidgetId(normalized.widgets[0].id);
    }
  }, [dashboard, activeWidgetId]);

  useEffect(() => {
    setShowAdvancedOptions(false);
  }, [activeWidgetId]);

  const formattedSavedAt = useMemo(() => {
    if (!lastSavedAt) {
      return 'Not saved yet';
    }
    const date = new Date(lastSavedAt);
    if (Number.isNaN(date.getTime())) {
      return 'Not saved yet';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [lastSavedAt]);

  const validation = useMemo(
    () => validateAuthoringModel(authoringModel),
    [authoringModel]
  );

  const compiled = useMemo(
    () => compileAuthoringModel({ dashboard, authoringModel }),
    [dashboard, authoringModel]
  );

  const vizManifests = useMemo(() => listVizManifests(), []);
  const datasetBinding = authoringModel.datasetBinding || null;
  const datasetColumns = datasetBinding?.columns || [];
  const semanticLayer = authoringModel.semanticLayer || {
    enabled: false,
    metrics: [],
    dimensions: [],
  };

  const dimensionSuggestions = useMemo(
    () => buildDimensionSuggestions(datasetColumns),
    [datasetColumns]
  );
  const metricGroups = useMemo(
    () => buildMetricSuggestions(datasetColumns),
    [datasetColumns]
  );
  const defaultSemanticLayer = useMemo(
    () => buildDefaultSemanticLayer(datasetColumns),
    [datasetColumns]
  );

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

  const isOptionVisible = (schema, options) => {
    if (!schema?.visibleWhen) {
      return true;
    }
    const { option, equals } = schema.visibleWhen;
    if (!option) {
      return true;
    }
    const current = options?.[option];
    if (Array.isArray(equals)) {
      return equals.includes(current);
    }
    return current === equals;
  };

  const handleSave = () => {
    const updated = updateDashboard(dashboardId, {
      authoringModel,
      compiledConfig: compiled.config,
      datasetBinding: authoringModel.datasetBinding || null,
    });
    if (updated?.updatedAt) {
      setLastSavedAt(updated.updatedAt);
    }
  };

  const handleDatasetUpdate = useCallback((nextDataset) => {
    setAuthoringModel((current) => ({
      ...current,
      datasetBinding: nextDataset || null,
    }));
  }, []);

  const handleAddWidget = () => {
    const vizChoices = vizManifests.map((manifest) => manifest.id).join(', ');
    const vizType =
      window
        .prompt(
          `Viz type (${vizChoices})`,
          vizManifests[0]?.id || 'kpi'
        )
        ?.trim() || '';
    if (!vizType) {
      return;
    }
    setAuthoringModel((current) => {
      const widget = createWidgetDraft(current, { vizType });
      const next = addWidgetToModel(current, widget);
      setActiveWidgetId(widget.id);
      return next;
    });
  };

  const handleRemoveWidget = (widgetId) => {
    setAuthoringModel((current) => {
      const next = removeWidgetFromModel(current, widgetId);
      if (activeWidgetId === widgetId) {
        setActiveWidgetId(next.widgets[0]?.id || null);
      }
      return next;
    });
  };

  const handleWidgetFieldChange = (widgetId, key, value) => {
    setAuthoringModel((current) => {
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
    setAuthoringModel((current) =>
      updateWidgetInModel(current, widgetId, {
        encodings: { [key]: value },
        draft: false,
      })
    );
  };

  const handleOptionChange = (widgetId, key, value) => {
    setAuthoringModel((current) =>
      updateWidgetInModel(current, widgetId, {
        options: { [key]: value },
        draft: false,
      })
    );
  };

  const updateSemanticLayer = useCallback((updater) => {
    setAuthoringModel((current) => {
      const nextLayer = updater(current.semanticLayer || {
        enabled: false,
        metrics: [],
        dimensions: [],
      });
      return {
        ...current,
        semanticLayer: nextLayer,
      };
    });
  }, []);

  const handleSemanticModeChange = useCallback(
    (enabled) => {
      updateSemanticLayer((currentLayer) => {
        const nextLayer = {
          ...currentLayer,
          enabled,
        };
        if (
          enabled &&
          nextLayer.metrics.length === 0 &&
          nextLayer.dimensions.length === 0
        ) {
          nextLayer.metrics = defaultSemanticLayer.metrics;
          nextLayer.dimensions = defaultSemanticLayer.dimensions;
        }
        return nextLayer;
      });
    },
    [updateSemanticLayer, defaultSemanticLayer]
  );

  const handleSemanticReset = useCallback(() => {
    updateSemanticLayer((currentLayer) => ({
      ...currentLayer,
      enabled: true,
      metrics: defaultSemanticLayer.metrics,
      dimensions: defaultSemanticLayer.dimensions,
    }));
  }, [updateSemanticLayer, defaultSemanticLayer]);

  const handleDimensionToggle = useCallback(
    (dimension, enabled) => {
      updateSemanticLayer((currentLayer) => {
        const existing = currentLayer.dimensions || [];
        const hasDimension = existing.some(
          (item) => item.id === dimension.id
        );
        let nextDimensions = existing;
        if (enabled && !hasDimension) {
          nextDimensions = [...existing, dimension];
        } else if (!enabled && hasDimension) {
          nextDimensions = existing.filter((item) => item.id !== dimension.id);
        }
        return {
          ...currentLayer,
          dimensions: nextDimensions,
        };
      });
    },
    [updateSemanticLayer]
  );

  const handleDimensionLabelChange = useCallback(
    (dimensionId, nextLabel) => {
      updateSemanticLayer((currentLayer) => ({
        ...currentLayer,
        dimensions: (currentLayer.dimensions || []).map((item) =>
          item.id === dimensionId
            ? { ...item, label: nextLabel }
            : item
        ),
      }));
    },
    [updateSemanticLayer]
  );

  const handleMetricToggle = useCallback(
    (metric, enabled) => {
      updateSemanticLayer((currentLayer) => {
        const existing = currentLayer.metrics || [];
        const hasMetric = existing.some((item) => item.id === metric.id);
        let nextMetrics = existing;
        if (enabled && !hasMetric) {
          nextMetrics = [...existing, metric];
        } else if (!enabled && hasMetric) {
          nextMetrics = existing.filter((item) => item.id !== metric.id);
        }
        return {
          ...currentLayer,
          metrics: nextMetrics,
        };
      });
    },
    [updateSemanticLayer]
  );

  const handleMetricLabelChange = useCallback(
    (metricId, nextLabel) => {
      updateSemanticLayer((currentLayer) => ({
        ...currentLayer,
        metrics: (currentLayer.metrics || []).map((item) =>
          item.id === metricId
            ? { ...item, label: nextLabel }
            : item
        ),
      }));
    },
    [updateSemanticLayer]
  );

  const activeWidget = authoringModel.widgets.find(
    (widget) => widget.id === activeWidgetId
  );
  const activeVizManifest = useMemo(
    () => getVizManifest(activeWidget?.vizType),
    [activeWidget?.vizType]
  );
  const requiredEncodings = activeVizManifest?.encodings?.required || [];
  const optionalEncodings = activeVizManifest?.encodings?.optional || [];
  const optionEntries = Object.entries(activeVizManifest?.options || {});
  const visibleOptions = optionEntries.filter(([, schema]) =>
    isOptionVisible(schema, activeWidget?.options)
  );
  const basicOptions = visibleOptions.filter(([, schema]) => !schema.advanced);
  const advancedOptions = visibleOptions.filter(([, schema]) => schema.advanced);

  const renderOptionField = (optionKey, schema) => {
    if (!activeWidget) {
      return null;
    }
    const optionValue = activeWidget.options?.[optionKey];
    const label = schema.label || optionKey;
    const helpText = schema.help;
    const fieldId = `${activeWidget.id}-${optionKey}`;
    if (schema.type === 'boolean') {
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <input
            id={fieldId}
            className="lazy-input__field"
            type="checkbox"
            checked={Boolean(optionValue)}
            onChange={(event) =>
              handleOptionChange(activeWidget.id, optionKey, event.target.checked)
            }
          />
          {helpText ? <span className="lazy-input__help">{helpText}</span> : null}
        </label>
      );
    }
    if (schema.type === 'enum') {
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <select
            id={fieldId}
            className="lazy-input__field"
            value={optionValue ?? ''}
            onChange={(event) =>
              handleOptionChange(activeWidget.id, optionKey, event.target.value)
            }
          >
            {(schema.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {helpText ? <span className="lazy-input__help">{helpText}</span> : null}
        </label>
      );
    }
    if (schema.type === 'number') {
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
              const parsed =
                rawValue === '' ? null : Number(rawValue);
              handleOptionChange(
                activeWidget.id,
                optionKey,
                Number.isNaN(parsed) ? null : parsed
              );
            }}
          />
          {helpText ? <span className="lazy-input__help">{helpText}</span> : null}
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
          value={optionValue ?? ''}
          onChange={(event) =>
            handleOptionChange(activeWidget.id, optionKey, event.target.value)
          }
        />
        {helpText ? <span className="lazy-input__help">{helpText}</span> : null}
      </label>
    );
  };
  const activeValidation = activeWidget
    ? validation.widgets[activeWidget.id]
    : null;
  const widgetErrors = activeValidation?.errors || [];
  const dimensionMap = useMemo(
    () =>
      new Map(
        (semanticLayer.dimensions || []).map((item) => [item.id, item])
      ),
    [semanticLayer.dimensions]
  );
  const metricMap = useMemo(
    () =>
      new Map((semanticLayer.metrics || []).map((item) => [item.id, item])),
    [semanticLayer.metrics]
  );
  const fieldOptions = useMemo(() => {
    const options = new Set();
    datasetColumns.forEach((column) => {
      if (column?.id) {
        options.add(column.id);
      }
    });
    if (semanticLayer.enabled) {
      semanticLayer.dimensions.forEach((dimension) => {
        if (dimension?.id) {
          options.add(dimension.id);
        }
      });
      semanticLayer.metrics.forEach((metric) => {
        if (metric?.id) {
          options.add(metric.id);
        }
      });
    }
    return Array.from(options);
  }, [datasetColumns, semanticLayer]);
  const fieldOptionsListId = 'lazy-field-options';

  if (!dashboard) {
    return (
      <section className="lazy-editor">
        <header className="lazy-editor__header">
          <div>
            <p className="lazy-editor__eyebrow">Dashboard Editor</p>
            <h1 className="lazy-editor__title">Dashboard not found</h1>
            <p className="lazy-editor__subtitle">
              That dashboard may have been deleted or renamed.
            </p>
          </div>
          <div className="lazy-editor__actions">
            <Link className="lazy-button ghost" to="/">
              Back to Library
            </Link>
          </div>
        </header>
      </section>
    );
  }

  return (
    <section className="lazy-editor">
      <header className="lazy-editor__header">
        <div>
          <p className="lazy-editor__eyebrow">Dashboard Editor</p>
          <h1 className="lazy-editor__title">{dashboard.name}</h1>
          <p className="lazy-editor__subtitle">
            Drag widgets, tune encodings, and preview live as you edit.
          </p>
          <p className="lazy-editor__subtitle">Last saved: {formattedSavedAt}</p>
        </div>
        <div className="lazy-editor__actions">
          <button className="lazy-button" type="button" onClick={handleSave}>
            Save Draft
          </button>
          <button className="lazy-button ghost" type="button">
            Export
          </button>
          <Link className="lazy-button ghost" to="/">
            Back to Library
          </Link>
        </div>
      </header>

      <div className="lazy-editor__grid">
        <div className="lazy-editor__column">
          <section className="lazy-panel">
            <h2 className="lazy-panel__title">Dataset & Semantic Layer</h2>
            <p className="lazy-panel__body">
              Import data and optionally define metrics and dimensions.
            </p>
            <DatasetImporter
              datasetBinding={datasetBinding}
              onUpdate={handleDatasetUpdate}
            />
          </section>
          <section className="lazy-panel">
            <div className="lazy-panel__split">
              <div>
                <h2 className="lazy-panel__title">Semantic Layer</h2>
                <p className="lazy-panel__body">
                  Switch between simple column references and curated fields.
                </p>
              </div>
              <div className="lazy-toggle">
                <button
                  className={`lazy-toggle__button ${
                    !semanticLayer.enabled ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => handleSemanticModeChange(false)}
                >
                  Simple
                </button>
                <button
                  className={`lazy-toggle__button ${
                    semanticLayer.enabled ? 'active' : ''
                  }`}
                  type="button"
                  onClick={() => handleSemanticModeChange(true)}
                >
                  Semantic
                </button>
              </div>
            </div>
            {!datasetBinding ? (
              <p className="lazy-panel__body">
                Import a dataset to generate metrics and dimensions.
              </p>
            ) : (
              <div className="lazy-semantic">
                <div className="lazy-semantic__header">
                  <p className="lazy-panel__body">
                    {semanticLayer.enabled
                      ? 'Select which fields to publish as semantic assets.'
                      : 'Use raw column ids directly in widget encodings.'}
                  </p>
                  <button
                    className="lazy-button ghost"
                    type="button"
                    onClick={handleSemanticReset}
                    disabled={datasetColumns.length === 0}
                  >
                    Generate defaults
                  </button>
                </div>
                {semanticLayer.enabled ? (
                  <div className="lazy-semantic__grid">
                    <div className="lazy-semantic__section">
                      <p className="lazy-panel__body">Dimensions</p>
                      <div className="lazy-semantic__list">
                        {dimensionSuggestions.length === 0 ? (
                          <p className="lazy-panel__body">
                            No dimension fields detected.
                          </p>
                        ) : (
                          dimensionSuggestions.map((dimension) => {
                            const active = dimensionMap.has(dimension.id);
                            const current = dimensionMap.get(dimension.id);
                            return (
                              <div
                                key={dimension.id}
                                className="lazy-semantic__item"
                              >
                                <label className="lazy-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={(event) =>
                                      handleDimensionToggle(
                                        dimension,
                                        event.target.checked
                                      )
                                    }
                                  />
                                  <span>{dimension.label}</span>
                                </label>
                                <label className="lazy-input">
                                  <span className="lazy-input__label">
                                    Label
                                  </span>
                                  <input
                                    className="lazy-input__field"
                                    type="text"
                                    value={current?.label || dimension.label}
                                    disabled={!active}
                                    onChange={(event) =>
                                      handleDimensionLabelChange(
                                        dimension.id,
                                        event.target.value
                                      )
                                    }
                                  />
                                </label>
                                <span className="lazy-pill">
                                  {dimension.type}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                    <div className="lazy-semantic__section">
                      <p className="lazy-panel__body">Metrics</p>
                      <div className="lazy-semantic__list">
                        {metricGroups.length === 0 ? (
                          <p className="lazy-panel__body">
                            No numeric fields detected.
                          </p>
                        ) : (
                          metricGroups.map((group) => (
                            <div
                              key={group.fieldId}
                              className="lazy-metric-group"
                            >
                              <p className="lazy-metric-group__title">
                                {group.fieldLabel}
                              </p>
                              <div className="lazy-metric-group__list">
                                {group.metrics.map((metric) => {
                                  const active = metricMap.has(metric.id);
                                  const current = metricMap.get(metric.id);
                                  return (
                                    <div
                                      key={metric.id}
                                      className="lazy-semantic__item"
                                    >
                                      <label className="lazy-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={active}
                                          onChange={(event) =>
                                            handleMetricToggle(
                                              metric,
                                              event.target.checked
                                            )
                                          }
                                        />
                                        <span>{metric.opLabel}</span>
                                      </label>
                                      <label className="lazy-input">
                                        <span className="lazy-input__label">
                                          Label
                                        </span>
                                        <input
                                          className="lazy-input__field"
                                          type="text"
                                          value={current?.label || metric.label}
                                          disabled={!active}
                                          onChange={(event) =>
                                            handleMetricLabelChange(
                                              metric.id,
                                              event.target.value
                                            )
                                          }
                                        />
                                      </label>
                                      <span className="lazy-pill">
                                        {metric.query.op}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="lazy-semantic__simple">
                    <p className="lazy-panel__body">
                      Available columns:{' '}
                      {datasetColumns.length
                        ? datasetColumns.map((column) => column.id).join(', ')
                        : 'None'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
          <section className="lazy-panel">
            <h2 className="lazy-panel__title">Authoring Model</h2>
            <p className="lazy-panel__body">
              {validation.isValid
                ? 'All widgets compile cleanly.'
                : 'Some widgets still need required fields.'}
            </p>
            <div className="lazy-widget-list">
              {authoringModel.widgets.length === 0 ? (
                <p className="lazy-panel__body">
                  Add a widget to start defining your layout.
                </p>
              ) : (
                authoringModel.widgets.map((widget) => {
                  const status = validation.widgets[widget.id]?.status || 'draft';
                  return (
                    <div
                      key={widget.id}
                      className={`lazy-widget-item${
                        widget.id === activeWidgetId ? ' active' : ''
                      }`}
                      onClick={() => setActiveWidgetId(widget.id)}
                    >
                      <div className="lazy-widget-item__header">
                        <strong>{widget.title}</strong>
                        <span className={`lazy-widget-status ${status}`}>
                          {status}
                        </span>
                      </div>
                      <span className="lazy-widget-meta">
                        {widget.vizType} • {widget.layout.w}x{widget.layout.h}
                      </span>
                      <div className="lazy-widget-actions">
                        <button
                          className="lazy-button ghost"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleRemoveWidget(widget.id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button className="lazy-button ghost" type="button" onClick={handleAddWidget}>
              Add Widget
            </button>
          </section>
        </div>
        <section className="lazy-canvas">
          <div className="lazy-canvas__header">
            <h2 className="lazy-panel__title">Live Preview</h2>
            <button className="lazy-button ghost" type="button" onClick={handleAddWidget}>
              Add Widget
            </button>
          </div>
          <div className="lazy-canvas__stage">
            {authoringModel.widgets.length === 0 ? (
              <p className="lazy-canvas__empty">
                Panels render here once widgets are configured.
              </p>
            ) : (
              <pre className="lazy-code-block">
                {JSON.stringify(compiled.config, null, 2)}
              </pre>
            )}
          </div>
        </section>
        <section className="lazy-panel">
          <h2 className="lazy-panel__title">Widget Properties</h2>
          {!activeWidget ? (
            <p className="lazy-panel__body">
              Select a widget to tune encodings, options, and filters.
            </p>
          ) : (
            <div className="lazy-form">
              <datalist id={fieldOptionsListId}>
                {fieldOptions.map((option) => (
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
                    <option key={manifest.id} value={manifest.id}>
                      {manifest.label}
                    </option>
                  ))}
                </select>
              </label>
              {requiredEncodings.length > 0 ? (
                <p className="lazy-panel__body">Required encodings</p>
              ) : null}
              {requiredEncodings.map((encoding) => (
                <label key={encoding.id} className="lazy-form__field">
                  <span className="lazy-input__label">
                    {encoding.label || encoding.id}
                  </span>
                  <input
                    className="lazy-input__field"
                    type="text"
                    placeholder={encoding.multi ? 'Comma-separated fields' : ''}
                    list={fieldOptionsListId}
                    value={getEncodingInputValue(
                      encoding,
                      activeWidget.encodings?.[encoding.id]
                    )}
                    onChange={(event) =>
                      handleEncodingChange(
                        activeWidget.id,
                        encoding.id,
                        getEncodingInputNextValue(encoding, event.target.value)
                      )
                    }
                  />
                  {encoding.help ? (
                    <span className="lazy-input__help">{encoding.help}</span>
                  ) : null}
                </label>
              ))}
              {optionalEncodings.length > 0 ? (
                <p className="lazy-panel__body">Optional encodings</p>
              ) : null}
              {optionalEncodings.map((encoding) => (
                <label key={encoding.id} className="lazy-form__field">
                  <span className="lazy-input__label">
                    {encoding.label || encoding.id}
                  </span>
                  <input
                    className="lazy-input__field"
                    type="text"
                    placeholder={encoding.multi ? 'Comma-separated fields' : ''}
                    list={fieldOptionsListId}
                    value={getEncodingInputValue(
                      encoding,
                      activeWidget.encodings?.[encoding.id]
                    )}
                    onChange={(event) =>
                      handleEncodingChange(
                        activeWidget.id,
                        encoding.id,
                        getEncodingInputNextValue(encoding, event.target.value)
                      )
                    }
                  />
                  {encoding.help ? (
                    <span className="lazy-input__help">{encoding.help}</span>
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
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default DashboardEditor;
