import { NavLink, Route, Routes } from 'react-router-dom';
import DashboardLibrary from './pages/DashboardLibrary.jsx';
import DashboardEditor from './pages/DashboardEditor.jsx';
import Settings from './pages/Settings.jsx';
import useThemeSettings from './hooks/useThemeSettings.js';

const App = () => {
  const {
    themeFamily,
    themeMode,
    paletteId,
    resolvedMode,
    themeFamilies,
    paletteOptions,
    setThemeFamily,
    setThemeMode,
    setPaletteId,
  } = useThemeSettings();

  return (
    <div className="lazy-app">
      <header className="lazy-topbar">
        <div className="lazy-brand">
          <span className="lazy-brand__mark" aria-hidden="true">
            LD
          </span>
          <div>
            <div className="lazy-brand__title">Lazy Dashboards</div>
            <div className="lazy-brand__subtitle">
              Config-driven dashboard composer
            </div>
          </div>
        </div>
        <nav className="lazy-nav">
          <NavLink className="lazy-nav__link" to="/" end>
            Library
          </NavLink>
          <NavLink className="lazy-nav__link" to="/settings">
            Settings
          </NavLink>
        </nav>
        <div className="lazy-status">
          <span className="lazy-status__item">
            Theme: {themeFamily} / {resolvedMode}
          </span>
          <span className="lazy-status__item">Palette: {paletteId}</span>
        </div>
      </header>
      <main className="lazy-shell">
        <Routes>
          <Route path="/" element={<DashboardLibrary />} />
          <Route path="/editor/:dashboardId" element={<DashboardEditor />} />
          <Route
            path="/settings"
            element={
              <Settings
                themeFamily={themeFamily}
                themeMode={themeMode}
                paletteId={paletteId}
                resolvedMode={resolvedMode}
                themeFamilies={themeFamilies}
                paletteOptions={paletteOptions}
                setThemeFamily={setThemeFamily}
                setThemeMode={setThemeMode}
                setPaletteId={setPaletteId}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
