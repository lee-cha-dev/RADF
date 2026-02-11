import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MockDataProvider, createMultiDataProvider } from 'ladf';
import useDashboardRegistry from '../hooks/useDashboardRegistry.js';
import {
  addWidgetToModel,
  createDatasourceId,
  createAuthoringModel,
  createWidgetDraft,
  normalizeAuthoringModel,
  removeWidgetFromModel,
} from '../authoring/authoringModel.js';
import { compileAuthoringModel } from '../authoring/compiler.js';
import { validateAuthoringModel } from '../authoring/validation.js';
import { listVizManifests } from '../authoring/vizManifest.js';
import { validateManifestCoverage } from '../authoring/manifestValidation.js';
import { createLocalDataProvider } from '../data/localDataProvider.js';
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
import CollapsiblePanel from '../components/editor/CollapsiblePanel.jsx';
import AddWidgetModal from '../components/editor/AddWidgetModal.jsx';
import DatasetPanel from '../components/editor/DatasetPanel.jsx';
import EditorSettingsPanel from '../components/editor/EditorSettingsPanel.jsx';
import GridCanvas from '../components/editor/GridCanvas.jsx';
import IconToolbar from '../components/editor/IconToolbar.jsx';
import RemoveWidgetModal from '../components/editor/RemoveWidgetModal.jsx';
import SemanticLayerPanel from '../components/editor/SemanticLayerPanel.jsx';
import TemplateModal from '../components/editor/TemplateModal.jsx';
import WidgetListPanel from '../components/editor/WidgetListPanel.jsx';
import WidgetPropertiesPanel from '../components/editor/WidgetPropertiesPanel.jsx';
import {
  getSyncEnabled,
  isFileSystemAccessSupported,
  loadCustomDashboardsDirectory,
  requestCustomDashboardsDirectory,
  setSyncEnabled,
  writeDashboardExportToDirectory,
} from '../data/fileSystemSync.js';
import { trackTelemetryEvent } from '../data/telemetry.js';

/**
 * @typedef {Object} DashboardRecord
 * @property {string} id
 * @property {string} name
 * @property {string} [updatedAt]
 * @property {Object} [authoringModel]
 * @property {Object} [datasetBinding]
 */

/**
 * @typedef {Object} DatasetBinding
 * @property {Object[]} [columns]
 * @property {Object[]} [rows]
 * @property {Object[]} [previewRows]
 * @property {Object[]} [preview]
 */

/**
 * @typedef {Object} SemanticLayer
 * @property {boolean} enabled
 * @property {Object[]} metrics
 * @property {Object[]} dimensions
 */

/**
 * @typedef {Object} WidgetLayout
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [w]
 * @property {number} [h]
 */

/**
 * @typedef {Object} WidgetSummary
 * @property {string} id
 * @property {WidgetLayout} [layout]
 */

/**
 * @typedef {Object} AuthoringModel
 * @property {Object} [meta]
 * @property {WidgetSummary[]} [widgets]
 * @property {Object[]} [layout]
 * @property {Object[]} [datasources]
 * @property {string|null} [activeDatasourceId]
 * @property {DatasetBinding} [datasetBinding]
 * @property {SemanticLayer} [semanticLayer]
 */

/**
 * @typedef {Object} SyncStatus
 * @property {'idle'|'syncing'|'synced'|'error'} state
 * @property {string} error
 * @property {string|null} lastSyncedAt
 */

/**
 * Provides the authoring workspace for editing a dashboard.
 *
 * @param {{ themeFamily: string, themeMode: 'light'|'dark', paletteId: string }} props
 * @returns {JSX.Element} The dashboard editor page.
 */
