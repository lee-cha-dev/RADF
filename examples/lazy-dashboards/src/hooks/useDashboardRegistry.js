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
      touch,
      getById,
    ]
  );
};

export default useDashboardRegistry;
