const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const mergeDeep = (base = {}, patch = {}) => {
  if (!isPlainObject(base)) {
    return isPlainObject(patch) ? { ...patch } : patch;
  }
  if (!isPlainObject(patch)) {
    return { ...base };
  }
  const next = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(next[key])) {
      next[key] = mergeDeep(next[key], value);
    } else {
      next[key] = value;
    }
  });
  return next;
};

const getNestedValue = (target, path) => {
  if (!path) {
    return undefined;
  }
  const segments = path.split('.');
  let current = target;
  for (const segment of segments) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[segment];
  }
  return current;
};

const setNestedValue = (target = {}, path, value) => {
  if (!path) {
    return target;
  }
  const segments = path.split('.');
  const next = Array.isArray(target) ? [...target] : { ...(target || {}) };
  let cursor = next;
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }
    const existing = cursor[segment];
    const branch = isPlainObject(existing) ? { ...existing } : {};
    cursor[segment] = branch;
    cursor = branch;
  });
  return next;
};

const flattenOptionPaths = (value, prefix = '') => {
  if (Array.isArray(value) || !isPlainObject(value)) {
    return prefix ? [prefix] : [];
  }
  const paths = [];
  Object.entries(value).forEach(([key, nested]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(nested)) {
      paths.push(...flattenOptionPaths(nested, nextPrefix));
    } else {
      paths.push(nextPrefix);
    }
  });
  return paths;
};

export {
  flattenOptionPaths,
  getNestedValue,
  isPlainObject,
  mergeDeep,
  setNestedValue,
};
