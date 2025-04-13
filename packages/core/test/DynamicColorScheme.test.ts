import {DynamicColorScheme} from "../src/theme/DynamicColorScheme.ts";
import {PaletteStyle} from "../src/theme/PaletteStyle.ts";
import {Contrast} from "../src/theme/Contrast.ts";
import {describe, expect, it, test} from "vitest";

describe('DynamicColorScheme', () => {
  test('should initialize with default parameters when only sourceColor is provided', () => {
    const sourceColor = 0xFF6200EE;
    const scheme = new DynamicColorScheme({sourceColor});

    expect(scheme.sourceColorArgb).toBe(sourceColor);
    expect(scheme.isDark).toBe(false);
    expect(scheme.variant).toEqual(PaletteStyle.TonalSpot.variant);
    expect(scheme.contrastLevel).toBe(Contrast.Default.value);
  });

  test('should accept PaletteStyle id from style option', () => {
    const scheme = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      style: PaletteStyle.Expressive
    });
    expect(scheme.variant).toEqual(PaletteStyle.Expressive.variant);
  });

  test('should set isDark to true when provided', () => {
    const scheme = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      isDark: true
    });
    expect(scheme.isDark).toBe(true);
  });

  test('should use provided contrastLevel', () => {
    const contrastLevel = 0.7;
    const scheme = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      contrastLevel
    });
    expect(scheme.contrastLevel).toBe(contrastLevel);
  });

  test('should use provided PaletteStyle instance from style', () => {
    const style = PaletteStyle.Expressive;
    const scheme = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      style
    });
    expect(scheme.variant).toBe(style.variant);
  });

  test('should default contrastLevel to Contrast.Default.value', () => {
    const scheme = new DynamicColorScheme({
      sourceColor: 0xFF0000
    });
    expect(scheme.contrastLevel).toBe(Contrast.Default.value);
  });

  test('should accept any casing/format from style names', () => {
    const scheme1 = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      style: 'tonal-spot'
    });

    const scheme2 = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      style: 'tonalSpot'
    });

    const scheme3 = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      style: PaletteStyle.Expressive
    })

    expect(scheme1.variant).toEqual(PaletteStyle.TonalSpot.variant);
    expect(scheme2.variant).toEqual(PaletteStyle.TonalSpot.variant);
    expect(scheme3.variant).toEqual(PaletteStyle.Expressive.variant);
  });

  it('should accept sourceColor and options separately', () => {
    const scheme = new DynamicColorScheme(0xFF0000, {
      primary: 0xFF00FF,
      secondary: 0xFFFF00,
      tertiary: 0x00FFFF,
      neutral: 0xFFFFFF,
      neutralVariant: 0x000000,
    });

    expect(scheme.sourceColorArgb).toBeDefined()
  })

  it('should accept options object', () => {
    const scheme = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      primary: 0xFF00FF,
      secondary: 0xFFFF00,
      tertiary: 0x00FFFF,
      neutral: 0xFFFFFF,
      neutralVariant: 0x000000,
    });
    expect(scheme.sourceColorArgb).toBeDefined()
  })

  it('should return a ColorScheme object with correct properties', () => {
    const scheme = new DynamicColorScheme({
      sourceColor: 0xFF0000,
      primary: 0xFF00FF,
      secondary: 0xFFFF00,
      tertiary: 0x00FFFF,
      neutral: 0xFFFFFF,
      neutralVariant: 0x000000,
    });

    const colorScheme = scheme.toJSON();
    expect(colorScheme).toHaveProperty('primaryPaletteKeyColor');
    expect(colorScheme).toHaveProperty('secondaryPaletteKeyColor');
    expect(colorScheme).toHaveProperty('tertiaryPaletteKeyColor');
    expect(colorScheme).toHaveProperty('neutralPaletteKeyColor');
    expect(colorScheme).toHaveProperty('neutralVariantPaletteKeyColor');
  });
})

