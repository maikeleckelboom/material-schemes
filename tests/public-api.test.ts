import { describe, expect, it } from 'vitest';
import {
  ContrastLevel,
  PaletteStyle,
  Variant,
  createColorScheme,
  createPalette,
  createScheme,
  createTheme,
  getContrastRatio,
  getTonalContrastDelta,
  toArgb,
  toHex,
  toRgbaBytes,
} from '../src';

describe('public API', () => {
  it('exposes compact v0 factories and helpers', () => {
    const scheme = createScheme('#6750a4', {
      variant: Variant.TONAL_SPOT,
      contrastLevel: ContrastLevel.Default,
    });
    const theme = createTheme('#6750a4', { variant: PaletteStyle.TonalSpot });

    expect(createColorScheme(scheme).primary).toEqual(expect.any(Number));
    expect(createColorScheme(theme).primary).toEqual(expect.any(Number));
    expect(createPalette('#6750a4').tone(40)).toEqual(expect.any(Number));
    expect(toArgb('#6750a4')).toBe(0xff6750a4);
    expect(toHex(0xff6750a4)).toBe('#6750a4');
    expect(toRgbaBytes(0x806750a4)).toEqual({ a: 128, r: 103, g: 80, b: 164 });
    expect(getContrastRatio('#000000', '#ffffff')).toBeGreaterThan(20);
    expect(getTonalContrastDelta('#000000', '#ffffff')).toBeGreaterThan(99);
  });
});