const DashboardEditor = ({ themeFamily, themeMode, paletteId }) => {
  const PANEL_WIDTHS_KEY = 'lazy-editor-panel-widths';
  const AUTO_SAVE_KEY = 'lazy-editor-autosave-enabled';
  const { dashboardId } = useParams();
  const { dashboards, updateDashboard } = useDashboardRegistry();
  const dashboard = useMemo(
    () => dashboards.find((item) => item.id === dashboardId) || null,
    [dashboards, dashboardId]
  );
  const lastSavedModelRef = useRef('');
  const [lastSavedAt, setLastSavedAt] = useState(
    dashboard?.updatedAt || null
  );
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    try {
      const stored = window.localStorage.getItem(AUTO_SAVE_KEY);
      if (stored === null) {
        return true;
      }
      return stored === 'true';
    } catch {
      return true;
    }
  });
  const [autoSaveState, setAutoSaveState] = useState('idle');
  const [authoringModel, setAuthoringModel] = useState(() =>
    normalizeAuthoringModel(
      dashboard?.authoringModel ||
        createAuthoringModel({ title: dashboard?.name })
    )
  );
  const [activeWidgetId, setActiveWidgetId] = useState(
    dashboard?.authoringModel?.widgets?.[0]?.id || null
  );
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
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [canvasMode, setCanvasMode] = useState('layout');
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    if (typeof window === 'undefined') {
      return 320;
    }
    try {
      const stored = window.localStorage.getItem(PANEL_WIDTHS_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed?.left || 320;
    } catch {
      return 320;
    }
  });
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    if (typeof window === 'undefined') {
      return 360;
    }
    try {
      const stored = window.localStorage.getItem(PANEL_WIDTHS_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed?.right || 360;
    } catch {
      return 360;
    }
  });
  const [leftActiveTool, setLeftActiveTool] = useState('widgets');
  const [rightActiveTool, setRightActiveTool] = useState('properties');
  const syncSupported = useMemo(() => isFileSystemAccessSupported(), []);
  const leftTools = useMemo(
    () => [
      { id: 'dataset', label: 'Dataset', icon: 'DS' },
      { id: 'semantic', label: 'Semantic Layer', icon: 'SL' },
      { id: 'widgets', label: 'Widgets', icon: 'WG' },
    ],
    []
  );
  const rightTools = useMemo(
    () => [
      { id: 'properties', label: 'Properties', icon: 'PR' },
      { id: 'settings', label: 'Settings', icon: 'ST' },
    ],
    []
  );

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
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(AUTO_SAVE_KEY, String(autoSaveEnabled));
  }, [autoSaveEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const payload = JSON.stringify({
      left: leftPanelWidth,
      right: rightPanelWidth,
    });
    window.localStorage.setItem(PANEL_WIDTHS_KEY, payload);
  }, [leftPanelWidth, rightPanelWidth]);

  useEffect(() => {
    if (!dashboard) {
      return;
    }
    const normalized = normalizeAuthoringModel(dashboard.authoringModel, {
      title: dashboard.name,
    });
    if (dashboard.datasetBinding) {
      const hasBinding = (normalized.datasources || []).some(
        (datasource) => datasource?.datasetBinding
      );
      if (!hasBinding) {
        const nextDatasources = [...(normalized.datasources || [])];
        if (nextDatasources.length === 0) {
          nextDatasources.push({
            id: dashboard.datasetBinding.id || 'datasource',
            name: dashboard.name || 'Primary datasource',
            datasetBinding: dashboard.datasetBinding,
            semanticLayer: normalized.semanticLayer,
          });
        } else {
          nextDatasources[0] = {
            ...nextDatasources[0],
            datasetBinding: dashboard.datasetBinding,
          };
        }
        normalized.datasources = nextDatasources;
        if (!nextDatasources.some((item) => item.id === normalized.activeDatasourceId)) {
          normalized.activeDatasourceId = nextDatasources[0]?.id || null;
        }
      }
      if (!normalized.datasetBinding) {
        normalized.datasetBinding = dashboard.datasetBinding;
      }
    }
    setAuthoringModel(normalized);
    lastSavedModelRef.current = JSON.stringify(normalized);
    setActiveWidgetId((currentId) => {
      if (currentId && normalized.widgets.some((widget) => widget.id === currentId)) {
        return currentId;
      }
      return normalized.widgets[0]?.id || null;
    });
  }, [dashboard]);

  const handleLeftToolClick = (toolId) => {
    if (!leftPanelOpen) {
      setLeftPanelOpen(true);
      setLeftActiveTool(toolId);
      return;
    }
    if (leftActiveTool === toolId) {
      setLeftPanelOpen(false);
      return;
    }
    setLeftActiveTool(toolId);
  };

  const handleRightToolClick = (toolId) => {
    if (!rightPanelOpen) {
      setRightPanelOpen(true);
      setRightActiveTool(toolId);
      return;
    }
    if (rightActiveTool === toolId) {
      setRightPanelOpen(false);
      return;
    }
    setRightActiveTool(toolId);
  };

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

  const autoSaveStatusLabel = useMemo(() => {
    if (!autoSaveEnabled) {
      return lastSavedAt ? `Off (last saved ${formattedSavedAt})` : 'Off';
    }
    if (autoSaveState === 'pending' || autoSaveState === 'saving') {
      return 'Saving...';
    }
    if (!lastSavedAt) {
      return 'Not saved yet';
    }
    return `Auto-saved ${formattedSavedAt}`;
  }, [autoSaveEnabled, autoSaveState, formattedSavedAt, lastSavedAt]);

  /**
   * Persists the dataset binding as-is so previews use full datasets.
   *
   * @param {DatasetBinding|null} binding - The current dataset binding.
   * @returns {DatasetBinding|null} The persisted dataset binding.
   */
  const buildPersistedDatasetBinding = useCallback((binding) => {
    if (!binding) {
      return null;
    }
    return { ...binding };
  }, []);

  /**
   * Produces a storage-safe authoring model.
   *
   * @param {AuthoringModel|null} model - The current authoring model.
   * @returns {AuthoringModel|null} The sanitized model.
   */
  const buildPersistedAuthoringModel = useCallback(
    (model) => {
      if (!model) {
        return model;
      }
      const datasources = (model.datasources || []).map((datasource) => ({
        ...datasource,
        datasetBinding: buildPersistedDatasetBinding(
          datasource.datasetBinding
        ),
      }));
      const activeDatasource =
        datasources.find((item) => item.id === model.activeDatasourceId) ||
        datasources[0] ||
        null;
      return {
        ...model,
        datasources,
        datasetBinding: buildPersistedDatasetBinding(
          activeDatasource?.datasetBinding || model.datasetBinding
        ),
        semanticLayer:
          activeDatasource?.semanticLayer || model.semanticLayer,
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
  const leftPanelTitle =
    leftTools.find((tool) => tool.id === leftActiveTool)?.label || 'Tools';
  const rightPanelTitle =
    rightTools.find((tool) => tool.id === rightActiveTool)?.label || 'Tools';
  const slugifyDatasourceId = useCallback((value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, ''),
    []
  );
  const resolveUniqueDatasourceId = useCallback((value, currentId, existingIds) => {
    const usedIds = new Set(existingIds);
    if (currentId) {
      usedIds.delete(currentId);
    }
    const base = slugifyDatasourceId(value) || 'datasource';
    let nextId = base;
    let counter = 2;
    while (usedIds.has(nextId)) {
      nextId = `${base}-${counter}`;
      counter += 1;
    }
    return nextId;
  }, [slugifyDatasourceId]);

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
  const datasources = useMemo(() => authoringModel.datasources || [], [
    authoringModel.datasources,
  ]);
  const activeDatasourceId =
    authoringModel.activeDatasourceId || datasources[0]?.id || null;
  const activeDatasource =
    datasources.find((item) => item.id === activeDatasourceId) ||
    datasources[0] ||
    null;
  const datasetBinding = activeDatasource?.datasetBinding || null;
  const datasetColumns = useMemo(() => datasetBinding?.columns || [], [
    datasetBinding,
  ]);
  const semanticLayer = activeDatasource?.semanticLayer || {
    enabled: false,
    metrics: [],
    dimensions: [],
  };
  const previewDatasourceBindings = useMemo(() => {
    const next = new Map();
    datasources.forEach((datasource) => {
      const binding = datasource?.datasetBinding;
      if (!binding) {
        return;
      }
      if (binding.rows?.length) {
        next.set(datasource.id, binding);
        return;
      }
      if (binding.previewRows?.length) {
        next.set(datasource.id, {
          ...binding,
          rows: binding.previewRows,
        });
        return;
      }
      next.set(datasource.id, binding);
    });
    return next;
  }, [datasources]);
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
    const providersById = {};
    datasources.forEach((datasource) => {
      const binding = previewDatasourceBindings.get(datasource.id);
      if (!binding?.rows?.length) {
        return;
      }
      providersById[datasource.id] = createLocalDataProvider({
        rows: binding.rows,
        columns: binding.columns || [],
        semanticLayer: datasource.semanticLayer?.enabled
          ? datasource.semanticLayer
          : null,
      });
    });
    return createMultiDataProvider(providersById, {
      defaultProvider: MockDataProvider,
    });
  }, [datasources, previewDatasourceBindings]);

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

  const handleSave = () => {
    const persistedModel = buildPersistedAuthoringModel(authoringModel);
    const persistedBinding = buildPersistedDatasetBinding(
      activeDatasource?.datasetBinding || authoringModel.datasetBinding
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
    setAutoSaveState('idle');
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
        themeFamily,
        themeMode,
        paletteId,
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

  const handleDatasetUpdate = useCallback(
    (nextDataset) => {
      setAuthoringModel((current) => {
        const nextDatasources = (current.datasources || []).map((datasource) =>
          datasource.id === activeDatasourceId
            ? { ...datasource, datasetBinding: nextDataset || null }
            : datasource
        );
        return {
          ...current,
          datasources: nextDatasources,
          datasetBinding: nextDataset || null,
        };
      });
    },
    [activeDatasourceId]
  );

  const handleActiveDatasourceChange = useCallback((nextId) => {
    setAuthoringModel((current) => {
      const nextDatasource = (current.datasources || []).find(
        (datasource) => datasource.id === nextId
      );
      return {
        ...current,
        activeDatasourceId: nextId,
        datasetBinding: nextDatasource?.datasetBinding || null,
        semanticLayer: nextDatasource?.semanticLayer || current.semanticLayer,
      };
    });
  }, []);

  const handleAddDatasource = useCallback(() => {
    setAuthoringModel((current) => {
      const existingIds = new Set(
        (current.datasources || []).map((datasource) => datasource.id)
      );
      const name = `Datasource ${existingIds.size + 1}`;
      const id = createDatasourceId(name, existingIds);
      const nextDatasource = {
        id,
        name,
        datasetBinding: null,
        semanticLayer: {
          enabled: false,
          exportDatasetConfig: false,
          metrics: [],
          dimensions: [],
        },
      };
      return {
        ...current,
        datasources: [...(current.datasources || []), nextDatasource],
        activeDatasourceId: id,
      };
    });
  }, []);

  const handleRemoveDatasource = useCallback((datasourceId) => {
    setAuthoringModel((current) => {
      const remaining = (current.datasources || []).filter(
        (datasource) => datasource.id !== datasourceId
      );
      if (remaining.length === (current.datasources || []).length) {
        return current;
      }
      const nextActiveId =
        current.activeDatasourceId === datasourceId
          ? remaining[0]?.id || null
          : current.activeDatasourceId;
      const nextWidgets = (current.widgets || []).map((widget) => {
        if (widget.datasourceId === datasourceId) {
          return {
            ...widget,
            datasourceId: nextActiveId,
          };
        }
        return widget;
      });
      return {
        ...current,
        datasources: remaining.length > 0 ? remaining : current.datasources,
        activeDatasourceId:
          remaining.length > 0 ? nextActiveId : current.activeDatasourceId,
        widgets: nextWidgets,
      };
    });
  }, []);

  const handleDatasourceNameChange = useCallback(
    (datasourceId, nextName) => {
      setAuthoringModel((current) => {
        const existingIds = (current.datasources || []).map(
          (datasource) => datasource.id
        );
        let remappedId = datasourceId;
        const nextDatasources = (current.datasources || []).map(
          (datasource) => {
            if (datasource.id !== datasourceId) {
              return datasource;
            }
            const trimmedName = nextName?.trim() || '';
            const autoId = slugifyDatasourceId(datasource.name);
            const shouldAutoRename = autoId === datasource.id;
            const nextId = shouldAutoRename
              ? resolveUniqueDatasourceId(
                  trimmedName,
                  datasource.id,
                  existingIds
                )
              : datasource.id;
            remappedId = nextId;
            return {
              ...datasource,
              id: nextId,
              name: trimmedName,
            };
          }
        );
        const activeId =
          current.activeDatasourceId === datasourceId
            ? remappedId
            : current.activeDatasourceId;
        const nextWidgets = (current.widgets || []).map((widget) => {
          if (widget.datasourceId !== datasourceId) {
            return widget;
          }
          return {
            ...widget,
            datasourceId: remappedId,
          };
        });
        return {
          ...current,
          datasources: nextDatasources,
          activeDatasourceId: activeId,
          widgets: nextWidgets,
        };
      });
    },
    [resolveUniqueDatasourceId, slugifyDatasourceId]
  );

  const handleDatasourceIdChange = useCallback(
    (datasourceId, nextId) => {
      setAuthoringModel((current) => {
        const existingIds = (current.datasources || []).map(
          (datasource) => datasource.id
        );
        const resolvedId = resolveUniqueDatasourceId(
          nextId,
          datasourceId,
          existingIds
        );
        if (resolvedId === datasourceId) {
          return current;
        }
        const nextDatasources = (current.datasources || []).map(
          (datasource) =>
            datasource.id === datasourceId
              ? { ...datasource, id: resolvedId }
              : datasource
        );
        const nextWidgets = (current.widgets || []).map((widget) =>
          widget.datasourceId === datasourceId
            ? { ...widget, datasourceId: resolvedId }
            : widget
        );
        return {
          ...current,
          datasources: nextDatasources,
          activeDatasourceId:
            current.activeDatasourceId === datasourceId
              ? resolvedId
              : current.activeDatasourceId,
          widgets: nextWidgets,
        };
      });
    },
    [resolveUniqueDatasourceId]
  );

  const handleAddWidget = () => {
    const vizType = selectedVizType || vizManifests[0]?.id || 'kpi';
    setAuthoringModel((current) => {
      const widget = createWidgetDraft(current, {
        vizType,
        datasourceId: activeDatasourceId,
      });
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

  /**
   * Finds the max occupied grid row in a widget list.
   *
   * @param {WidgetSummary[]} widgets - The widgets to scan.
   * @returns {number} The highest occupied row index.
   */
  const getMaxRow = (widgets) =>
    (widgets || []).reduce((max, widget) => {
      const layout = widget.layout || { y: 1, h: 1 };
      return Math.max(max, layout.y + layout.h - 1);
    }, 0);

  /**
   * Generates a unique widget id for template merges.
   *
   * @param {string} base - The base id to attempt.
   * @param {Set<string>} used - The set of already-used ids.
   * @returns {string} The unique widget id.
   */
  const buildUniqueWidgetId = (base, used) => {
    let nextId = base || 'widget';
    while (used.has(nextId)) {
      nextId = `${base || 'widget'}-${Math.random().toString(36).slice(2, 6)}`;
    }
    used.add(nextId);
    return nextId;
  };

  /**
   * Applies a dashboard template to the current authoring model.
   *
   * @param {string} templateId - The template id to apply.
   * @returns {void}
   */
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
            datasources: current.datasources,
            activeDatasourceId: current.activeDatasourceId,
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

  /**
   * Updates semantic layer state with a functional updater.
   *
   * @param {(layer: SemanticLayer) => SemanticLayer} updater - The semantic layer updater.
   * @returns {void}
   */
  const updateSemanticLayer = useCallback((updater) => {
    setAuthoringModel((current) => {
      const nextLayer = updater(
        (current.datasources || []).find(
          (datasource) => datasource.id === activeDatasourceId
        )?.semanticLayer || {
          enabled: false,
          exportDatasetConfig: false,
          metrics: [],
          dimensions: [],
        }
      );
      const nextDatasources = (current.datasources || []).map((datasource) =>
        datasource.id === activeDatasourceId
          ? { ...datasource, semanticLayer: nextLayer }
          : datasource
      );
      return {
        ...current,
        datasources: nextDatasources,
        semanticLayer: nextLayer,
      };
    });
  }, [activeDatasourceId]);

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

  const handleExportDatasetConfigChange = useCallback(
    (exportDatasetConfig) => {
      updateSemanticLayer((currentLayer) => ({
        ...currentLayer,
        exportDatasetConfig,
      }));
    },
    [updateSemanticLayer]
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

  const handleMetricCreate = useCallback(
    (metric) => {
      if (!metric) {
        return;
      }
      updateSemanticLayer((currentLayer) => {
        const existing = currentLayer.metrics || [];
        if (existing.some((item) => item.id === metric.id)) {
          return currentLayer;
        }
        return {
          ...currentLayer,
          enabled: true,
          metrics: [...existing, metric],
        };
      });
    },
    [updateSemanticLayer]
  );

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
  /**
   * Builds prerequisite labels for a visualization manifest.
   *
   * @param {Object} manifest - The manifest definition.
   * @returns {string[]} The prerequisite labels.
   */
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

  useEffect(() => {
    if (!dashboard || !autoSaveEnabled) {
      return undefined;
    }
    const serialized = JSON.stringify(authoringModel);
    if (serialized === lastSavedModelRef.current) {
      setAutoSaveState('idle');
      return undefined;
    }
    setAutoSaveState('pending');
    const timeout = setTimeout(() => {
      setAutoSaveState('saving');
      const persistedModel = buildPersistedAuthoringModel(authoringModel);
      const persistedBinding = buildPersistedDatasetBinding(
        activeDatasource?.datasetBinding || authoringModel.datasetBinding
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
      setAutoSaveState('idle');
    }, 900);
    return () => clearTimeout(timeout);
  }, [
    authoringModel,
    activeDatasource,
    autoSaveEnabled,
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
      themeFamily,
      themeMode,
      paletteId,
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
    themeFamily,
    themeMode,
    paletteId,
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
    <section className="lazy-editor-shell">
      <header className="lazy-editor-topbar">
        <div className="lazy-editor-topbar__meta">
          <p className="lazy-editor__eyebrow">Dashboard Editor</p>
          <h1 className="lazy-editor-topbar__title">{dashboard.name}</h1>
          <p className="lazy-editor-topbar__subtitle">
            Drag widgets, tune encodings, and preview live as you edit.
          </p>
          <div className="lazy-editor-topbar__status">
            <span>Auto-save: {autoSaveStatusLabel}</span>
            {syncSupported ? <span>Disk sync: {syncStatusLabel}</span> : null}
          </div>
        </div>
        <div className="lazy-editor-topbar__actions">
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
          <button
            className="lazy-button ghost"
            type="button"
            onClick={handleExport}
          >
            Export
          </button>
          <Link className="lazy-button ghost" to="/">
            Back to Library
          </Link>
        </div>
      </header>

      <div className="lazy-editor__body">
        <div className="lazy-editor__sidebar lazy-editor__sidebar--left">
          <IconToolbar
            side="left"
            tools={leftTools}
            activeTool={leftActiveTool}
            isOpen={leftPanelOpen}
            onToolClick={handleLeftToolClick}
          />
          {leftPanelOpen ? (
            <CollapsiblePanel
              side="left"
              title={leftPanelTitle}
              onClose={() => setLeftPanelOpen(false)}
              width={leftPanelWidth}
              minWidth={260}
              maxWidth={9999}
              onResize={setLeftPanelWidth}
            >
              <div className="lazy-panel">
                <h2 className="lazy-panel__title">Active datasource</h2>
                <div className="lazy-form">
                  <label className="lazy-form__field">
                    <span className="lazy-input__label">Datasource</span>
                    <select
                      className="lazy-input__field"
                      value={activeDatasourceId || ''}
                      onChange={(event) =>
                        handleActiveDatasourceChange(event.target.value)
                      }
                      disabled={datasources.length <= 1}
                    >
                      {datasources.map((datasource) => (
                        <option key={datasource.id} value={datasource.id}>
                          {datasource.name || datasource.id}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              {leftActiveTool === 'dataset' ? (
                <DatasetPanel
                  datasources={datasources}
                  activeDatasourceId={activeDatasourceId}
                  onActiveDatasourceChange={handleActiveDatasourceChange}
                  onAddDatasource={handleAddDatasource}
                  onRemoveDatasource={handleRemoveDatasource}
                  onDatasourceNameChange={handleDatasourceNameChange}
                  onDatasourceIdChange={handleDatasourceIdChange}
                  datasetBinding={datasetBinding}
                  onDatasetUpdate={handleDatasetUpdate}
                />
              ) : null}
              {leftActiveTool === 'semantic' ? (
                <SemanticLayerPanel
                  datasetBinding={datasetBinding}
                  datasetColumns={datasetColumns}
                  semanticLayer={semanticLayer}
                  dimensionSuggestions={dimensionSuggestions}
                  metricGroups={metricGroups}
                  onModeChange={handleSemanticModeChange}
                  onExportDatasetConfigChange={handleExportDatasetConfigChange}
                  onReset={handleSemanticReset}
                  onDimensionToggle={handleDimensionToggle}
                  onDimensionLabelChange={handleDimensionLabelChange}
                  onMetricToggle={handleMetricToggle}
                  onMetricLabelChange={handleMetricLabelChange}
                  onMetricCreate={handleMetricCreate}
                />
              ) : null}
              {leftActiveTool === 'widgets' ? (
                <WidgetListPanel
                  authoringModel={authoringModel}
                  validation={validation}
                  activeWidgetId={activeWidgetId}
                  onWidgetSelect={setActiveWidgetId}
                  onOpenTemplate={openTemplateModal}
                  onAddWidget={openAddWidgetModal}
                  onRequestRemoveWidget={handleRequestRemoveWidget}
                />
              ) : null}
            </CollapsiblePanel>
          ) : null}
        </div>

        <main className="lazy-editor__center">
          <GridCanvas
            dashboardId={dashboard.id}
            compiledConfig={compiledPreview.config}
            authoringModel={authoringModel}
            validation={validation}
            activeWidgetId={activeWidgetId}
            onWidgetSelect={setActiveWidgetId}
            onUpdateAuthoringModel={setAuthoringModel}
            previewProvider={previewProvider}
            datasources={datasources}
            previewDatasourceBindings={previewDatasourceBindings}
            onAddWidget={openAddWidgetModal}
            viewMode={canvasMode}
            onViewModeChange={setCanvasMode}
          />
        </main>

        <div className="lazy-editor__sidebar lazy-editor__sidebar--right">
          {rightPanelOpen ? (
            <CollapsiblePanel
              side="right"
              title={rightPanelTitle}
              onClose={() => setRightPanelOpen(false)}
              width={rightPanelWidth}
              minWidth={280}
              maxWidth={9999}
              onResize={setRightPanelWidth}
            >
              {rightActiveTool === 'properties' ? (
                <WidgetPropertiesPanel
                  authoringModel={authoringModel}
                  activeWidgetId={activeWidgetId}
                  vizManifests={vizManifests}
                  datasources={datasources}
                  activeDatasourceId={activeDatasourceId}
                  validation={validation}
                  manifestCoverage={manifestCoverage}
                  compiledPanelMap={compiledPanelMap}
                  onUpdateAuthoringModel={setAuthoringModel}
                  onRequestRemoveWidget={handleRequestRemoveWidget}
                />
              ) : null}
              {rightActiveTool === 'settings' ? (
                <EditorSettingsPanel
                  autoSaveEnabled={autoSaveEnabled}
                  onToggleAutoSave={setAutoSaveEnabled}
                  syncSupported={syncSupported}
                  syncEnabled={syncEnabled}
                  syncStatusLabel={syncStatusLabel}
                  onEnableSync={handleEnableSync}
                  onDisableSync={handleDisableSync}
                  onChangeSyncFolder={handleEnableSync}
                />
              ) : null}
            </CollapsiblePanel>
          ) : null}
          <IconToolbar
            side="right"
            tools={rightTools}
            activeTool={rightActiveTool}
            isOpen={rightPanelOpen}
            onToolClick={handleRightToolClick}
          />
        </div>
      </div>
      <TemplateModal
        isOpen={isTemplateOpen}
        authoringModel={authoringModel}
        datasetBinding={datasetBinding}
        templateMode={templateMode}
        onTemplateModeChange={setTemplateMode}
        includeTemplateFilterBar={includeTemplateFilterBar}
        onIncludeTemplateFilterBarChange={setIncludeTemplateFilterBar}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
        selectedTemplate={selectedTemplate}
        dashboardTemplates={dashboardTemplates}
        onApplyTemplate={applyTemplateToModel}
        onClose={closeTemplateModal}
        getTemplatePreview={getTemplatePreview}
      />
      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        vizManifests={vizManifests}
        selectedVizType={selectedVizType}
        onSelectVizType={setSelectedVizType}
        onClose={closeAddWidgetModal}
        onConfirm={handleAddWidget}
        datasetBinding={datasetBinding}
        getVizPrereqs={getVizPrereqs}
      />
      <RemoveWidgetModal
        pendingRemoveWidget={pendingRemoveWidget}
        onCancel={() => setPendingRemoveWidgetId(null)}
        onConfirm={() =>
          pendingRemoveWidget
            ? handleRemoveWidget(pendingRemoveWidget.id)
            : null
        }
      />
    </section>
  );
};

export default DashboardEditor;
