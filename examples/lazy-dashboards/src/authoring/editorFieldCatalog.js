const FIELD_CATALOG = {
  boolean: { control: 'toggle' },
  enum: { control: 'select' },
  number: { control: 'number' },
  string: { control: 'text' },
  stringList: { control: 'list' },
  color: { control: 'color' },
};

export const resolveEditorControl = (schema = {}) =>
  schema.control || FIELD_CATALOG[schema.type]?.control || 'text';

export const listEditorFieldTypes = () => Object.keys(FIELD_CATALOG);
