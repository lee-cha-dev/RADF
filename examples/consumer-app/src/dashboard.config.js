const dashboardConfig = {
  id: 'consumer-smoke',
  title: 'Consumer Smoke Test',
  subtitle: 'RADF styles load automatically from the package import.',
  datasetId: 'consumer_dataset',
  panels: [
    {
      id: 'kpi-revenue',
      panelType: 'viz',
      vizType: 'kpi',
      title: 'Total Revenue',
      subtitle: 'Last 14 days',
      layout: { x: 1, y: 1, w: 4, h: 1 },
      datasetId: 'consumer_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: [],
      },
      encodings: { value: 'total_revenue', label: 'Total Revenue' },
      options: { format: 'currency', caption: 'All segments' },
    },
    {
      id: 'trend-revenue',
      panelType: 'viz',
      vizType: 'line',
      title: 'Daily Revenue Trend',
      subtitle: 'Auto-generated demo series',
      layout: { x: 1, y: 2, w: 8, h: 2 },
      datasetId: 'consumer_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: ['order_day'],
      },
      encodings: { x: 'order_day', y: 'total_revenue' },
      options: { tooltip: true, legend: false },
    },
  ],
};

export default dashboardConfig;
