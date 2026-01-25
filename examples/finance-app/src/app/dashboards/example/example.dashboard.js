/**
 * @module app/dashboards/example/example.dashboard
 * @description Example dashboard configuration illustrating panels and interactions.
 */

/**
 * Example dashboard configuration used by the tutorial page.
 * @type {import('radf').DashboardConfig & {
 *   dateField: string
 * }}
 *
 * @example
 * // Clone this file and update ids/titles to create a new dashboard.
 * const myDashboard = {
 *   ...exampleDashboard,
 *   id: 'customer-retention',
 *   title: 'Customer Retention',
 *   datasetId: 'customer_dataset',
 * };
 */
const exampleDashboard = {
  id: 'example-dashboard',
  title: 'Executive Performance Overview',
  subtitle: 'Revenue, orders, and regional momentum',
  datasetId: 'example_dataset',
  dateField: 'date_day',
  panels: [
    {
      id: 'kpi-revenue',
      panelType: 'viz',
      vizType: 'kpi',
      title: 'Total Revenue',
      subtitle: 'Last 14 days',
      layout: { x: 1, y: 1, w: 4, h: 1 },
      datasetId: 'example_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: [],
      },
      encodings: { value: 'total_revenue', label: 'Total Revenue' },
      options: {
        format: 'currency',
        label: 'Total Revenue',
        caption: 'Aggregated across all regions.',
      },
    },
    {
      id: 'kpi-orders',
      panelType: 'viz',
      vizType: 'kpi',
      title: 'Order Volume',
      subtitle: 'Last 14 days',
      layout: { x: 5, y: 1, w: 4, h: 1 },
      datasetId: 'example_dataset',
      query: {
        measures: ['order_count'],
        dimensions: [],
      },
      encodings: { value: 'order_count', label: 'Orders' },
      options: {
        format: 'integer',
        label: 'Orders',
        caption: 'Total orders placed.',
      },
    },
    {
      id: 'kpi-aov',
      panelType: 'viz',
      vizType: 'kpi',
      title: 'Average Order Value',
      subtitle: 'Last 14 days',
      layout: { x: 9, y: 1, w: 4, h: 1 },
      datasetId: 'example_dataset',
      query: {
        measures: ['average_order_value'],
        dimensions: [],
      },
      encodings: { value: 'average_order_value', label: 'Avg. Order Value' },
      options: {
        format: 'currency',
        label: 'Avg. Order Value',
        caption: 'Average spend per order.',
      },
    },
    {
      id: 'trend',
      panelType: 'viz',
      title: 'Revenue Trend',
      subtitle: 'Daily revenue with drilldown and brushing.',
      layout: { x: 1, y: 2, w: 8, h: 2 },
      vizType: 'line',
      datasetId: 'example_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: ['date_month'],
      },
      encodings: { x: 'date_month', y: 'total_revenue' },
      options: { tooltip: true, legend: false },
      interactions: {
        drilldown: {
          dimension: 'date_month',
          to: 'date_day',
        },
        brushZoom: {
          field: 'date_day',
          label: 'Visible date window',
          applyToGlobal: true,
        },
      },
    },
    {
      id: 'breakdown',
      panelType: 'viz',
      title: 'Regional Breakdown',
      subtitle: 'Cross-filter by clicking a region.',
      layout: { x: 9, y: 2, w: 4, h: 2 },
      vizType: 'bar',
      datasetId: 'example_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: ['region'],
      },
      encodings: { x: 'region', y: 'total_revenue' },
      options: { tooltip: true, legend: true, colorBy: 'category' },
      interactions: {
        crossFilter: {
          field: 'region',
          label: 'Region',
        },
      },
    },
    {
      id: 'insights',
      panelType: 'insights',
      title: 'Automated Insights',
      subtitle: 'Trend and anomaly signals from the mock dataset.',
      layout: { x: 1, y: 4, w: 12, h: 2 },
      datasetId: 'example_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: ['date_month'],
      },
    },
  ],
};

export default exampleDashboard;
