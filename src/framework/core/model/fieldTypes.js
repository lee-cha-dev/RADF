export const FIELD_TYPES = {
  STRING: "string",
  NUMBER: "number",
  DATE: "date",
  BOOLEAN: "boolean",
  GEO: "geo",
};

export const FIELD_TYPE_VALUES = Object.values(FIELD_TYPES);

export const isFieldType = (value) => FIELD_TYPE_VALUES.includes(value);
