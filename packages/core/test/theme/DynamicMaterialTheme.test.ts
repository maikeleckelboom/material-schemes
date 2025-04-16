import {describe, expect, it} from 'vitest';
import {TonalPalette} from '@material/material-color-utilities';
import {
  ContrastLevel,
  DynamicColorScheme,
  DynamicMaterialTheme,
  type MaterialThemeOptions,
  PaletteStyle
} from "../../src";

describe('DynamicMaterialTheme', () => {
  const BASE_OPTIONS = {
    sourceColor: 0xff0000ff, // Blue in ARGB
    staticColors: [],
  } satisfies MaterialThemeOptions;

  it('should initialize with default values', () => {
    const theme = new DynamicMaterialTheme({
      ...BASE_OPTIONS,
      contrastLevel: ContrastLevel.Medium.value,
      style: PaletteStyle.TonalSpot,
    });

    expect(theme.sourceColor).toBe(BASE_OPTIONS.sourceColor);
    expect(theme.contrastLevel).toBe(0.5);
    expect(theme.style).toBe(PaletteStyle.TonalSpot);
    expect(theme.customColors).toHaveLength(0);
  });

  it('should create light and dark schemes', () => {
    const theme = new DynamicMaterialTheme(BASE_OPTIONS);

    expect(theme.schemes.light).toBeInstanceOf(DynamicColorScheme);
    expect(theme.schemes.dark).toBeInstanceOf(DynamicColorScheme);
    expect(theme.schemes.light.isDark).toBe(false);
    expect(theme.schemes.dark.isDark).toBe(true);
  });

  it('should initialize tonal palettes', () => {
    const theme = new DynamicMaterialTheme(BASE_OPTIONS);

    expect(theme.palettes.primary).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.secondary).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.tertiary).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.neutral).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.neutralVariant).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.error).toBeInstanceOf(TonalPalette);
  });

  it('should handle custom colors', () => {
    const theme = new DynamicMaterialTheme({
      ...BASE_OPTIONS,
      staticColors: [
        {
          name: 'brand',
          value: 0x00ff00ff,
          blend: true,
        }
      ]
    });

    expect(theme.customColors).toHaveLength(1);
    expect(theme.customColors[0]?.color.name).toBe('brand');
    expect(theme.customColors[0]?.color.value).toBe(0x00ff00ff);
  });


  it('should handle different styles', () => {
    const theme = new DynamicMaterialTheme({
      ...BASE_OPTIONS,
      style: PaletteStyle.Vibrant
    });

    expect(theme.style).toBe(PaletteStyle.Vibrant);
    expect(theme.schemes.light.variant).toBe(PaletteStyle.Vibrant.ordinal);
    expect(theme.schemes.dark.variant).toBe(PaletteStyle.Vibrant.ordinal);
  });

  it('should handle toColorScheme', () => {
    const theme = new DynamicMaterialTheme(BASE_OPTIONS);
    const lightScheme = theme.schemes.light.toColorScheme();
    const darkScheme = theme.schemes.dark.toColorScheme();

    expect(lightScheme?.primaryPaletteKeyColor).toEqual(darkScheme?.primaryPaletteKeyColor);
    expect(lightScheme?.secondaryPaletteKeyColor).toEqual(darkScheme?.secondaryPaletteKeyColor);
    expect(lightScheme?.tertiaryPaletteKeyColor).toEqual(darkScheme?.tertiaryPaletteKeyColor);
    expect(lightScheme?.neutralPaletteKeyColor).toEqual(darkScheme?.neutralPaletteKeyColor);
    expect(lightScheme?.neutralVariantPaletteKeyColor).toEqual(darkScheme?.neutralVariantPaletteKeyColor);

    expect(lightScheme?.primary).not.toEqual(darkScheme?.primary);
    expect(lightScheme?.secondary).not.toEqual(darkScheme?.secondary);
    expect(lightScheme?.tertiary).not.toEqual(darkScheme?.tertiary);

  });


  // test the toJSON
  it('should serialize to JSON with custom colors', () => {
    const theme = new DynamicMaterialTheme({
      ...BASE_OPTIONS,
      staticColors: [
        {
          name: 'brand',
          value: 0x00ff00ff,
          blend: true,
        },
        {
          name: 'quaternary',
          value: 0xffffffff
        }
      ]
    });

    const themeColorScheme = theme.toColorScheme({
      brightnessVariants: true,
      paletteTones: true,
      modifyColorScheme: (scheme) => ({
        ...scheme,
        tertiary: scheme.primaryDark
      })
    });
    expect(themeColorScheme.tertiary).toBe(themeColorScheme.primaryDark);
    expect(themeColorScheme.quaternary).toBeDefined();
    expect(themeColorScheme.onQuaternary).toBeDefined();
    expect(themeColorScheme.quaternaryContainer).toBeDefined();
    expect(themeColorScheme.onQuaternaryContainer).toBeDefined();
  });
});
