import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDashboardRegistry from '../hooks/useDashboardRegistry.js';
import {
  buildDashboardExport,
  downloadDashboardZip,
} from '../data/dashboardExport.js';
import {
  buildTemplateAuthoringModel,
  getTemplatePreview,
  listDashboardTemplates,
} from '../data/dashboardTemplates.js';

/**
 * @typedef {Object} DashboardRecord
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [updatedAt]
 * @property {string[]} [tags]
 * @property {Object} [authoringModel]
 */

/**
 * @typedef {Object} DashboardTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} tags
 * @property {boolean} supportsFilterBar
 */

/**
 * Formats a timestamp for display in the library list.
 *
 * @param {string|number|Date|null|undefined} value - The timestamp to format.
 * @returns {string} The formatted timestamp.
 */
const formatTimestamp = (value) => {
  if (!value) {
    return 'Unknown';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Displays the dashboard library and entry points for new dashboards.
 *
 * @param {{ themeFamily: string, themeMode: 'light'|'dark', paletteId: string }} props
 * @returns {JSX.Element} The dashboard library page.
 */
const DashboardLibrary = ({ themeFamily, themeMode, paletteId }) => {
  const navigate = useNavigate();
  const {
    dashboards,
    createDashboard,
    renameDashboard,
    duplicateDashboard,
    deleteDashboardAndCleanup,
  } = useDashboardRegistry();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const templates = useMemo(() => listDashboardTemplates(), []);
  const [templateOptions, setTemplateOptions] = useState(() => {
    const options = {};
    templates.forEach((template) => {
      options[template.id] = {
        includeFilterBar: false,
      };
    });
    return options;
  });

  const filteredDashboards = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const filtered = normalized
      ? dashboards.filter((dashboard) =>
          dashboard.name.toLowerCase().includes(normalized)
        )
      : dashboards;
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return (
        (Date.parse(b.updatedAt || '') || 0) -
        (Date.parse(a.updatedAt || '') || 0)
      );
    });
    return sorted;
  }, [dashboards, search, sortBy]);

  const handleCreate = () => {
    const name = window.prompt('Name the new dashboard');
    if (name === null) {
      return;
    }
    const record = createDashboard({ name });
    if (record) {
      navigate(`/editor/${record.id}`);
    }
  };

  const handleRename = (dashboard) => {
    const name = window.prompt('Rename dashboard', dashboard.name);
    if (name === null) {
      return;
    }
    renameDashboard(dashboard.id, name);
  };

  const handleDuplicate = (dashboard) => {
    duplicateDashboard(dashboard.id);
  };

  const handleDelete = async (dashboard) => {
    const confirmDelete = window.confirm(
      `Delete "${dashboard.name}"? This cannot be undone.`
    );
    if (!confirmDelete) {
      return;
    }
    const result = await deleteDashboardAndCleanup(dashboard);
    if (!result.success) {
      window.alert('Unable to delete that dashboard.');
      return;
    }
    if (result.syncAttempted && !result.syncRemoved) {
      window.alert(
        'Dashboard deleted, but the CustomDashboards export could not be removed.'
      );
    }
  };

  const handleExport = async (dashboard) => {
    const exportPlan = buildDashboardExport({
      dashboard,
      authoringModel: dashboard.authoringModel,
      themeFamily,
      themeMode,
      paletteId,
    });
    if (!exportPlan) {
      window.alert('Export failed to build.');
      return;
    }
    await downloadDashboardZip(exportPlan);
  };

  const handleImportDataset = () => {
    const name = window.prompt(
      'Name the dashboard for this dataset',
      'Dataset Dashboard'
    );
    if (name === null) {
      return;
    }
    const record = createDashboard({ name });
    if (record) {
      navigate(`/editor/${record.id}`);
    }
  };

  const handleCreateFromTemplate = (template) => {
    const includeFilterBar =
      templateOptions[template.id]?.includeFilterBar || false;
    const authoringModel = buildTemplateAuthoringModel(template.id, {
      includeFilterBar,
    });
    const record = createDashboard({
      name: template.name,
      template: {
        authoringModel,
        tags: template.tags,
        description: template.description,
      },
    });
    if (record) {
      navigate(`/editor/${record.id}`);
    }
  };

  const handleTemplateOptionChange = (templateId, field, value) => {
    setTemplateOptions((current) => ({
      ...current,
      [templateId]: {
        ...current[templateId],
        [field]: value,
      },
    }));
  };

  return (
    <section className="lazy-library">
      <header className="lazy-hero">
        <div>
          <p className="lazy-hero__eyebrow">Lazy Dashboards</p>
          <h1 className="lazy-hero__title">
            Compose dashboards in minutes, ship config in seconds.
          </h1>
          <p className="lazy-hero__subtitle">
            Import a dataset, map your metrics, and watch RADF render live panels
            as you build.
          </p>
        </div>
        <div className="lazy-hero__actions">
          <button className="lazy-button" type="button" onClick={handleCreate}>
            Create Dashboard
          </button>
          <button
            className="lazy-button ghost"
            type="button"
            onClick={handleImportDataset}
          >
            Import Dataset
          </button>
        </div>
      </header>

      <div className="lazy-library__section">
        <div className="lazy-library__section-header">
          <div>
            <h2 className="lazy-library__section-title">Starter templates</h2>
            <p className="lazy-library__section-subtitle">
              Jump into a dashboard layout and wire data later.
            </p>
          </div>
        </div>
        <div className="lazy-template-grid">
          {templates.map((template) => (
            <article className="lazy-template-card" key={template.id}>
              <div className="lazy-template-card__preview">
                <div className="lazy-template-preview">
                  {getTemplatePreview(
                    template.id,
                    templateOptions[template.id]?.includeFilterBar
                  ).map((block, index) => (
                    <span
                      key={`${template.id}-${index}`}
                      className={`lazy-template-preview__block ${block.type || ''} lazy-grid-x-${block.x} lazy-grid-y-${block.y} lazy-grid-w-${block.w} lazy-grid-h-${block.h}`}
                    />
                  ))}
                </div>
              </div>
              <h3 className="lazy-template-card__title">{template.name}</h3>
              <p className="lazy-template-card__description">
                {template.description}
              </p>
              {template.supportsFilterBar ? (
                <label className="lazy-template-card__toggle">
                  <input
                    type="checkbox"
                    checked={
                      templateOptions[template.id]?.includeFilterBar || false
                    }
                    onChange={(event) =>
                      handleTemplateOptionChange(
                        template.id,
                        'includeFilterBar',
                        event.target.checked
                      )
                    }
                  />
                  <span>Include filter bar</span>
                </label>
              ) : null}
              <div className="lazy-template-card__tags">
                {template.tags.map((tag) => (
                  <span className="lazy-pill" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={() => handleCreateFromTemplate(template)}
              >
                Use template
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="lazy-library__toolbar">
        <div className="lazy-input">
          <span className="lazy-input__label">Search</span>
          <input
            className="lazy-input__field"
            type="search"
            placeholder="Find dashboards"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="lazy-input">
          <span className="lazy-input__label">Sort by</span>
          <select
            className="lazy-input__field"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="updated">Last updated</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="lazy-input">
          <span className="lazy-input__label">View</span>
          <div className="lazy-toggle">
            <button
              className={`lazy-toggle__button ${
                viewMode === 'grid' ? 'active' : ''
              }`}
              type="button"
              onClick={() => setViewMode('grid')}
            >
              Cards
            </button>
            <button
              className={`lazy-toggle__button ${
                viewMode === 'list' ? 'active' : ''
              }`}
              type="button"
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
        <div className="lazy-library__count">
          {filteredDashboards.length} dashboards
        </div>
      </div>

      {filteredDashboards.length === 0 ? (
        <div className="lazy-empty">
          <h2 className="lazy-empty__title">No dashboards yet</h2>
          <p className="lazy-empty__subtitle">
            Create a dashboard or import a dataset to kickstart your library.
          </p>
          <div className="lazy-empty__actions">
            <button className="lazy-button" type="button" onClick={handleCreate}>
              Create Dashboard
            </button>
            <button
              className="lazy-button ghost"
              type="button"
              onClick={handleImportDataset}
            >
              Import Dataset
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`lazy-library__grid ${
            viewMode === 'list' ? 'list' : ''
          }`}
        >
          {filteredDashboards.map((dashboard) => (
            <article
              className={`lazy-card ${
                viewMode === 'list' ? 'is-list' : ''
              }`}
              key={dashboard.id}
              onDoubleClick={() => navigate(`/editor/${dashboard.id}`)}
            >
              <div className="lazy-card__main">
                <div className="lazy-card__header">
                  <h2 className="lazy-card__title">{dashboard.name}</h2>
                  <span className="lazy-card__meta">
                    Updated {formatTimestamp(dashboard.updatedAt)}
                  </span>
                </div>
                <p className="lazy-card__description">
                  {dashboard.description || 'No summary saved yet.'}
                </p>
                {dashboard.tags?.length ? (
                  <div className="lazy-card__tags">
                    {dashboard.tags.map((tag) => (
                      <span className="lazy-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="lazy-card__actions">
                <Link className="lazy-button" to={`/editor/${dashboard.id}`}>
                  Edit
                </Link>
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={() => handleRename(dashboard)}
                >
                  Rename
                </button>
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={() => handleDuplicate(dashboard)}
                >
                  Duplicate
                </button>
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={() => handleExport(dashboard)}
                >
                  Export
                </button>
                <button
                  className="lazy-button danger"
                  type="button"
                  onClick={() => handleDelete(dashboard)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default DashboardLibrary;
