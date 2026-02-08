const Settings = ({
  themeFamily,
  themeMode,
  paletteId,
  resolvedMode,
  themeFamilies,
  paletteOptions,
  setThemeFamily,
  setThemeMode,
  setPaletteId,
  showHeader = true,
}) => (
  <section className="lazy-settings">
    {showHeader ? (
      <header className="lazy-settings__header">
        <div>
          <p className="lazy-settings__eyebrow">Global Settings</p>
          <h1 className="lazy-settings__title">Themes & Palettes</h1>
          <p className="lazy-settings__subtitle">
            Settings apply across every dashboard and persist in your browser.
          </p>
        </div>
      </header>
    ) : null}

    <div className="lazy-settings__grid">
      <section className="lazy-panel">
        <h2 className="lazy-panel__title">Theme Family</h2>
        <p className="lazy-panel__body">
          Choose the core RADF visual language for the app shell.
        </p>
        <select
          className="lazy-input__field"
          value={themeFamily}
          onChange={(event) => setThemeFamily(event.target.value)}
        >
          {themeFamilies.map((family) => (
            <option key={family.id} value={family.id}>
              {family.label}
            </option>
          ))}
        </select>
      </section>

      <section className="lazy-panel">
        <h2 className="lazy-panel__title">Light / Dark Mode</h2>
        <p className="lazy-panel__body">
          Current mode: <strong>{resolvedMode}</strong>
        </p>
        <div className="lazy-toggle">
          {['system', 'light', 'dark'].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`lazy-toggle__button${
                themeMode === mode ? ' active' : ''
              }`}
              onClick={() => setThemeMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      <section className="lazy-panel">
        <h2 className="lazy-panel__title">Chart Palette</h2>
        <p className="lazy-panel__body">
          Palettes affect chart series, gradients, and categorical colors.
        </p>
        <select
          className="lazy-input__field"
          value={paletteId}
          onChange={(event) => setPaletteId(event.target.value)}
        >
          {paletteOptions.map((palette) => (
            <option key={palette.id} value={palette.id}>
              {palette.label}
            </option>
          ))}
        </select>
      </section>
    </div>
  </section>
);

export default Settings;
