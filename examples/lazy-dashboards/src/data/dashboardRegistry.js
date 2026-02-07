const STORAGE_KEY = 'lazyDashboards.registry';
const DEFAULT_SCHEMA_VERSION = 1;

const getEmptyRegistry = () => ({
  dashboards: [],
});

const readRegistry = () => {
  if (typeof window === 'undefined') {
    return getEmptyRegistry();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || !Array.isArray(parsed.dashboards)) {
      return getEmptyRegistry();
    }
    const normalized = normalizeRegistry(parsed);
    if (normalized.didNormalize) {
      writeRegistry(normalized.registry);
    }
    return normalized.registry;
  } catch (error) {
    return getEmptyRegistry();
  }
};

const writeRegistry = (registry) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
};

const ensureAuthoringModel = (model = {}) => ({
  ...model,
  schemaVersion:
    typeof model.schemaVersion === 'number'
      ? model.schemaVersion
      : DEFAULT_SCHEMA_VERSION,
  widgets: Array.isArray(model.widgets) ? model.widgets : [],
  layout: Array.isArray(model.layout) ? model.layout : [],
  datasetBinding:
    model.datasetBinding === undefined ? null : model.datasetBinding,
});

function normalizeRegistry(registry) {
  let didNormalize = false;
  const dashboards = registry.dashboards.map((dashboard) => {
    const needsAuthoring =
      !dashboard.authoringModel ||
      typeof dashboard.authoringModel.schemaVersion !== 'number';
    if (!needsAuthoring) {
      return dashboard;
    }
    didNormalize = true;
    return {
      ...dashboard,
      authoringModel: ensureAuthoringModel(dashboard.authoringModel),
    };
  });
  return { didNormalize, registry: { ...registry, dashboards } };
}

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const generateId = (name) => {
  const base = slugify(name || '');
  const suffix = Math.random().toString(36).slice(2, 7);
  return base ? `${base}-${suffix}` : `dashboard-${Date.now().toString(36)}`;
};

const getNextUntitledName = (dashboards) => {
  const base = 'Untitled Dashboard';
  if (!dashboards.some((dashboard) => dashboard.name === base)) {
    return base;
  }
  let counter = 2;
  while (
    dashboards.some(
      (dashboard) => dashboard.name === `${base} ${counter}`
    )
  ) {
    counter += 1;
  }
  return `${base} ${counter}`;
};

const createDashboardRecord = (
  {
    name,
    authoringModel,
    compiledConfig,
    datasetBinding,
    tags,
    description,
  } = {}
) => {
  const now = new Date().toISOString();
  const resolvedName = name?.trim() || 'Untitled Dashboard';
  return {
    id: generateId(resolvedName),
    name: resolvedName,
    description: description || '',
    tags: Array.isArray(tags) ? tags : [],
    createdAt: now,
    updatedAt: now,
    authoringModel: ensureAuthoringModel(authoringModel),
    compiledConfig: compiledConfig || null,
    datasetBinding: datasetBinding || null,
  };
};

const cloneValue = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

export const listDashboards = () => {
  const registry = readRegistry();
  return [...registry.dashboards].sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || '') || 0;
    const bTime = Date.parse(b.updatedAt || '') || 0;
    return bTime - aTime;
  });
};

export const getDashboard = (id) => {
  if (!id) {
    return null;
  }
  const registry = readRegistry();
  return registry.dashboards.find((dashboard) => dashboard.id === id) || null;
};

export const createDashboard = ({ name, template } = {}) => {
  const registry = readRegistry();
  const resolvedName = name?.trim() || getNextUntitledName(registry.dashboards);
  const record = createDashboardRecord({
    name: resolvedName,
    authoringModel: template?.authoringModel,
    compiledConfig: template?.compiledConfig,
    datasetBinding: template?.datasetBinding,
    tags: template?.tags,
    description: template?.description,
  });
  registry.dashboards.push(record);
  writeRegistry(registry);
  return record;
};

export const updateDashboard = (id, updates = {}) => {
  if (!id) {
    return null;
  }
  const registry = readRegistry();
  const index = registry.dashboards.findIndex((dashboard) => dashboard.id === id);
  if (index === -1) {
    return null;
  }
  const current = registry.dashboards[index];
  const now = new Date().toISOString();
  const next = {
    ...current,
    ...updates,
    updatedAt: now,
  };
  if (updates.authoringModel) {
    next.authoringModel = ensureAuthoringModel(updates.authoringModel);
  }
  registry.dashboards[index] = next;
  writeRegistry(registry);
  return next;
};

export const touchDashboard = (id) => updateDashboard(id, {});

export const renameDashboard = (id, name) =>
  updateDashboard(id, { name: name?.trim() || 'Untitled Dashboard' });

export const duplicateDashboard = (id) => {
  const registry = readRegistry();
  const source = registry.dashboards.find((dashboard) => dashboard.id === id);
  if (!source) {
    return null;
  }
  const copy = cloneValue(source);
  const baseName = copy.name ? `${copy.name} Copy` : 'Untitled Dashboard Copy';
  const record = createDashboardRecord({
    name: baseName,
    authoringModel: copy.authoringModel,
    compiledConfig: copy.compiledConfig,
    datasetBinding: copy.datasetBinding,
    tags: copy.tags,
    description: copy.description,
  });
  registry.dashboards.push(record);
  writeRegistry(registry);
  return record;
};

export const deleteDashboard = (id) => {
  if (!id) {
    return false;
  }
  const registry = readRegistry();
  const next = registry.dashboards.filter((dashboard) => dashboard.id !== id);
  if (next.length === registry.dashboards.length) {
    return false;
  }
  registry.dashboards = next;
  writeRegistry(registry);
  return true;
};

export { STORAGE_KEY };
