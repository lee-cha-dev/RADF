import createDataset from "../../../framework/core/model/createDataset";
import { createHierarchy } from "../../../framework/core/model/hierarchies";
import dimensions from "./example.dimensions";
import metrics from "./example.metrics";

const hierarchies = [
  createHierarchy({
    id: "order_date",
    type: "date",
    label: "Order Date",
    levels: ["date_year", "date_quarter", "date_month", "date_day"],
  }),
];

const exampleDataset = createDataset({
  id: "example_dataset",
  label: "Example Dataset",
  dimensions,
  metrics,
  hierarchies,
  defaultGrain: "date_month",
  timezone: "UTC",
});

export default exampleDataset;
