/**
 * @module main
 * @description Application entry point. Registers RADF chart/insight modules,
 * loads framework styles, and mounts the React router at the root element.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerCharts, registerInsights } from 'radf';
import 'radf/style.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'RADF could not find the #root element. Ensure index.html includes <div id="root"></div> before initializing the app.'
  );
}

registerCharts();
registerInsights();

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
