import {describe, expect, it} from 'vitest';
import {TonalPalette} from '@material/material-color-utilities';
import {
  ContrastLevel,
  MaterialDynamicScheme,
  MaterialTheme,
  type MaterialThemeOptions,
  PaletteStyle,
} from "../../src";
import {DEFAULT_PALETTE_TONES} from "../../src/constants/defaults.ts";

describe('MaterialTheme', () => {
  const BASE_OPTIONS = {
    sourceColor: 0xff0000ff, // Blue in ARGB
    contrastLevel: ContrastLevel.Medium.value,
    style: 'TonalSpot' // Add default style
  } satisfies MaterialThemeOptions;

  it('should initialize with default Values', () => {
    const theme = new MaterialTheme({
      ...BASE_OPTIONS,
      contrastLevel: ContrastLevel.Medium.value,
      style: 'TonalSpot',
    });

    expect(theme.sourceColorArgb).toBe(BASE_OPTIONS.sourceColor);
    expect(theme.contrastLevel).toBe(0.5);
    expect(theme.style.name).toBe(PaletteStyle.TonalSpot.name);
    expect(theme.extendedColors).toHaveLength(0);
  });

  it('should create light and dark schemes', () => {
    const theme = new MaterialTheme(BASE_OPTIONS);

    expect(theme.schemes.light).toBeInstanceOf(MaterialDynamicScheme);
    expect(theme.schemes.dark).toBeInstanceOf(MaterialDynamicScheme);
    expect(theme.schemes.light.isDark).toBe(false);
    expect(theme.schemes.dark.isDark).toBe(true);
  });

  it('should initialize tonal palettes', () => {
    const theme = new MaterialTheme(BASE_OPTIONS);

    expect(theme.palettes.primary).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.secondary).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.tertiary).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.neutral).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.neutralVariant).toBeInstanceOf(TonalPalette);
    expect(theme.palettes.error).toBeInstanceOf(TonalPalette);
  });

  it('should handle custom colors', () => {
    const theme = new MaterialTheme({
      ...BASE_OPTIONS,
      extendedColors: [
        {
          name: 'brand',
          value: 0x00ff00ff,
          blend: true,
        }
      ]
    });

    expect(theme.extendedColors).toHaveLength(1);
    expect(theme.extendedColors[0]?.color.name).toBe('brand');
    expect(theme.extendedColors[0]?.color.value).toBe(0x00ff00ff);
  });


  it('should handle different styles', () => {
    const theme = new MaterialTheme({
      ...BASE_OPTIONS,
      style: PaletteStyle.Vibrant
    });

    expect(theme.style).toBe(PaletteStyle.Vibrant);
    expect(theme.schemes.light.variant).toBe(PaletteStyle.Vibrant.value);
    expect(theme.schemes.dark.variant).toBe(PaletteStyle.Vibrant.value);
  });

  it('should handle createColorScheme', () => {
    const theme = new MaterialTheme(BASE_OPTIONS);
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


  it('should serialize to JSON with custom colors', () => {
    const theme = new MaterialTheme({
      ...BASE_OPTIONS,
      extendedColors: [
        {name: 'brand', value: 0x00ff00ff},
        {name: 'quaternary', value: 0xffffffff}
      ]
    });

    const colorScheme = theme.toColorScheme({
      brightnessVariants: true,
      paletteTones: true,
      modifyColorScheme: (scheme) => ({
        ...scheme,
        tertiary: scheme.primaryDark,
        test: '#000000',
      })
    });

    expect(colorScheme.tertiary).toBe(colorScheme.primaryDark);
    expect(colorScheme.test).toBe('#000000');

    const assertColorProperties = (colorName: string) => {
      const baseKeys = [
        colorName,
        `on${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`,
        `${colorName}Container`,
        `on${colorName.charAt(0).toUpperCase() + colorName.slice(1)}Container`
      ];

      DEFAULT_PALETTE_TONES.forEach(tone => {
        expect(colorScheme[`${colorName}${tone}`]).toBeDefined();
        expect(colorScheme[`brand${tone}`]).toBeDefined();
        expect(colorScheme[`quaternary${tone}`]).toBeDefined();
      })

      baseKeys.forEach(baseKey => {
        ['Light', 'Dark'].forEach(variant => {
          expect(colorScheme[`${baseKey}${variant}`]).toBeDefined();
        });
      });
    };

    theme.extendedColors.forEach(color => {
      assertColorProperties(color.color.name);
    });
  });
});
