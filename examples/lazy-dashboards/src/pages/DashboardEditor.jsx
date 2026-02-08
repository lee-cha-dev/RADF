import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardProvider, ErrorBoundary, MockDataProvider } from 'radf';
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
import { resolveEditorControl } from '../authoring/editorFieldCatalog.js';
import {
  flattenOptionPaths,
  getNestedValue,
  isPlainObject,
  setNestedValue,
} from '../authoring/optionUtils.js';
import { validateManifestCoverage } from '../authoring/manifestValidation.js';
import DatasetImporter from '../components/DatasetImporter.jsx';
import LivePreviewPanel from '../components/LivePreviewPanel.jsx';
import { createLocalDataProvider } from '../data/localDataProvider.js';
import { createExternalApiDataProvider } from '../data/externalApiProvider.js';
import {
  buildDefaultSemanticLayer,
  buildDimensionSuggestions,
  buildMetricSuggestions,
} from '../data/semanticLayer.js';
import {
  buildDashboardExport,
  downloadDashboardZip,
} from '../data/dashboardExport.js';
import {
  applyTemplateBindings,
  buildTemplateAuthoringModel,
  getDashboardTemplate,
  getTemplatePreview,
  listDashboardTemplates,
} from '../data/dashboardTemplates.js';
import {
  getSyncEnabled,
  isFileSystemAccessSupported,
  loadCustomDashboardsDirectory,
  requestCustomDashboardsDirectory,
  setSyncEnabled,
  writeDashboardExportToDirectory,
} from '../data/fileSystemSync.js';
import { trackTelemetryEvent } from '../data/telemetry.js';

