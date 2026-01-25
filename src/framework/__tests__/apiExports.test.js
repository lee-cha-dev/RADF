import { describe, it, expect } from 'vitest';
import * as radf from '../../index.js';

describe('public API exports', () => {
  it('exposes core dashboard building blocks', () => {
    expect(radf.DashboardProvider).toBeDefined();
    expect(radf.GridLayout).toBeDefined();
  });

  it('exposes query helpers and hooks', () => {
    expect(typeof radf.useQuery).toBe('function');
    expect(typeof radf.buildQuerySpec).toBe('function');
  });
});
