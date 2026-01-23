import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import registerCharts from './framework/core/registry/registerCharts.js';
import './framework/styles/tokens.css';
import './framework/styles/theme.light.css';
import './framework/styles/theme.dark.css';
import './framework/styles/framework.css';
import './framework/styles/components/grid.css';
import './framework/styles/components/panel.css';
import './framework/styles/components/charts.css';
import './framework/styles/components/filters.css';

const rootElement = document.getElementById('root');

registerCharts();

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
