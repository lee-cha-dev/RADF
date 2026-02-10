/**
 * @fileoverview Vitest coverage for widget manifest validation.
 */

import { describe, expect, it } from 'vitest';
import { validateManifestCoverage } from '../authoring/manifestValidation.js';

describe('manifestValidation', () => {
  it('reports full coverage for supported widgets', () => {
    const result = validateManifestCoverage();
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