const DashboardEditor = () => {
  const { dashboardId } = useParams();
  const { dashboards, updateDashboard } = useDashboardRegistry();
  const dashboard = useMemo(
    () => dashboards.find((item) => item.id === dashboardId) || null,
    [dashboards, dashboardId]
  );
  const gridRef = useRef(null);
  const interactionRef = useRef(null);
  const lastSavedModelRef = useRef('');
  const unsupportedOptionLogRef = useRef(new Set());
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
  const [showExpertOptions, setShowExpertOptions] = useState(false);
  const [rawOptionsText, setRawOptionsText] = useState('');
  const [rawOptionsError, setRawOptionsError] = useState('');
  const [showCompiledConfig, setShowCompiledConfig] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [selectedVizType, setSelectedVizType] = useState('kpi');
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateMode, setTemplateMode] = useState('replace');
  const [includeTemplateFilterBar, setIncludeTemplateFilterBar] =
    useState(false);
  const [pendingRemoveWidgetId, setPendingRemoveWidgetId] = useState(null);
  const [syncEnabled, setSyncEnabledState] = useState(() => getSyncEnabled());
  const [syncHandle, setSyncHandle] = useState(null);
  const [syncStatus, setSyncStatus] = useState({
    state: 'idle',
    error: '',
    lastSyncedAt: null,
  });
  const GRID_COLUMNS = 12;
  const GRID_ROWS = 24;
  const GRID_GAP = 12;
  const GRID_ROW_HEIGHT = 48;
  const syncSupported = useMemo(() => isFileSystemAccessSupported(), []);

  useEffect(() => {
    if (!syncSupported) {
      return;
    }
    let mounted = true;
    loadCustomDashboardsDirectory().then((handle) => {
      if (!mounted) {
        return;
      }
      setSyncHandle(handle);
      if (!handle && syncEnabled) {
        setSyncEnabledState(false);
        setSyncEnabled(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [syncSupported, syncEnabled]);

  useEffect(() => {
    setSyncEnabled(syncEnabled);
  }, [syncEnabled]);

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
    lastSavedModelRef.current = JSON.stringify(normalized);
    if (!activeWidgetId && normalized.widgets.length > 0) {
      setActiveWidgetId(normalized.widgets[0].id);
    }
  }, [dashboard, activeWidgetId]);

  useEffect(() => {
    setShowAdvancedOptions(false);
    setShowExpertOptions(false);
    setRawOptionsError('');
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

  const formattedSyncedAt = useMemo(() => {
    if (!syncStatus.lastSyncedAt) {
      return 'Not synced yet';
    }
    const date = new Date(syncStatus.lastSyncedAt);
    if (Number.isNaN(date.getTime())) {
      return 'Not synced yet';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [syncStatus.lastSyncedAt]);

  const buildPersistedDatasetBinding = useCallback((binding) => {
    if (!binding) {
      return null;
    }
    const { rows, preview, ...rest } = binding;
    return {
      ...rest,
      rows: [],
      preview: [],
    };
  }, []);

  const buildPersistedAuthoringModel = useCallback(
    (model) => {
      if (!model) {
        return model;
      }
      return {
        ...model,
        datasetBinding: buildPersistedDatasetBinding(model.datasetBinding),
      };
    },
    [buildPersistedDatasetBinding]
  );

  const syncStatusLabel = useMemo(() => {
    if (!syncEnabled) {
      return 'Off';
    }
    if (!syncHandle) {
      return 'Choose a sync folder to start syncing.';
    }
    if (syncStatus.state === 'syncing') {
      return 'Syncing to CustomDashboards...';
    }
    if (syncStatus.state === 'error') {
      return `Error: ${syncStatus.error || 'Unknown issue.'}`;
    }
    return `Synced ${formattedSyncedAt}`;
  }, [
    formattedSyncedAt,
    syncEnabled,
    syncHandle,
    syncStatus.error,
    syncStatus.state,
  ]);

  const validation = useMemo(
    () => validateAuthoringModel(authoringModel),
    [authoringModel]
  );

  const compiledImmediate = useMemo(
    () => compileAuthoringModel({ dashboard, authoringModel }),
    [dashboard, authoringModel]
  );
  const [compiledPreview, setCompiledPreview] = useState(() => compiledImmediate);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCompiledPreview(compiledImmediate);
    }, 250);
    return () => clearTimeout(timeout);
  }, [compiledImmediate]);

  const vizManifests = useMemo(() => listVizManifests(), []);
  const dashboardTemplates = useMemo(() => listDashboardTemplates(), []);
  const selectedTemplate = useMemo(
    () => getDashboardTemplate(selectedTemplateId),
    [selectedTemplateId]
  );
  const manifestCoverage = useMemo(() => validateManifestCoverage(), []);
  const datasetBinding = authoringModel.datasetBinding || null;
  const datasetColumns = datasetBinding?.columns || [];
  const semanticLayer = authoringModel.semanticLayer || {
    enabled: false,
    metrics: [],
    dimensions: [],
  };
  const compiledPanelMap = useMemo(
    () =>
      new Map(
        (compiledPreview.config?.panels || []).map((panel) => [
          panel.id,
          panel,
        ])
      ),
    [compiledPreview]
  );
  const previewProvider = useMemo(() => {
    if (
      datasetBinding?.source?.type === 'api' &&
      datasetBinding.source?.baseUrl
    ) {
      return createExternalApiDataProvider(datasetBinding.source);
    }
    if (datasetBinding?.rows?.length) {
      return createLocalDataProvider({
        rows: datasetBinding.rows,
        columns: datasetBinding.columns || [],
        semanticLayer: semanticLayer.enabled ? semanticLayer : null,
      });
    }
    return MockDataProvider;
  }, [datasetBinding, semanticLayer]);

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

  const getOptionPath = (schema, optionKey) =>
    schema?.path || optionKey;

  const getOptionValue = (schema, optionKey, options) =>
    getNestedValue(options, getOptionPath(schema, optionKey));

  const buildOptionPatch = (schema, optionKey, value) =>
    setNestedValue({}, getOptionPath(schema, optionKey), value);

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

  const handleSave = () => {
    const persistedModel = buildPersistedAuthoringModel(authoringModel);
    const persistedBinding = buildPersistedDatasetBinding(
      authoringModel.datasetBinding
    );
    const updated = updateDashboard(dashboardId, {
      authoringModel: persistedModel,
      compiledConfig: compiledImmediate.config,
      datasetBinding: persistedBinding,
    });
    if (updated?.updatedAt) {
      setLastSavedAt(updated.updatedAt);
    }
    lastSavedModelRef.current = JSON.stringify(authoringModel);
  };

  const handleExport = async () => {
    if (!dashboard) {
      return;
    }
    try {
      const exportPlan = buildDashboardExport({
        dashboard,
        authoringModel,
        compiled: compiledImmediate,
      });
      if (!exportPlan) {
        trackTelemetryEvent('export_failure', {
          reason: 'build_failed',
          dashboardId: dashboard.id,
          dashboardName: dashboard.name,
        });
        window.alert('Export failed to build.');
        return;
      }
      const downloaded = await downloadDashboardZip(exportPlan);
      if (!downloaded) {
        trackTelemetryEvent('export_failure', {
          reason: 'download_failed',
          dashboardId: dashboard.id,
          dashboardName: dashboard.name,
        });
        window.alert('Export failed to download.');
      }
    } catch (error) {
      trackTelemetryEvent('export_failure', {
        reason: error?.message || 'unknown_error',
        dashboardId: dashboard.id,
        dashboardName: dashboard.name,
      });
      window.alert('Export failed.');
    }
  };

  const handleEnableSync = async () => {
    if (!syncSupported) {
      return;
    }
    try {
      const handle = await requestCustomDashboardsDirectory();
      if (!handle) {
        return;
      }
      setSyncHandle(handle);
      setSyncEnabledState(true);
      setSyncStatus((current) => ({
        ...current,
        state: 'idle',
        error: '',
      }));
    } catch (error) {
      setSyncStatus((current) => ({
        ...current,
        state: 'error',
        error: error?.message || 'Unable to access the selected folder.',
      }));
    }
  };

  const handleDisableSync = () => {
    setSyncEnabledState(false);
    setSyncStatus((current) => ({
      ...current,
      state: 'idle',
      error: '',
    }));
  };

  const handleDatasetUpdate = useCallback((nextDataset) => {
    setAuthoringModel((current) => ({
      ...current,
      datasetBinding: nextDataset || null,
    }));
  }, []);

  const handleAddWidget = () => {
    const vizType = selectedVizType || vizManifests[0]?.id || 'kpi';
    setAuthoringModel((current) => {
      const widget = createWidgetDraft(current, { vizType });
      const next = addWidgetToModel(current, widget);
      setActiveWidgetId(widget.id);
      return next;
    });
    setIsAddWidgetOpen(false);
  };

  const handleRemoveWidget = (widgetId) => {
    setAuthoringModel((current) => {
      const next = removeWidgetFromModel(current, widgetId);
      if (activeWidgetId === widgetId) {
        setActiveWidgetId(next.widgets[0]?.id || null);
      }
      return next;
    });
    setPendingRemoveWidgetId(null);
  };

  const getMaxRow = (widgets) =>
    (widgets || []).reduce((max, widget) => {
      const layout = widget.layout || { y: 1, h: 1 };
      return Math.max(max, layout.y + layout.h - 1);
    }, 0);

  const buildUniqueWidgetId = (base, used) => {
    let nextId = base || 'widget';
    while (used.has(nextId)) {
      nextId = `${base || 'widget'}-${Math.random().toString(36).slice(2, 6)}`;
    }
    used.add(nextId);
    return nextId;
  };

  const applyTemplateToModel = (templateId) => {
    const template = getDashboardTemplate(templateId);
    if (!template) {
      return;
    }
    const includeFilterBar =
      includeTemplateFilterBar && template.supportsFilterBar;
    const templateModel = buildTemplateAuthoringModel(templateId, {
      includeFilterBar,
    });
    if (!templateModel) {
      return;
    }
    const boundTemplate = applyTemplateBindings(
      templateModel,
      datasetColumns
    );

    setAuthoringModel((current) => {
      if (templateMode === 'replace') {
        const nextModel = normalizeAuthoringModel(
          {
            ...boundTemplate,
            datasetBinding: current.datasetBinding,
            semanticLayer: current.semanticLayer,
            meta: {
              ...boundTemplate.meta,
              title: current.meta?.title || dashboard?.name || boundTemplate.meta?.title,
              description:
                current.meta?.description || boundTemplate.meta?.description,
            },
          },
          { title: dashboard?.name }
        );
        setActiveWidgetId(nextModel.widgets[0]?.id || null);
        return nextModel;
      }

      const usedIds = new Set((current.widgets || []).map((widget) => widget.id));
      const offsetY = getMaxRow(current.widgets) + 1;
      const idMap = new Map();
      const appendedWidgets = (boundTemplate.widgets || []).map((widget) => {
        const nextId = buildUniqueWidgetId(widget.id, usedIds);
        idMap.set(widget.id, nextId);
        return {
          ...widget,
          id: nextId,
          layout: {
            ...widget.layout,
            y: (widget.layout?.y || 1) + offsetY,
          },
        };
      });
      const appendedLayout = appendedWidgets.map((widget) => ({
        id: widget.id,
        ...widget.layout,
      }));
      const nextModel = normalizeAuthoringModel({
        ...current,
        widgets: [...(current.widgets || []), ...appendedWidgets],
        layout: [...(current.layout || []), ...appendedLayout],
      });
      setActiveWidgetId(
        appendedWidgets[0]?.id || current.widgets?.[0]?.id || null
      );
      return nextModel;
    });
    setIsTemplateOpen(false);
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

  const handleOptionChange = (widgetId, optionKey, schema, value) => {
    const patch = buildOptionPatch(schema, optionKey, value);
    setAuthoringModel((current) =>
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
        setRawOptionsText(JSON.stringify(activeWidget.options || {}, null, 2));
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
      setAuthoringModel((current) =>
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
  useEffect(() => {
    if (!activeWidget || showExpertOptions) {
      return;
    }
    setRawOptionsText(JSON.stringify(activeWidget.options || {}, null, 2));
    setRawOptionsError('');
  }, [activeWidget, showExpertOptions]);
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
  }, [activeWidget, unsupportedOptionPaths, trackTelemetryEvent]);
  const compiledActivePanel = activeWidget
    ? compiledPanelMap.get(activeWidget.id)
    : null;
  const compiledPanelJson = useMemo(
    () => (compiledActivePanel ? JSON.stringify(compiledActivePanel, null, 2) : ''),
    [compiledActivePanel]
  );

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
          {helpText ? <span className="lazy-input__help">{helpText}</span> : null}
        </label>
      );
    }
    if (control === 'select') {
      return (
        <label key={optionKey} className="lazy-form__field">
          <span className="lazy-input__label">{label}</span>
          <select
            id={fieldId}
            className="lazy-input__field"
            value={optionValue ?? schema.default ?? ''}
            onChange={(event) =>
              handleOptionChange(
                activeWidget.id,
                optionKey,
                schema,
                event.target.value
              )
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
              const parsed =
                rawValue === '' ? null : Number(rawValue);
              handleOptionChange(activeWidget.id, optionKey, schema, Number.isNaN(parsed) ? null : parsed);
            }}
          />
          {helpText ? <span className="lazy-input__help">{helpText}</span> : null}
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
          {helpText ? <span className="lazy-input__help">{helpText}</span> : null}
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
  useEffect(() => {
    if (!selectedTemplateId && dashboardTemplates.length > 0) {
      setSelectedTemplateId(dashboardTemplates[0].id);
    }
  }, [dashboardTemplates, selectedTemplateId]);
  useEffect(() => {
    if (selectedTemplate && !selectedTemplate.supportsFilterBar) {
      setIncludeTemplateFilterBar(false);
    }
  }, [selectedTemplate]);

  const openTemplateModal = (templateId) => {
    if (templateId) {
      setSelectedTemplateId(templateId);
    }
    setIsTemplateOpen(true);
  };
  const closeTemplateModal = () => {
    setIsTemplateOpen(false);
  };
  const openAddWidgetModal = () => {
    setSelectedVizType(vizManifests[0]?.id || 'kpi');
    setIsAddWidgetOpen(true);
  };
  const closeAddWidgetModal = () => {
    setIsAddWidgetOpen(false);
  };
  const handleRequestRemoveWidget = (widgetId) => {
    setPendingRemoveWidgetId(widgetId);
  };
  const pendingRemoveWidget = pendingRemoveWidgetId
    ? authoringModel.widgets.find(
        (widget) => widget.id === pendingRemoveWidgetId
      )
    : null;
  const getVizPrereqs = (manifest) => {
    const prereqs = [];
    if (!datasetBinding) {
      prereqs.push('Dataset binding required');
    }
    const required =
      manifest?.encodings?.required?.map(
        (encoding) => encoding.label || encoding.id
      ) || [];
    if (required.length > 0) {
      prereqs.push(`Required encodings: ${required.join(', ')}`);
    } else {
      prereqs.push('No required encodings');
    }
    return prereqs;
  };
  const gridClasses = (layout) => {
    const safeLayout = layout || { x: 1, y: 1, w: 4, h: 2 };
    const width = Math.min(Math.max(safeLayout.w, 1), GRID_COLUMNS);
    const height = Math.min(Math.max(safeLayout.h, 1), GRID_ROWS);
    const maxX = GRID_COLUMNS - width + 1;
    const maxY = GRID_ROWS - height + 1;
    const x = Math.min(Math.max(safeLayout.x, 1), Math.max(maxX, 1));
    const y = Math.min(Math.max(safeLayout.y, 1), Math.max(maxY, 1));
    return `lazy-grid-x-${x} lazy-grid-y-${y} lazy-grid-w-${width} lazy-grid-h-${height}`;
  };
  const overlaps = (a, b) =>
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;
  const resolveCollision = (widgetId, nextLayout, widgets) => {
    let candidate = { ...nextLayout };
    let guard = 0;
    while (
      widgets.some(
        (widget) =>
          widget.id !== widgetId &&
          widget.layout &&
          overlaps(candidate, widget.layout)
      )
    ) {
      candidate.y += 1;
      if (candidate.y > GRID_ROWS) {
        break;
      }
      guard += 1;
      if (guard > GRID_ROWS) {
        break;
      }
    }
    return candidate;
  };
  const getGridMetrics = () => {
    const grid = gridRef.current;
    if (!grid) {
      return null;
    }
    const rect = grid.getBoundingClientRect();
    const styles = window.getComputedStyle(grid);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const innerWidth = rect.width - paddingLeft - paddingRight;
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    const colWidth =
      GRID_COLUMNS > 0 ? (innerWidth - totalGap) / GRID_COLUMNS : 0;
    return {
      rect,
      colWidth,
      rowStep: GRID_ROW_HEIGHT + GRID_GAP,
    };
  };
  const getDeltaFromPointer = (origin, event) => {
    const metrics = getGridMetrics();
    if (!metrics) {
      return { dx: 0, dy: 0 };
    }
    const { colWidth, rowStep } = metrics;
    const colStep = colWidth + GRID_GAP;
    return {
      dx: Math.round((event.clientX - origin.x) / colStep),
      dy: Math.round((event.clientY - origin.y) / rowStep),
    };
  };
  const updateLayoutForInteraction = useCallback((event) => {
    const interaction = interactionRef.current;
    if (!interaction) {
      return;
    }
    const { widgetId, origin, startLayout, type } = interaction;
    const { dx, dy } = getDeltaFromPointer(origin, event);
    setAuthoringModel((current) => {
      const target = current.widgets.find((widget) => widget.id === widgetId);
      if (!target) {
        return current;
      }
      let nextLayout = { ...startLayout };
      if (type === 'move') {
        const maxX = GRID_COLUMNS - startLayout.w + 1;
        const maxY = GRID_ROWS - startLayout.h + 1;
        nextLayout = {
          ...startLayout,
          x: Math.min(Math.max(startLayout.x + dx, 1), Math.max(maxX, 1)),
          y: Math.min(Math.max(startLayout.y + dy, 1), Math.max(maxY, 1)),
        };
      }
      if (type === 'resize') {
        const maxW = GRID_COLUMNS - startLayout.x + 1;
        const maxH = GRID_ROWS - startLayout.y + 1;
        nextLayout = {
          ...startLayout,
          w: Math.min(Math.max(startLayout.w + dx, 1), Math.max(maxW, 1)),
          h: Math.min(Math.max(startLayout.h + dy, 1), Math.max(maxH, 1)),
        };
      }
      nextLayout = resolveCollision(widgetId, nextLayout, current.widgets);
      return updateWidgetInModel(current, widgetId, {
        layout: nextLayout,
        draft: false,
      });
    });
  }, []);
  const handlePointerMove = useCallback(
    (event) => {
      if (!interactionRef.current) {
        return;
      }
      updateLayoutForInteraction(event);
    },
    [updateLayoutForInteraction]
  );
  const handlePointerUp = useCallback(() => {
    if (!interactionRef.current) {
      return;
    }
    interactionRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    document.body.classList.remove('lazy-dragging');
  }, [handlePointerMove]);
  const beginInteraction = (event, widget, type) => {
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      widgetId: widget.id,
      origin: { x: event.clientX, y: event.clientY },
      startLayout: widget.layout,
      type,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    document.body.classList.add('lazy-dragging');
  };

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.classList.remove('lazy-dragging');
    },
    [handlePointerMove, handlePointerUp]
  );

  useEffect(() => {
    if (!dashboard) {
      return undefined;
    }
    const serialized = JSON.stringify(authoringModel);
    if (serialized === lastSavedModelRef.current) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      const persistedModel = buildPersistedAuthoringModel(authoringModel);
      const persistedBinding = buildPersistedDatasetBinding(
        authoringModel.datasetBinding
      );
      const updated = updateDashboard(dashboardId, {
        authoringModel: persistedModel,
        compiledConfig: compiledImmediate.config,
        datasetBinding: persistedBinding,
      });
      if (updated?.updatedAt) {
        setLastSavedAt(updated.updatedAt);
      }
      lastSavedModelRef.current = serialized;
    }, 900);
    return () => clearTimeout(timeout);
  }, [
    authoringModel,
    buildPersistedAuthoringModel,
    buildPersistedDatasetBinding,
    compiledImmediate.config,
    dashboard,
    dashboardId,
    updateDashboard,
  ]);

  useEffect(() => {
    if (!dashboard || !syncEnabled || !syncHandle) {
      return undefined;
    }
    const exportPlan = buildDashboardExport({
      dashboard,
      authoringModel,
      compiled: compiledImmediate,
    });
    if (!exportPlan) {
      return undefined;
    }
    let active = true;
    const timeout = setTimeout(async () => {
      try {
        setSyncStatus((current) => ({
          ...current,
          state: 'syncing',
          error: '',
        }));
        await writeDashboardExportToDirectory(exportPlan, syncHandle);
        if (!active) {
          return;
        }
        setSyncStatus((current) => ({
          ...current,
          state: 'synced',
          error: '',
          lastSyncedAt: new Date().toISOString(),
        }));
      } catch (error) {
        if (!active) {
          return;
        }
        setSyncStatus((current) => ({
          ...current,
          state: 'error',
          error: error?.message || 'Sync failed.',
        }));
      }
    }, 700);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [
    authoringModel,
    compiledImmediate,
    dashboard,
    syncEnabled,
    syncHandle,
  ]);

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
            {syncSupported ? (
              <p className="lazy-editor__subtitle">Disk sync: {syncStatusLabel}</p>
            ) : null}
          </div>
          <div className="lazy-editor__actions">
            <button className="lazy-button" type="button" onClick={handleSave}>
              Save Draft
            </button>
            <button
              className="lazy-button ghost"
              type="button"
              onClick={() => openTemplateModal()}
            >
              Templates
            </button>
            <button className="lazy-button ghost" type="button" onClick={handleExport}>
              Export
            </button>
            {syncSupported ? (
              syncEnabled ? (
                <>
                  <button
                    className="lazy-button ghost"
                    type="button"
                    onClick={handleEnableSync}
                  >
                    Change Sync Folder
                  </button>
                  <button
                    className="lazy-button ghost"
                    type="button"
                    onClick={handleDisableSync}
                  >
                    Disable Sync
                  </button>
                </>
              ) : (
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={handleEnableSync}
                >
                  Enable Disk Sync
                </button>
              )
            ) : null}
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
                <div className="lazy-template-empty">
                  <p className="lazy-panel__body">
                    Start with a template or add widgets one by one.
                  </p>
                  <div className="lazy-template-empty__actions">
                    <button
                      className="lazy-button"
                      type="button"
                      onClick={() => openTemplateModal()}
                    >
                      Start from template
                    </button>
                    <button
                      className="lazy-button ghost"
                      type="button"
                      onClick={openAddWidgetModal}
                    >
                      Add widget
                    </button>
                  </div>
                </div>
              ) : (
                authoringModel.widgets.map((widget) => {
                  const status = validation.widgets[widget.id]?.status || 'draft';
                  const issues = validation.widgets[widget.id]?.errors?.length || 0;
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
                        <div className="lazy-widget-item__meta">
                          {issues > 0 ? (
                            <span className="lazy-widget-issues">
                              {issues} issues
                            </span>
                          ) : null}
                          <span className={`lazy-widget-status ${status}`}>
                            {status}
                          </span>
                        </div>
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
                            handleRequestRemoveWidget(widget.id);
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
            <button
              className="lazy-button ghost"
              type="button"
              onClick={openAddWidgetModal}
            >
              Add Widget
            </button>
          </section>
        </div>
        <section className="lazy-canvas">
          <div className="lazy-canvas__header">
            <h2 className="lazy-panel__title">Live Preview</h2>
            <button
              className="lazy-button ghost"
              type="button"
              onClick={openAddWidgetModal}
            >
              Add Widget
            </button>
          </div>
          <div className="lazy-canvas__stage">
            <DashboardProvider
              initialState={{
                dashboardId:
                  compiledPreview.config?.id || dashboard.id,
                datasetId:
                  compiledPreview.config?.datasetId ||
                  datasetBinding?.id ||
                  `${dashboard.id}_dataset`,
              }}
            >
              <ErrorBoundary
                title="Preview failed"
                message="Fix the configuration or reload the preview to try again."
              >
                <div className="lazy-canvas__grid" ref={gridRef}>
                  {authoringModel.widgets.length === 0 ? (
                    <p className="lazy-canvas__empty">
                      Panels render here once widgets are configured.
                    </p>
                  ) : (
                    authoringModel.widgets.map((widget) => {
                      const status =
                        validation.widgets[widget.id]?.status || 'draft';
                      const issues =
                        validation.widgets[widget.id]?.errors?.length || 0;
                      const previewPanel = compiledPanelMap.get(widget.id);
                      return (
                        <div
                          key={widget.id}
                          className={`lazy-canvas-item ${gridClasses(widget.layout)}${
                            widget.id === activeWidgetId ? ' active' : ''
                          }`}
                          onClick={() => setActiveWidgetId(widget.id)}
                        >
                          <div
                            className="lazy-canvas-item__header"
                            onPointerDown={(event) => {
                              setActiveWidgetId(widget.id);
                              beginInteraction(event, widget, 'move');
                            }}
                          >
                            <span className="lazy-canvas-item__title">
                              {widget.title}
                            </span>
                            <div className="lazy-canvas-item__meta">
                              {issues > 0 ? (
                                <span className="lazy-widget-issues">
                                  {issues} issues
                                </span>
                              ) : null}
                              <span className={`lazy-widget-status ${status}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                          <div className="lazy-canvas-item__preview">
                            <LivePreviewPanel
                              panel={previewPanel}
                              dataProvider={previewProvider}
                              datasetBinding={datasetBinding}
                              semanticLayer={semanticLayer}
                            />
                          </div>
                          <button
                            className="lazy-canvas-item__resize"
                            type="button"
                            aria-label="Resize widget"
                            onPointerDown={(event) => {
                              setActiveWidgetId(widget.id);
                              beginInteraction(event, widget, 'resize');
                            }}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </ErrorBoundary>
            </DashboardProvider>
          </div>
        </section>
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
                    Some options for this widget are only editable in Expert
                    mode.
                  </span>
                </div>
              ) : null}
              {activeVizManifest?.supportLevel === 'deferred' ? (
                <div className="lazy-alert danger">
                  <strong>Deferred widget.</strong>
                  <span>
                    This widget is not fully supported yet. Preview output may
                    be incomplete.
                  </span>
                </div>
              ) : null}
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
                  onClick={() =>
                    setShowCompiledConfig((current) => !current)
                  }
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
                      onChange={(event) =>
                        setRawOptionsText(event.target.value)
                      }
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
                  onClick={() => handleRequestRemoveWidget(activeWidget.id)}
                >
                  Remove widget
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      {isTemplateOpen ? (
        <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
          <div className="lazy-modal lazy-template-modal">
            <div className="lazy-modal__header">
              <div>
                <p className="lazy-modal__eyebrow">Starter templates</p>
                <h2 className="lazy-modal__title">Choose a layout</h2>
              </div>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={closeTemplateModal}
              >
                Close
              </button>
            </div>
            <div className="lazy-modal__body">
              <div className="lazy-template-modal__controls">
                <div>
                  <p className="lazy-panel__body">
                    Pick a template and decide whether to replace or append the
                    current layout.
                  </p>
                  {templateMode === 'replace' &&
                  authoringModel.widgets.length > 0 ? (
                    <div className="lazy-alert warning">
                      Replacing will remove existing widgets.
                    </div>
                  ) : null}
                  {!datasetBinding ? (
                    <div className="lazy-alert warning">
                      Import a dataset to auto-bind fields in the template.
                    </div>
                  ) : null}
                </div>
                <div className="lazy-template-modal__options">
                  <div className="lazy-input">
                    <span className="lazy-input__label">Apply mode</span>
                    <div className="lazy-toggle">
                      <button
                        className={`lazy-toggle__button ${
                          templateMode === 'replace' ? 'active' : ''
                        }`}
                        type="button"
                        onClick={() => setTemplateMode('replace')}
                      >
                        Replace layout
                      </button>
                      <button
                        className={`lazy-toggle__button ${
                          templateMode === 'add' ? 'active' : ''
                        }`}
                        type="button"
                        onClick={() => setTemplateMode('add')}
                      >
                        Add to existing
                      </button>
                    </div>
                  </div>
                  {selectedTemplate?.supportsFilterBar ? (
                    <label className="lazy-template-card__toggle">
                      <input
                        type="checkbox"
                        checked={includeTemplateFilterBar}
                        onChange={(event) =>
                          setIncludeTemplateFilterBar(event.target.checked)
                        }
                      />
                      <span>Include filter bar</span>
                    </label>
                  ) : null}
                </div>
              </div>
              <div className="lazy-template-grid">
                {dashboardTemplates.map((template) => {
                  const isActive = template.id === selectedTemplateId;
                  const showFilter = isActive ? includeTemplateFilterBar : false;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      className={`lazy-template-card lazy-template-card--selectable ${
                        isActive ? 'is-active' : ''
                      }`}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <div className="lazy-template-card__preview">
                        <div className="lazy-template-preview">
                          {getTemplatePreview(template.id, showFilter).map(
                            (block, index) => (
                              <span
                                key={`${template.id}-${index}`}
                                className={`lazy-template-preview__block ${block.type || ''} lazy-grid-x-${block.x} lazy-grid-y-${block.y} lazy-grid-w-${block.w} lazy-grid-h-${block.h}`}
                              />
                            )
                          )}
                        </div>
                      </div>
                      <h3 className="lazy-template-card__title">
                        {template.name}
                      </h3>
                      <p className="lazy-template-card__description">
                        {template.description}
                      </p>
                      <div className="lazy-template-card__tags">
                        {template.tags.map((tag) => (
                          <span className="lazy-pill" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="lazy-modal__footer">
              <button
                className="lazy-button ghost"
                type="button"
                onClick={closeTemplateModal}
              >
                Cancel
              </button>
              <button
                className="lazy-button"
                type="button"
                onClick={() => applyTemplateToModel(selectedTemplateId)}
                disabled={!selectedTemplateId}
              >
                Apply template
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isAddWidgetOpen ? (
        <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
          <div className="lazy-modal">
            <div className="lazy-modal__header">
              <div>
                <p className="lazy-modal__eyebrow">Widget library</p>
                <h2 className="lazy-modal__title">Add widget</h2>
              </div>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={closeAddWidgetModal}
              >
                Close
              </button>
            </div>
            <div className="lazy-modal__body">
              <div className="lazy-viz-grid">
                {vizManifests.map((manifest) => {
                  const prereqs = getVizPrereqs(manifest);
                  const isDeferred = manifest.supportLevel === 'deferred';
                  const isPartial = manifest.supportLevel === 'partial';
                  return (
                    <button
                      key={manifest.id}
                      className={`lazy-viz-card${
                        selectedVizType === manifest.id ? ' active' : ''
                      }`}
                      type="button"
                      disabled={isDeferred}
                      onClick={() => setSelectedVizType(manifest.id)}
                    >
                      <div className="lazy-viz-card__header">
                        <span className="lazy-viz-card__title">
                          {manifest.label}
                        </span>
                        <span className="lazy-viz-card__type">
                          {manifest.id}
                        </span>
                      </div>
                      {isDeferred ? (
                        <span className="lazy-pill">Deferred</span>
                      ) : null}
                      {isPartial ? (
                        <span className="lazy-pill">Partial</span>
                      ) : null}
                      <p className="lazy-viz-card__description">
                        {manifest.description}
                      </p>
                      <div className="lazy-viz-card__prereqs">
                        {prereqs.map((item) => (
                          <span key={item} className="lazy-viz-card__prereq">
                            {item}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              {!datasetBinding ? (
                <div className="lazy-alert warning">
                  <strong>Dataset missing.</strong>
                  <span>
                    Import a dataset to unlock field suggestions and previews.
                  </span>
                </div>
              ) : null}
            </div>
            <div className="lazy-modal__footer">
              <button
                className="lazy-button ghost"
                type="button"
                onClick={closeAddWidgetModal}
              >
                Cancel
              </button>
              <button className="lazy-button" type="button" onClick={handleAddWidget}>
                Add widget
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {pendingRemoveWidget ? (
        <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
          <div className="lazy-modal">
            <div className="lazy-modal__header">
              <div>
                <p className="lazy-modal__eyebrow">Confirm removal</p>
                <h2 className="lazy-modal__title">Remove widget</h2>
              </div>
            </div>
            <div className="lazy-modal__body">
              <p className="lazy-panel__body">
                Remove "{pendingRemoveWidget.title}" from the dashboard?
              </p>
            </div>
            <div className="lazy-modal__footer">
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => setPendingRemoveWidgetId(null)}
              >
                Cancel
              </button>
              <button
                className="lazy-button danger"
                type="button"
                onClick={() => handleRemoveWidget(pendingRemoveWidget.id)}
              >
                Remove widget
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default DashboardEditor;
