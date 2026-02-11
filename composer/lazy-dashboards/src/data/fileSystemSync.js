const DB_NAME = 'lazy-dashboards-fs';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'customDashboardsRoot';
const SYNC_PREF_KEY = 'lazyDashboards.syncEnabled';

/**
 * @typedef {Object} DashboardExportPlan
 * @property {string} folderName
 * @property {Object<string, string>} files
 */

const openDatabase = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readHandle = async () => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(HANDLE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

const writeHandle = async (handle) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(handle, HANDLE_KEY);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

const clearHandle = async () => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(HANDLE_KEY);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

const verifyPermission = async (handle) => {
  if (!handle) {
    return false;
  }
  const options = { mode: 'readwrite' };
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }
  return (await handle.requestPermission(options)) === 'granted';
};

const ensureDirectory = async (root, name) =>
  root.getDirectoryHandle(name, { create: true });

const ensureFile = async (root, name) =>
  root.getFileHandle(name, { create: true });

const writeFile = async (directoryHandle, name, contents) => {
  const fileHandle = await ensureFile(directoryHandle, name);
  const writable = await fileHandle.createWritable();
  await writable.write(contents || '');
  await writable.close();
};

/**
 * Detects whether the File System Access API is available.
 *
 * @returns {boolean} True when the API is supported.
 */
export const isFileSystemAccessSupported = () =>
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

/**
 * Reads the stored sync preference.
 *
 * @returns {boolean} True when sync is enabled.
 */
export const getSyncEnabled = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(SYNC_PREF_KEY) === 'true';
};

/**
 * Persists the sync preference.
 *
 * @param {boolean} enabled
 * @returns {void}
 */
export const setSyncEnabled = (enabled) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SYNC_PREF_KEY, enabled ? 'true' : 'false');
};

/**
 * Prompts the user to pick a custom dashboards directory.
 *
 * @returns {Promise<FileSystemDirectoryHandle|null>} The selected handle.
 */
export const requestCustomDashboardsDirectory = async () => {
  if (!isFileSystemAccessSupported()) {
    return null;
  }
  const handle = await window.showDirectoryPicker({
    id: 'lazy-dashboards-export',
    mode: 'readwrite',
  });
  if (handle) {
    await writeHandle(handle);
  }
  return handle || null;
};

/**
 * Loads the previously selected dashboards directory, if still authorized.
 *
 * @returns {Promise<FileSystemDirectoryHandle|null>} The stored handle.
 */
export const loadCustomDashboardsDirectory = async () => {
  try {
    const handle = await readHandle();
    if (!handle) {
      return null;
    }
    const permitted = await verifyPermission(handle);
    return permitted ? handle : null;
  } catch {
    return null;
  }
};

/**
 * Clears the stored dashboards directory handle.
 *
 * @returns {Promise<void>}
 */
export const clearCustomDashboardsDirectory = async () => {
  await clearHandle();
};

/**
 * Writes an export plan to the selected directory.
 *
 * @param {DashboardExportPlan} exportPlan
 * @param {FileSystemDirectoryHandle} baseHandle
 * @returns {Promise<boolean>} True when the write completes.
 * @throws {Error} When permission is denied.
 */
export const writeDashboardExportToDirectory = async (exportPlan, baseHandle) => {
  if (!exportPlan || !baseHandle) {
    return false;
  }
  const permitted = await verifyPermission(baseHandle);
  if (!permitted) {
    throw new Error('Permission denied for the selected directory.');
  }
  const customRoot = await ensureDirectory(baseHandle, 'CustomDashboards');
  const dashboardRoot = await ensureDirectory(
    customRoot,
    exportPlan.folderName
  );
  const entries = Object.entries(exportPlan.files || {});
  for (let i = 0; i < entries.length; i += 1) {
    const [path, contents] = entries[i];
    const segments = path.split('/').filter(Boolean);
    const fileName = segments.pop();
    let targetDir = dashboardRoot;
    for (let j = 0; j < segments.length; j += 1) {
      targetDir = await ensureDirectory(targetDir, segments[j]);
    }
    await writeFile(targetDir, fileName, contents);
  }
  return true;
};

/**
 * Removes an exported dashboard folder from the selected directory.
 *
 * @param {string} folderName
 * @param {FileSystemDirectoryHandle} baseHandle
 * @returns {Promise<boolean>} True when the folder was removed.
 */
export const removeDashboardExportFromDirectory = async (
  folderName,
  baseHandle
) => {
  if (!folderName || !baseHandle) {
    return false;
  }
  const permitted = await verifyPermission(baseHandle);
  if (!permitted) {
    return false;
  }
  try {
    const customRoot = await ensureDirectory(baseHandle, 'CustomDashboards');
    await customRoot.removeEntry(folderName, { recursive: true });
    return true;
  } catch {
    return false;
  }
};
