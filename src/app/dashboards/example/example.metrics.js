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
];

export default metrics;
