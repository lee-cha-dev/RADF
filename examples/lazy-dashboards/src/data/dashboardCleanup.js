import { getDashboardExportNames } from './dashboardExport.js';
import { deleteDashboard } from './dashboardRegistry.js';
import {
  getSyncEnabled,
  isFileSystemAccessSupported,
  loadCustomDashboardsDirectory,
  removeDashboardExportFromDirectory,
} from './fileSystemSync.js';

/**
 * @typedef {Object} DashboardCleanupOptions
 * @property {boolean} [syncEnabled] - The override for sync preference.
 * @property {FileSystemDirectoryHandle} [syncHandle] - The directory handle to use.
 */

/**
 * @typedef {Object} DashboardCleanupResult
 * @property {boolean} success - The registry delete result.
 * @property {boolean} syncAttempted - The sync attempt flag.
 * @property {boolean} syncRemoved - The removal status from disk.
 */

/**
 * Deletes a dashboard from the registry and removes synced exports if enabled.
 *
 * @param {{ id?: string, name?: string, meta?: { title?: string } }} dashboard
 * @param {DashboardCleanupOptions} [options]
 * @returns {Promise<DashboardCleanupResult>} The deletion and sync outcome.
 */
export const deleteDashboardAndCleanup = async (dashboard, options = {}) => {
  if (!dashboard?.id) {
    return { success: false, syncAttempted: false, syncRemoved: false };
  }

  const syncEnabled =
    options.syncEnabled !== undefined ? options.syncEnabled : getSyncEnabled();
  let syncAttempted = false;
  let syncRemoved = false;

  if (syncEnabled && isFileSystemAccessSupported()) {
    syncAttempted = true;
    const handle =
      options.syncHandle || (await loadCustomDashboardsDirectory());
    if (handle) {
      const { folderName } = getDashboardExportNames(dashboard);
      syncRemoved = await removeDashboardExportFromDirectory(folderName, handle);
    }
  }

  const success = deleteDashboard(dashboard.id);
  return { success, syncAttempted, syncRemoved };
};
