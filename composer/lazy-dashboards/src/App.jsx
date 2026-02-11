import { useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import DashboardLibrary from './pages/DashboardLibrary.jsx';
import DashboardEditor from './pages/DashboardEditor.jsx';
import useThemeSettings from './hooks/useThemeSettings.js';
import SettingsDrawer from './components/SettingsDrawer.jsx';
import EditorErrorBoundary from './components/EditorErrorBoundary.jsx';

/**
 * Renders the Lazy Dashboards shell with routing, theming status, and settings controls.
 *
 * @returns {JSX.Element} The application shell.
 */
const App = () => {
  const location = useLocation();
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const isEditorRoute = location.pathname.startsWith('/editor');

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
          <NavLink
            className="lazy-nav__link"
            type="button"
            onClick={openSettings}
            aria-haspopup="dialog"
            aria-expanded={isSettingsOpen}
          >
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
      <main className={`lazy-shell${isEditorRoute ? ' lazy-shell--editor' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardLibrary
                themeFamily={themeFamily}
                themeMode={resolvedMode}
                paletteId={paletteId}
              />
            }
          />
          <Route
            path="/editor/:dashboardId"
            element={
              <EditorErrorBoundary>
                <DashboardEditor
                  themeFamily={themeFamily}
                  themeMode={resolvedMode}
                  paletteId={paletteId}
                />
              </EditorErrorBoundary>
            }
          />
        </Routes>
      </main>
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={closeSettings}
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
    </div>
  );
};

export default App;
