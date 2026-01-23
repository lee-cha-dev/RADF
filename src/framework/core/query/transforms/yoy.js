const parseDateParts = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getFullYear(),
      key: `${value.getMonth() + 1}-${value.getDate()}`,
    };
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const year = Math.trunc(value);
    return { year, key: 'year' };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const dateMatch = trimmed.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/);
    if (dateMatch) {
      const year = Number(dateMatch[1]);
      const month = dateMatch[2] || '01';
      const day = dateMatch[3] || '01';
      return { year, key: `${month}-${day}` };
    }
  }

  return null;
};

export const yoyRows = (
  rows = [],
  { field, dateField, resultField, percent = true } = {}
) => {
  if (!field || !dateField) {
    return Array.isArray(rows) ? [...rows] : [];
  }

  const list = Array.isArray(rows) ? rows : [];
  const valueMap = new Map();

  list.forEach((row) => {
    const parts = parseDateParts(row?.[dateField]);
    if (!parts) {
      return;
    }
    valueMap.set(`${parts.year}-${parts.key}`, Number(row?.[field]));
  });

  const outputField = resultField || `${field}_yoy`;

  return list.map((row) => {
    const parts = parseDateParts(row?.[dateField]);
    if (!parts) {
      return { ...row, [outputField]: null };
    }

    const currentValue = Number(row?.[field]);
    const previousValue = valueMap.get(`${parts.year - 1}-${parts.key}`);

    if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
      return { ...row, [outputField]: null };
    }

    if (percent) {
      if (previousValue === 0) {
        return { ...row, [outputField]: null };
      }
      return {
        ...row,
        [outputField]: (currentValue - previousValue) / previousValue,
      };
    }

    return { ...row, [outputField]: currentValue - previousValue };
  });
};
