import { describe, expect, it } from 'vitest';
import { createSchemes, toCss } from '../src';
import type { MaterialScheme } from '../src';

describe('toCss', () => {
  it('serializes a Material scheme with fixed Material system CSS names', () => {
    const schemes = createSchemes({ sourceColor: '#6750a4' });
    const css = toCss(schemes.light, { selector: ':root' });

    expect(css).toContain(':root {');
    expect(css).toContain('  --md-sys-color-primary: ');
    expect(css).toContain('  --md-sys-color-on-primary: ');
    expect(css).toContain('  --md-sys-color-primary-palette-key-color: ');
    expect(css).not.toContain('--primary:');
  });

  it('rejects empty selectors', () => {
    const schemes = createSchemes({ sourceColor: '#6750a4' });

    expect(() => toCss(schemes.light, { selector: '' })).toThrow(
      /toCss requires a non-empty selector/,
    );
  });

  it('rejects unsupported roles instead of serializing arbitrary records', () => {
    const schemes = createSchemes({ sourceColor: '#6750a4' });
    const scheme = { ...schemes.light, success: '#2e7d32' } as unknown as MaterialScheme;

    expect(() => toCss(scheme, { selector: ':root' })).toThrow(/unsupported role: success/);
  });

  it('rejects missing required roles and non-canonical color values', () => {
    const schemes = createSchemes({ sourceColor: '#6750a4' });
    const missingPrimary = { ...schemes.light } as Record<string, string>;
    delete missingPrimary.primary;

    expect(() => toCss(missingPrimary as unknown as MaterialScheme, { selector: ':root' })).toThrow(
      /missing required role: primary/,
    );

    expect(() =>
      toCss({ ...schemes.light, primary: '#6750a4ff' } as unknown as MaterialScheme, {
        selector: ':root',
      }),
    ).toThrow(/primary must be a #RRGGBB hex color/);
  });
});
