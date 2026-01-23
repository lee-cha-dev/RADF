export const HIERARCHY_TYPES = {
  DATE: "date",
  ORG: "org",
  GEO: "geo",
};

export const DEFAULT_DATE_HIERARCHY = {
  type: HIERARCHY_TYPES.DATE,
  levels: ["date_year", "date_quarter", "date_month", "date_day"],
};

export const createHierarchy = ({ id, type, levels, label }) => ({
  id,
  type,
  levels,
  label: label || id,
});
