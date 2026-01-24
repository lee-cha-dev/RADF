/**
 * @module routes
 * @description Route table for the example app. Provides dashboard entry routes
 * consumed by React Router in the App shell.
 */
import DashboardPage from './app/pages/DashboardPage.jsx';

const routes = [
  {
    path: '/',
    element: <DashboardPage />,
  },
];

export default routes;
