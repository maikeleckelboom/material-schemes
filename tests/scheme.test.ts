import { describe, expect, it } from 'vitest';
import {
  CMF_SUPPORTED,
  MATERIAL_REQUIRED_COLOR_ROLES,
  createColorScheme,
  createCssVariables,
  createScheme,
} from '../src';

describe('createScheme', () => {
  it('generates every required Material role for the default spec', () => {
    const scheme = createScheme('#6750a4');
    const colorScheme = createColorScheme(scheme);

    for (const role of MATERIAL_REQUIRED_COLOR_ROLES) {
      expect(colorScheme[role]).toEqual(expect.any(Number));
    }

    expect(scheme.specVersion).toBe('2021');
    expect(scheme.platform).toBe('phone');
  });

  it('supports specVersion and platform when constructing dynamic schemes', () => {
    const scheme = createScheme('#6750a4', {
      specVersion: '2025',
      platform: 'watch',
    });

    expect(scheme.specVersion).toBe('2025');
    expect(scheme.platform).toBe('watch');
  });

  it('includes optional dim roles for the 2025 spec without breaking CSS output', () => {
    const scheme = createScheme('#6750a4', { specVersion: '2025' });
    const colorScheme = createColorScheme(scheme);
    const css = createCssVariables(colorScheme, ':root');

    expect(colorScheme.primaryDim).toEqual(expect.any(Number));
    expect(colorScheme.secondaryDim).toEqual(expect.any(Number));
    expect(colorScheme.tertiaryDim).toEqual(expect.any(Number));
    expect(colorScheme.errorDim).toEqual(expect.any(Number));
    expect(css).toContain('--primary-dim:');
    expect(css).toContain('--error-dim:');
  });

  it('generates distinct light and dark role values', () => {
    const lightScheme = createScheme('#6750a4');
    const darkScheme = createScheme('#6750a4', { isDark: true });

    expect(createColorScheme(lightScheme).primary).not.toBe(createColorScheme(darkScheme).primary);
    expect(lightScheme.primaryPalette.tone(40)).toBe(darkScheme.primaryPalette.tone(40));
  });

  it('accepts one source color and rejects unsupported multi-source input', () => {
    expect(createScheme({ sourceColors: ['#6750a4'] }).sourceColorArgb).toBe(0xff6750a4);

    expect(() =>
      createScheme({
        sourceColors: ['#6750a4', '#ff0000'],
      }),
    ).toThrow(/Multiple source colors are not supported/);
  });

  it('reports CMF as unavailable when the installed package does not publish SchemeCmf', () => {
    expect(CMF_SUPPORTED).toBe(false);
    expect(() =>
      createScheme({
        sourceColor: '#6750a4',
        variant: 'cmf',
      }),
    ).toThrow(/CMF is not available/);
  });
});
