const TELEMETRY_KEY = 'lazyDashboards.telemetryOptIn';
const TELEMETRY_BUFFER_KEY = '__lazyDashboardsTelemetry';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage || null;
};

export const isTelemetryEnabled = () => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }
  return storage.getItem(TELEMETRY_KEY) === 'true';
};

export const setTelemetryEnabled = (enabled) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(TELEMETRY_KEY, enabled ? 'true' : 'false');
};

export const trackTelemetryEvent = (eventName, payload = {}) => {
  if (!eventName || !isTelemetryEnabled()) {
    return false;
  }
  const event = {
    eventName,
    payload,
    timestamp: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    if (!window[TELEMETRY_BUFFER_KEY]) {
      window[TELEMETRY_BUFFER_KEY] = [];
    }
    window[TELEMETRY_BUFFER_KEY].push(event);
  }
  if (typeof console !== 'undefined' && console.info) {
    console.info('[LazyDashboards telemetry]', event);
  }
  return true;
};
