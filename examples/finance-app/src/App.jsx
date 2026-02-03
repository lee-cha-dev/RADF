/**
 * @module App
 * @description Application shell that manages theme toggling, routing, and
 * error boundaries for the RADF example dashboard.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import { ErrorBoundary } from 'radf';
import routes from './routes.jsx';
import "./app.css";

// Switch to "fecc-theme-light" and "fecc-theme-dark"
// for an example of a custom style
const THEME_CLASS = {
  light: 'radf-theme-dracula-light',
  dark: 'radf-theme-dracula-dark',
};

function App() {
  const [theme, setTheme] = useState('dark');
  const routing = useRoutes(routes);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(THEME_CLASS.light, THEME_CLASS.dark);
    root.classList.add(THEME_CLASS[theme]);
  }, [theme]);

  const toggleLabel = useMemo(
    () => (theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'),
    [theme]
  );

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleResetApp = () => {
    window.location.reload();
  };

  return (
    <div className="radf-app app">
      <header className="radf-app__header">
        <div className="radf-app__branding">
          <span className="radf-app__title">RADF</span>
          <span className="radf-app__subtitle">
            Recharts Analytics Dashboard Framework
          </span>
        </div>
        <button className="radf-button" type="button" onClick={handleToggleTheme}>
          {toggleLabel}
        </button>
      </header>
      <main className="radf-app__content">
        <ErrorBoundary
          title="Dashboard failed to load"
          message="The dashboard encountered an unexpected error. Reload the page to retry."
          onReset={handleResetApp}
        >
          {routing}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
