import { Link } from 'react-router-dom';

const DASHBOARDS = [
  {
    id: 'northwind-kpis',
    name: 'Northwind KPIs',
    updatedAt: '2 hours ago',
    description: 'Sales pacing, margin mix, and top product performance.',
    tags: ['KPI', 'Retail'],
  },
  {
    id: 'ops-overview',
    name: 'Ops Overview',
    updatedAt: 'Yesterday',
    description: 'Incident flow, SLA drift, and queue temperature.',
    tags: ['Operations', 'Alerts'],
  },
  {
    id: 'growth-studio',
    name: 'Growth Studio',
    updatedAt: '3 days ago',
    description: 'Activation funnels with channel and cohort splits.',
    tags: ['Growth', 'Cohorts'],
  },
];

const DashboardLibrary = () => (
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
        <button className="lazy-button" type="button">
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
        />
      </div>
      <div className="lazy-input">
        <span className="lazy-input__label">Sort by</span>
        <select className="lazy-input__field" defaultValue="updated">
          <option value="updated">Last updated</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>

    <div className="lazy-library__grid">
      {DASHBOARDS.map((dashboard) => (
        <article className="lazy-card" key={dashboard.id}>
          <div className="lazy-card__header">
            <h2 className="lazy-card__title">{dashboard.name}</h2>
            <span className="lazy-card__meta">Updated {dashboard.updatedAt}</span>
          </div>
          <p className="lazy-card__description">{dashboard.description}</p>
          <div className="lazy-card__tags">
            {dashboard.tags.map((tag) => (
              <span className="lazy-pill" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="lazy-card__actions">
            <Link className="lazy-button" to={`/editor/${dashboard.id}`}>
              Edit
            </Link>
            <button className="lazy-button ghost" type="button">
              Export
            </button>
            <button className="lazy-button danger" type="button">
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default DashboardLibrary;
