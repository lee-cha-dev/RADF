import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerCharts, registerInsights } from 'radf';
import App from './App.jsx';
import 'radf/styles.css';
import './app.css';

registerCharts();
registerInsights();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
