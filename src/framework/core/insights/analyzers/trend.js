const formatNumber = (value) => {
  if (value == null || Number.isNaN(value)) {
    return '0';
  }
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const findMeasureId = (rows, querySpec) => {
  if (querySpec?.measures?.length) {
    return querySpec.measures[0];
  }
  const sample = rows?.[0];
  if (!sample) {
    return null;
  }
  const numericKey = Object.keys(sample).find((key) => typeof sample[key] === 'number');
  return numericKey || null;
};

const getValues = (rows, measureId) =>
  (rows || [])
    .map((row) => Number(row?.[measureId]))
    .filter((value) => Number.isFinite(value));

const analyze = ({ rows, querySpec, meta }) => {
  const measureId = findMeasureId(rows, querySpec);
  if (!measureId) {
    return [];
  }
  const values = getValues(rows, measureId);
  if (values.length < 2) {
    return [];
  }
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const percent = first !== 0 ? delta / Math.abs(first) : null;
  const direction = delta > 0 ? 'upward' : delta < 0 ? 'downward' : 'flat';
  const magnitude = percent != null ? Math.abs(percent) : null;
  const severity =
    magnitude == null
      ? 'info'
      : magnitude > 0.2
      ? 'positive'
      : magnitude > 0.08
      ? 'info'
      : 'neutral';
  const percentLabel = percent == null ? null : `${Math.abs(percent * 100).toFixed(1)}%`;
  const rowCount = meta?.rowCount ?? rows?.length ?? 0;
  const narrative =
    direction === 'flat'
      ? `The ${measureId} metric stayed flat across ${rowCount} points.`
      : `The ${measureId} metric moved ${direction}, changing ${percentLabel || formatNumber(Math.abs(delta))} from ${formatNumber(first)} to ${formatNumber(last)} across ${rowCount} points.`;

  return {
    title: `Trend is ${direction}`,
    severity,
    narrative,
    recommendedAction:
      direction === 'downward'
        ? 'Investigate recent drivers impacting the downward shift.'
        : direction === 'upward'
        ? 'Sustain the current momentum and identify leading contributors.'
        : 'Monitor for any emerging shifts over the next period.',
    evidence: [
      `Start: ${formatNumber(first)}`,
      `End: ${formatNumber(last)}`,
      percentLabel ? `Net change: ${percentLabel}` : `Net change: ${formatNumber(delta)}`,
    ],
  };
};

export default {
  id: 'trend',
  label: 'Trend Summary',
  analyze,
};
