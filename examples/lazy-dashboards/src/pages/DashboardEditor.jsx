import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useDashboardRegistry from '../hooks/useDashboardRegistry.js';

const DashboardEditor = () => {
  const { dashboardId } = useParams();
  const { getDashboardById, touchDashboard } = useDashboardRegistry();
  const dashboard = getDashboardById(dashboardId);
  const [lastSavedAt, setLastSavedAt] = useState(
    dashboard?.updatedAt || null
  );

  useEffect(() => {
    setLastSavedAt(dashboard?.updatedAt || null);
  }, [dashboard?.updatedAt]);

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

  const handleSave = () => {
    const updated = touchDashboard(dashboardId);
    if (updated?.updatedAt) {
      setLastSavedAt(updated.updatedAt);
    }
  };

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
          <h2 className="lazy-panel__title">Data & Fields</h2>
          <p className="lazy-panel__body">
            Drop a CSV/XLSX, map fields, and define semantic metrics.
          </p>
          <button className="lazy-button ghost" type="button">
            Import Dataset
          </button>
        </section>
        <section className="lazy-canvas">
          <div className="lazy-canvas__header">
            <h2 className="lazy-panel__title">Live Preview</h2>
            <button className="lazy-button ghost" type="button">
              Add Widget
            </button>
          </div>
          <div className="lazy-canvas__stage">
            <p className="lazy-canvas__empty">
              Panels render here once widgets are configured.
            </p>
          </div>
        </section>
        <section className="lazy-panel">
          <h2 className="lazy-panel__title">Widget Properties</h2>
          <p className="lazy-panel__body">
            Select a widget to tune encodings, options, and filters.
          </p>
          <button className="lazy-button ghost" type="button">
            Open Manifest
          </button>
        </section>
      </div>
    </section>
  );
};

export default DashboardEditor;
