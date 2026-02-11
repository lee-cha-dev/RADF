import { describe, expect, it } from 'vitest';
import { createRegistry } from '../../core/registry/registry.js';

describe('registry utilities', () => {
  it('registers and lists components', () => {
    const registry = createRegistry('testRegistry');

    const component = () => null;
    registry.register('alpha', component);

    expect(registry.get('alpha')).toBe(component);
    expect(registry.has('alpha')).toBe(true);
    expect(registry.list()).toEqual(['alpha']);
  });

  it('throws on invalid registration', () => {
    const registry = createRegistry('testRegistry');

    expect(() => registry.register('', () => null)).toThrow(/key is required/);
    expect(() => registry.register('beta', null)).toThrow(/component is required/);
  });
});
