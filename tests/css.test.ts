import { describe, expect, it } from 'vitest';
import { createCssVarMap, createCssVariables, serializeCssVarMap } from '../src';

describe('CSS variables', () => {
  it('maps color roles to kebab-case CSS variables with hex values', () => {
    const map = createCssVarMap({
      primary: 0xffff5733,
      onPrimary: 0xffffffff,
    });

    expect(map).toEqual({
      '--primary': '#ff5733',
      '--on-primary': '#ffffff',
    });
  });

  it('serializes CSS variables with and without selectors', () => {
    const map = {
      '--primary': '#ff5733',
      '--on-primary': '#ffffff',
    } as const;

    expect(serializeCssVarMap(map)).toBe('--primary: #ff5733;\n--on-primary: #ffffff;');
    expect(serializeCssVarMap(map, { selector: ':root', minify: true })).toBe(
      ':root{--primary: #ff5733; --on-primary: #ffffff;}',
    );
  });

  it('creates CSS variables directly from a color scheme', () => {
    const css = createCssVariables(
      {
        primary: 0xffff5733,
        onPrimary: 0xffffffff,
      },
      ':root',
    );

    expect(css).toContain(':root');
    expect(css).toContain('--primary: #ff5733;');
    expect(css).toContain('--on-primary: #ffffff;');
  });
});
