import { useEffect, useMemo, useState } from 'react';
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
    });
    if (updated?.updatedAt) {
      setLastSavedAt(updated.updatedAt);
    }
  };

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
