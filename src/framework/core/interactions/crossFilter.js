const buildSelectionId = ({ panelId, field, value }) =>
  `${panelId || 'panel'}:${field}:${String(value)}`;

export const createCrossFilterSelection = ({
  panelId,
  field,
  value,
  op = 'IN',
  label,
}) => {
  if (!field) {
    return null;
  }
  const values = Array.isArray(value) ? value : [value];
  const resolvedLabel = label
    ? `${label}: ${values.join(', ')}`
    : `${field}: ${values.join(', ')}`;
  return {
    id: buildSelectionId({ panelId, field, value: values.join('|') }),
    sourcePanelId: panelId || null,
    label: resolvedLabel,
    filter: {
      field,
      op,
      values,
    },
  };
};

export const getCrossFilterValueFromEvent = (event, field) => {
  if (!event || !field) {
    return null;
  }
  if (event.payload && event.payload[field] !== undefined) {
    return event.payload[field];
  }
  if (event.payload?.payload && event.payload.payload[field] !== undefined) {
    return event.payload.payload[field];
  }
  const activePayload = event.activePayload?.[0]?.payload;
  if (activePayload && activePayload[field] !== undefined) {
    return activePayload[field];
  }
  if (event.activeLabel !== undefined && field === event.activeLabelField) {
    return event.activeLabel;
  }
  if (event[field] !== undefined) {
    return event[field];
  }
  return null;
};

export const buildCrossFilterSelectionFromEvent = ({
  event,
  panelId,
  field,
  op,
  label,
}) => {
  const value = getCrossFilterValueFromEvent(event, field);
  if (value === null || value === undefined) {
    return null;
  }
  return createCrossFilterSelection({
    panelId,
    field,
    value,
    op,
    label,
  });
};

export const getSelectionLabel = (selection) => {
  if (!selection) {
    return '';
  }
  if (selection.label) {
    return selection.label;
  }
  const values = selection.filter?.values || [];
  return `${selection.filter?.field || 'Filter'}: ${values.join(', ')}`;
};

export const isSelectionDuplicate = (selections = [], selection) => {
  if (!selection) {
    return false;
  }
  return selections.some((existing) => existing.id === selection.id);
};
