import { describe, expect, it } from 'vitest';
import * as api from '../src';

describe('public API', () => {
  it('exports only the narrow first-release runtime surface', () => {
    expect(Object.keys(api).sort()).toEqual(['createSchemes', 'toCss']);
  });
});
