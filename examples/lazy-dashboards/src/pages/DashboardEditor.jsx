import { Link, useParams } from 'react-router-dom';

const DashboardEditor = () => {
  const { dashboardId } = useParams();

  return (
    <section className="lazy-editor">
      <header className="lazy-editor__header">
        <div>
          <p className="lazy-editor__eyebrow">Dashboard Editor</p>
          <h1 className="lazy-editor__title">{dashboardId}</h1>
          <p className="lazy-editor__subtitle">
            Drag widgets, tune encodings, and preview live as you edit.
          </p>
        </div>
        <div className="lazy-editor__actions">
          <button className="lazy-button" type="button">
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
