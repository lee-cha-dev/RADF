import React, { useEffect, useMemo, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes.jsx';

const THEME_CLASS = {
  light: 'radf-theme-light',
  dark: 'radf-theme-dark',
};

function App() {
  const [theme, setTheme] = useState('light');
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

  return (
    <div className="radf-app">
      <header className="radf-app__header">
        <div className="radf-app__branding">
          <span className="radf-app__title">RADF</span>
          <span className="radf-app__subtitle">Recharts Analytics Dashboard Framework</span>
        </div>
        <button className="radf-button" type="button" onClick={handleToggleTheme}>
          {toggleLabel}
        </button>
      </header>
      <main className="radf-app__content">{routing}</main>
    </div>
  );
}

export default App;
