import { getDashboardExportNames } from './dashboardExport.js';
import { deleteDashboard } from './dashboardRegistry.js';
import {
  getSyncEnabled,
  isFileSystemAccessSupported,
  loadCustomDashboardsDirectory,
  removeDashboardExportFromDirectory,
} from './fileSystemSync.js';

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
