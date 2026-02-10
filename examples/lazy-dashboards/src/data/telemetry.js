const TELEMETRY_KEY = 'lazyDashboards.telemetryOptIn';
const TELEMETRY_BUFFER_KEY = '__lazyDashboardsTelemetry';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage || null;
};

/**
 * Checks whether telemetry is enabled.
 *
 * @returns {boolean} True when telemetry is enabled.
 */
export const isTelemetryEnabled = () => {
  const storage = getStorage();
  if (!storage) {
    return false;
  }
  return storage.getItem(TELEMETRY_KEY) === 'true';
};

/**
 * Sets the telemetry opt-in preference.
 *
 * @param {boolean} enabled
 * @returns {void}
 */
export const setTelemetryEnabled = (enabled) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  storage.setItem(TELEMETRY_KEY, enabled ? 'true' : 'false');
};

/**
 * Tracks a telemetry event in local buffer and console.
 *
 * @param {string} eventName
 * @param {Object} [payload]
 * @returns {boolean} True when the event was recorded.
 */
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
