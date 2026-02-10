import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  STORAGE_KEY,
  createDashboard,
  deleteDashboard,
  duplicateDashboard,
  getDashboard,
  listDashboards,
  renameDashboard,
  touchDashboard,
  updateDashboard,
} from '../data/dashboardRegistry.js';
import { deleteDashboardAndCleanup } from '../data/dashboardCleanup.js';

/**
 * @typedef {Object} DashboardRecord
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [updatedAt]
 * @property {Object} [authoringModel]
 * @property {Object} [datasetBinding]
 * @property {Object} [compiledConfig]
 */

/**
 * @typedef {Object} DashboardCleanupResult
 * @property {boolean} success
 * @property {boolean} [syncAttempted]
 * @property {boolean} [syncRemoved]
 */

/**
 * @typedef {Object} DashboardRegistryApi
 * @property {DashboardRecord[]} dashboards - The current dashboard list.
 * @property {() => void} refresh - The manual refresh helper.
 * @property {(payload: Object) => DashboardRecord} createDashboard - The dashboard creator.
 * @property {(id: string, updates: Object) => DashboardRecord} updateDashboard - The dashboard updater.
 * @property {(id: string, name: string) => DashboardRecord} renameDashboard - The dashboard rename helper.
 * @property {(id: string) => DashboardRecord} duplicateDashboard - The dashboard duplication helper.
 * @property {(id: string) => boolean} deleteDashboard - The dashboard deletion helper.
 * @property {(dashboard: DashboardRecord, options?: Object) => Promise<DashboardCleanupResult>} deleteDashboardAndCleanup - The deletion helper that also cleans up exports.
 * @property {(id: string) => DashboardRecord} touchDashboard - The dashboard timestamp updater.
 * @property {(id: string) => (DashboardRecord|null)} getDashboardById - The dashboard lookup helper.
 */

/**
 * Provides CRUD helpers and live state for dashboards stored in local storage.
 *
 * Side effects: listens for `storage` changes so other tabs update automatically.
 *
 * @returns {DashboardRegistryApi} The dashboard registry API.
 */
const useDashboardRegistry = () => {
  const [dashboards, setDashboards] = useState(() => listDashboards());

  const refresh = useCallback(() => {
    setDashboards(listDashboards());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  const create = useCallback(
    (payload) => {
      const record = createDashboard(payload);
      refresh();
      return record;
    },
    [refresh]
  );

  const update = useCallback(
    (id, updates) => {
      const record = updateDashboard(id, updates);
      refresh();
      return record;
    },
    [refresh]
  );

  const rename = useCallback(
    (id, name) => {
      const record = renameDashboard(id, name);
      refresh();
      return record;
    },
    [refresh]
  );

  const duplicate = useCallback(
    (id) => {
      const record = duplicateDashboard(id);
      refresh();
      return record;
    },
    [refresh]
  );

  const remove = useCallback(
    (id) => {
      const success = deleteDashboard(id);
      refresh();
      return success;
    },
    [refresh]
  );

  const removeWithCleanup = useCallback(
    async (dashboard, options) => {
      const result = await deleteDashboardAndCleanup(dashboard, options);
      refresh();
      return result;
    },
    [refresh]
  );

  const touch = useCallback(
    (id) => {
      const record = touchDashboard(id);
      refresh();
      return record;
    },
    [refresh]
  );

  const getById = useCallback(
    (id) => getDashboard(id),
    []
  );

  return useMemo(
    () => ({
      dashboards,
      refresh,
      createDashboard: create,
      updateDashboard: update,
      renameDashboard: rename,
      duplicateDashboard: duplicate,
      deleteDashboard: remove,
      deleteDashboardAndCleanup: removeWithCleanup,
      touchDashboard: touch,
      getDashboardById: getById,
    }),
    [
      dashboards,
      refresh,
      create,
      update,
      rename,
      duplicate,
      remove,
      removeWithCleanup,
      touch,
      getById,
    ]
  );
};

export default useDashboardRegistry;
