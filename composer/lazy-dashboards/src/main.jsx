/**
 * @file Application entrypoint that registers charts/insights and mounts routing.
 * Assumes a #root element exists in index.html.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerCharts, registerInsights } from 'radf';
import App from './App.jsx';
import 'radf/styles.css';
import './app.css';

registerCharts();
registerInsights();

/**
 * @type {HTMLElement|null}
 */
const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
