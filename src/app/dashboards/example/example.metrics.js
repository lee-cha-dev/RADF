import createMetric from "../../../framework/core/model/createMetric";

const metrics = [
  createMetric({
    id: "total_revenue",
    label: "Total Revenue",
    format: "currency",
    dependsOn: ["revenue"],
    query: { op: "SUM", field: "revenue" },
  }),
  createMetric({
    id: "order_count",
    label: "Order Count",
    format: "integer",
    dependsOn: ["order_id"],
    query: { op: "COUNT", field: "order_id" },
  }),
  createMetric({
    id: "average_order_value",
    label: "Average Order Value",
    format: "currency",
    dependsOn: ["order_value"],
    query: { op: "AVG", field: "order_value" },
  }),
];

export default metrics;
