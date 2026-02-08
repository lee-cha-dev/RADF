import { useEffect, useMemo, useState } from 'react';
import { METRIC_OPERATORS } from '../../data/semanticLayer.js';
import { sanitizeFieldId } from '../../data/datasetImport.js';

const SemanticLayerPanel = ({
  datasetBinding,
  datasetColumns,
  semanticLayer,
  dimensionSuggestions,
  metricGroups,
  onModeChange,
  onReset,
  onDimensionToggle,
  onDimensionLabelChange,
  onMetricToggle,
  onMetricLabelChange,
  onMetricCreate,
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dimensions');
  const [searchText, setSearchText] = useState('');
  const [metricDraft, setMetricDraft] = useState({
    fieldId: '',
    opKey: 'avg',
    label: '',
    id: '',
  });
  const [metricTouched, setMetricTouched] = useState({
    label: false,
    id: false,
  });
  const [metricError, setMetricError] = useState('');

  const suggestedMetricMap = useMemo(() => {
    const entries = metricGroups.flatMap((group) =>
      group.metrics.map((metric) => [metric.id, metric])
    );
    return new Map(entries);
  }, [metricGroups]);
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
  const totalSuggestedMetrics = useMemo(
    () =>
      metricGroups.reduce(
        (total, group) => total + group.metrics.length,
        0
      ),
    [metricGroups]
  );
  const normalizedSearch = searchText.trim().toLowerCase();
  const hasSearch = normalizedSearch.length > 0;
  const filteredDimensions = useMemo(() => {
    if (!hasSearch) {
      return dimensionSuggestions;
    }
    return dimensionSuggestions.filter((dimension) => {
      const label = dimension.label?.toLowerCase() || '';
      const id = dimension.id?.toLowerCase() || '';
      return label.includes(normalizedSearch) || id.includes(normalizedSearch);
    });
  }, [dimensionSuggestions, hasSearch, normalizedSearch]);
  const filteredMetricGroups = useMemo(() => {
    if (!hasSearch) {
      return metricGroups;
    }
    return metricGroups
      .map((group) => {
        const groupLabel = group.fieldLabel?.toLowerCase() || '';
        const includeGroup = groupLabel.includes(normalizedSearch);
        const metrics = includeGroup
          ? group.metrics
          : group.metrics.filter((metric) => {
              const label = metric.label?.toLowerCase() || '';
              const opLabel = metric.opLabel?.toLowerCase() || '';
              const id = metric.id?.toLowerCase() || '';
              return (
                label.includes(normalizedSearch) ||
                opLabel.includes(normalizedSearch) ||
                id.includes(normalizedSearch)
              );
            });
        return { ...group, metrics };
      })
      .filter((group) => group.metrics.length > 0);
  }, [hasSearch, metricGroups, normalizedSearch]);
  const customMetrics = useMemo(
    () =>
      (semanticLayer.metrics || []).filter(
        (metric) => !suggestedMetricMap.has(metric.id)
      ),
    [semanticLayer.metrics, suggestedMetricMap]
  );
  const metricFieldOptions = useMemo(
    () =>
      metricGroups.map((group) => ({
        id: group.fieldId,
        label: group.fieldLabel,
      })),
    [metricGroups]
  );

  useEffect(() => {
    if (!isManagerOpen || metricFieldOptions.length === 0) {
      return;
    }
    setMetricDraft((current) => {
      if (current.fieldId) {
        return current;
      }
      return {
        ...current,
        fieldId: metricFieldOptions[0].id,
      };
    });
    setMetricTouched({ label: false, id: false });
    setMetricError('');
  }, [isManagerOpen, metricFieldOptions]);

  useEffect(() => {
    if (!isManagerOpen || metricFieldOptions.length === 0) {
      return;
    }
    const operator = METRIC_OPERATORS.find(
      (item) => item.key === metricDraft.opKey
    );
    const field = metricFieldOptions.find(
      (item) => item.id === metricDraft.fieldId
    );
    if (!operator || !field) {
      return;
    }
    const defaultLabel = `${operator.label} ${field.label}`;
    const defaultId = `${operator.key}_${field.id}`;
    setMetricDraft((current) => ({
      ...current,
      label: metricTouched.label ? current.label : defaultLabel,
      id: metricTouched.id ? current.id : defaultId,
    }));
  }, [
    isManagerOpen,
    metricDraft.fieldId,
    metricDraft.opKey,
    metricFieldOptions,
    metricTouched,
  ]);

  const handleMetricDraftChange = (field, value) => {
    setMetricDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleMetricLabelChange = (value) => {
    setMetricTouched((current) => ({ ...current, label: true }));
    setMetricDraft((current) => ({
      ...current,
      label: value,
      id: metricTouched.id
        ? current.id
        : sanitizeFieldId(value, 0, new Set()).id,
    }));
  };

  const handleMetricIdChange = (value) => {
    setMetricTouched((current) => ({ ...current, id: true }));
    setMetricDraft((current) => ({
      ...current,
      id: value,
    }));
  };

  const handleCreateMetric = () => {
    const operator = METRIC_OPERATORS.find(
      (item) => item.key === metricDraft.opKey
    );
    const field = datasetColumns.find(
      (column) => column.id === metricDraft.fieldId
    );
    if (!operator || !field) {
      setMetricError('Select a numeric field and aggregation.');
      return;
    }
    const label = metricDraft.label.trim() ||
      `${operator.label} ${field.label || field.id}`;
    const used = new Set((semanticLayer.metrics || []).map((item) => item.id));
    const fallbackId = metricDraft.id.trim() ||
      `${operator.key}_${field.id}`;
    const { id } = sanitizeFieldId(fallbackId, 0, used);
    onMetricCreate?.({
      id,
      label,
      format: operator.format,
      opKey: operator.key,
      opLabel: operator.label,
      query: { op: operator.op, field: field.id },
      sourceField: field.id,
    });
    setMetricError('');
    setMetricTouched({ label: false, id: false });
    setMetricDraft((current) => ({
      ...current,
      label: '',
      id: '',
    }));
  };

  return (
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
            onClick={() => onModeChange(false)}
          >
            Simple
          </button>
          <button
            className={`lazy-toggle__button ${
              semanticLayer.enabled ? 'active' : ''
            }`}
            type="button"
            onClick={() => onModeChange(true)}
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
              onClick={onReset}
              disabled={datasetColumns.length === 0}
            >
              Generate defaults
            </button>
          </div>
          {semanticLayer.enabled ? (
            <div className="lazy-semantic__summary">
              <div className="lazy-semantic__summary-main">
                <div>
                  <p className="lazy-dataset__label">Dimensions</p>
                  <p className="lazy-semantic__summary-count">
                    {semanticLayer.dimensions.length} selected
                    {dimensionSuggestions.length
                      ? ` · ${dimensionSuggestions.length} available`
                      : ''}
                  </p>
                </div>
                <div>
                  <p className="lazy-dataset__label">Metrics</p>
                  <p className="lazy-semantic__summary-count">
                    {semanticLayer.metrics.length} selected
                    {totalSuggestedMetrics
                      ? ` · ${totalSuggestedMetrics} suggested`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="lazy-semantic__summary-actions">
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={() => setIsManagerOpen(true)}
                >
                  Manage semantic layer
                </button>
              </div>
              <div className="lazy-semantic__summary-pills">
                {[...semanticLayer.dimensions, ...semanticLayer.metrics]
                  .slice(0, 6)
                  .map((item) => (
                    <span key={item.id} className="lazy-pill">
                      {item.label}
                    </span>
                  ))}
                {[...semanticLayer.dimensions, ...semanticLayer.metrics].length >
                6 ? (
                  <span className="lazy-pill">More...</span>
                ) : null}
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
      {isManagerOpen ? (
        <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
          <div className="lazy-modal lazy-modal--wide lazy-modal--manager">
            <div className="lazy-modal__header">
              <div>
                <p className="lazy-modal__eyebrow">Semantic layer</p>
                <h2 className="lazy-modal__title">
                  Manage metrics and dimensions
                </h2>
              </div>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => setIsManagerOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="lazy-modal__body">
              <div className="lazy-semantic-modal__controls">
                <div className="lazy-toggle">
                  <button
                    className={`lazy-toggle__button${
                      activeTab === 'dimensions' ? ' active' : ''
                    }`}
                    type="button"
                    onClick={() => setActiveTab('dimensions')}
                  >
                    Dimensions
                  </button>
                  <button
                    className={`lazy-toggle__button${
                      activeTab === 'metrics' ? ' active' : ''
                    }`}
                    type="button"
                    onClick={() => setActiveTab('metrics')}
                  >
                    Metrics
                  </button>
                </div>
                <label className="lazy-input">
                  <span className="lazy-input__label">Search</span>
                  <input
                    className="lazy-input__field"
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Filter by name or id"
                  />
                </label>
              </div>

              {activeTab === 'dimensions' ? (
                <div className="lazy-semantic__section">
                  <p className="lazy-panel__body">Dimensions</p>
                    <div className="lazy-semantic__list lazy-semantic__list--scroll">
                      {filteredDimensions.length === 0 ? (
                        <p className="lazy-panel__body">
                          No dimension fields detected.
                        </p>
                      ) : (
                        filteredDimensions.map((dimension) => {
                          const active = dimensionMap.has(dimension.id);
                          const current = dimensionMap.get(dimension.id);
                          return (
                            <details
                              key={dimension.id}
                              className="lazy-collapse"
                            >
                              <summary className="lazy-collapse__summary">
                                <span>{dimension.label}</span>
                                <span className="lazy-pill">
                                  {dimension.type}
                                </span>
                              </summary>
                              <div className="lazy-collapse__content">
                                <div className="lazy-semantic__item">
                                  <label className="lazy-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={active}
                                      onChange={(event) =>
                                        onDimensionToggle(
                                          dimension,
                                          event.target.checked
                                        )
                                      }
                                    />
                                    <span>Include dimension</span>
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
                                        onDimensionLabelChange(
                                          dimension.id,
                                          event.target.value
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              </div>
                            </details>
                          );
                        })
                      )}
                    </div>
                </div>
              ) : (
                <div className="lazy-semantic__section">
                  <p className="lazy-panel__body">Metrics</p>
                    <div className="lazy-semantic__list lazy-semantic__list--scroll">
                      {filteredMetricGroups.length === 0 ? (
                        <p className="lazy-panel__body">
                          No numeric fields detected.
                        </p>
                      ) : (
                        filteredMetricGroups.map((group) => {
                          const activeCount = group.metrics.filter((metric) =>
                            metricMap.has(metric.id)
                          ).length;
                          return (
                            <details
                              key={group.fieldId}
                              className="lazy-collapse"
                            >
                              <summary className="lazy-collapse__summary">
                                <span>{group.fieldLabel}</span>
                                <span className="lazy-pill">
                                  {activeCount} selected
                                </span>
                              </summary>
                              <div className="lazy-collapse__content">
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
                                              onMetricToggle(
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
                                            value={
                                              current?.label || metric.label
                                            }
                                            disabled={!active}
                                            onChange={(event) =>
                                              onMetricLabelChange(
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
                            </details>
                          );
                        })
                      )}
                      {customMetrics.length > 0 ? (
                      <div className="lazy-metric-group">
                        <p className="lazy-metric-group__title">Custom</p>
                        <div className="lazy-metric-group__list">
                          {customMetrics.map((metric) => (
                            <div
                              key={metric.id}
                              className="lazy-semantic__item"
                            >
                              <label className="lazy-checkbox">
                                <input
                                  type="checkbox"
                                  checked
                                  onChange={(event) =>
                                    onMetricToggle(
                                      metric,
                                      event.target.checked
                                    )
                                  }
                                />
                                <span>{metric.opLabel || 'Custom'}</span>
                              </label>
                              <label className="lazy-input">
                                <span className="lazy-input__label">Label</span>
                                <input
                                  className="lazy-input__field"
                                  type="text"
                                  value={metric.label}
                                  onChange={(event) =>
                                    onMetricLabelChange(
                                      metric.id,
                                      event.target.value
                                    )
                                  }
                                />
                              </label>
                              <span className="lazy-pill">{metric.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="lazy-semantic-modal__builder">
                    <div className="lazy-semantic-modal__builder-header">
                      <p className="lazy-panel__body">
                        Create a custom metric
                      </p>
                      <span className="lazy-input__help">
                        Use dataset columns to define new aggregations.
                      </span>
                    </div>
                    <div className="lazy-semantic-modal__builder-grid">
                      <label className="lazy-input">
                        <span className="lazy-input__label">Field</span>
                        <select
                          className="lazy-input__field"
                          value={metricDraft.fieldId}
                          onChange={(event) =>
                            handleMetricDraftChange(
                              'fieldId',
                              event.target.value
                            )
                          }
                        >
                          {metricFieldOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="lazy-input">
                        <span className="lazy-input__label">Aggregation</span>
                        <select
                          className="lazy-input__field"
                          value={metricDraft.opKey}
                          onChange={(event) =>
                            handleMetricDraftChange(
                              'opKey',
                              event.target.value
                            )
                          }
                        >
                          {METRIC_OPERATORS.map((operator) => (
                            <option key={operator.key} value={operator.key}>
                              {operator.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="lazy-input">
                        <span className="lazy-input__label">Metric label</span>
                        <input
                          className="lazy-input__field"
                          type="text"
                          value={metricDraft.label}
                          onChange={(event) =>
                            handleMetricLabelChange(event.target.value)
                          }
                          placeholder="Avg Column Name"
                        />
                      </label>
                      <label className="lazy-input">
                        <span className="lazy-input__label">Metric id</span>
                        <input
                          className="lazy-input__field"
                          type="text"
                          value={metricDraft.id}
                          onChange={(event) =>
                            handleMetricIdChange(event.target.value)
                          }
                          placeholder="avg_column_name"
                        />
                      </label>
                    </div>
                    {metricError ? (
                      <div className="lazy-alert danger">{metricError}</div>
                    ) : null}
                    <div className="lazy-semantic-modal__builder-actions">
                      <button
                        className="lazy-button"
                        type="button"
                        onClick={handleCreateMetric}
                        disabled={metricFieldOptions.length === 0}
                      >
                        Add metric
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lazy-modal__footer">
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => setIsManagerOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default SemanticLayerPanel;
