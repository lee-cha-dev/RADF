import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  createDashboard,
  deleteDashboard,
  duplicateDashboard,
  getDashboard,
  listDashboards,
  renameDashboard,
  updateDashboard,
} from '../data/dashboardRegistry.js';

describe('dashboardRegistry', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates, updates, duplicates, and deletes dashboards with timestamps', () => {
    const created = createDashboard({ name: 'Ops Board' });
    expect(created.id).toMatch(/ops-board/);
    expect(created.createdAt).toBe('2024-02-01T00:00:00.000Z');
    expect(created.updatedAt).toBe('2024-02-01T00:00:00.000Z');
    expect(created.authoringModel.schemaVersion).toBe(1);

    vi.advanceTimersByTime(1000);
    const renamed = renameDashboard(created.id, 'Ops Board Updated');
    expect(renamed.name).toBe('Ops Board Updated');
    expect(renamed.updatedAt).toBe('2024-02-01T00:00:01.000Z');

    const duplicated = duplicateDashboard(created.id);
    expect(duplicated.id).not.toBe(created.id);
    expect(duplicated.name).toContain('Copy');

    const updated = updateDashboard(created.id, {
      description: 'Updated description',
    });
    expect(updated.description).toBe('Updated description');

    expect(deleteDashboard(created.id)).toBe(true);
    expect(getDashboard(created.id)).toBeNull();
  });

  it('normalizes older authoring models missing schemaVersion', () => {
    const legacy = {
      dashboards: [
        {
          id: 'legacy-1',
          name: 'Legacy',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
          authoringModel: {
            meta: { title: 'Legacy' },
            widgets: [],
          },
        },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const dashboards = listDashboards();
    expect(dashboards[0].authoringModel.schemaVersion).toBe(1);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.dashboards[0].authoringModel.schemaVersion).toBe(1);
  });
});
