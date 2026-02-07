import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDashboardRegistry from '../hooks/useDashboardRegistry.js';

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

const DashboardLibrary = () => {
  const navigate = useNavigate();
  const {
    dashboards,
    createDashboard,
    renameDashboard,
    duplicateDashboard,
    deleteDashboard,
  } = useDashboardRegistry();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated');

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

  const handleDelete = (dashboard) => {
    const confirmDelete = window.confirm(
      `Delete "${dashboard.name}"? This cannot be undone.`
    );
    if (!confirmDelete) {
      return;
    }
    deleteDashboard(dashboard.id);
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
          <button className="lazy-button ghost" type="button">
            Import Dataset
          </button>
        </div>
      </header>

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
            <button className="lazy-button ghost" type="button">
              Import Dataset
            </button>
          </div>
        </div>
      ) : (
        <div className="lazy-library__grid">
          {filteredDashboards.map((dashboard) => (
            <article
              className="lazy-card"
              key={dashboard.id}
              onDoubleClick={() => navigate(`/editor/${dashboard.id}`)}
            >
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
                <button className="lazy-button ghost" type="button">
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
