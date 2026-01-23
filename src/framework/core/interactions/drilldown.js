import { getCrossFilterValueFromEvent } from './crossFilter';

const buildDrilldownId = ({ panelId, dimension, value }) =>
  `${panelId || 'panel'}:${dimension}:${String(value)}`;

export const createDrilldownEntry = ({
  panelId,
  dimension,
  to,
  value,
  label,
}) => {
  if (!dimension || value === undefined || value === null) {
    return null;
  }
  const resolvedLabel = label
    ? `${label}: ${value}`
    : `${dimension}: ${value}`;
  return {
    id: buildDrilldownId({ panelId, dimension, value }),
    sourcePanelId: panelId || null,
    dimension,
    to,
    value,
    label: resolvedLabel,
    filter: {
      field: dimension,
      op: 'IN',
      values: [value],
    },
  };
};

export const buildDrilldownEntryFromEvent = ({
  event,
  panelId,
  dimension,
  to,
  label,
}) => {
  const value = getCrossFilterValueFromEvent(event, dimension);
  if (value === null || value === undefined) {
    return null;
  }
  return createDrilldownEntry({
    panelId,
    dimension,
    to,
    value,
    label,
  });
};

export const applyDrilldownToDimensions = ({
  dimensions = [],
  drillPath = [],
  drilldownConfig,
}) => {
  if (!drilldownConfig || !drillPath.length) {
    return dimensions;
  }
  return drillPath.reduce((nextDimensions, entry) => {
    if (!entry?.dimension || !entry?.to) {
      return nextDimensions;
    }
    return nextDimensions.map((dimension) =>
      dimension === entry.dimension ? entry.to : dimension
    );
  }, [...dimensions]);
};

export const isDrilldownDuplicate = (drillPath = [], entry) => {
  if (!entry) {
    return false;
  }
  return drillPath.some((existing) => existing.id === entry.id);
};

export const getDrilldownLabel = (entry) => {
  if (!entry) {
    return '';
  }
  if (entry.label) {
    return entry.label;
  }
  return `${entry.dimension || 'Dimension'}: ${entry.value}`;
};
