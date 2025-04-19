import {describe, expect, it} from 'vitest';
import {TonalPalette} from '@material/material-color-utilities';
import {
  ContrastLevel,
  DEFAULT_PALETTE_TONES,
  DynamicColorScheme,
  MaterialTheme,
  type MaterialThemeOptions,
  PaletteStyle
} from "../../src";

describe('MaterialTheme', () => {
  const BASE_OPTIONS = {
    sourceColor: 0xff0000ff, // Blue in ARGB
    contrastLevel: ContrastLevel.Medium.value
  } satisfies MaterialThemeOptions;

  it('should initialize with default values', () => {
    const theme = new MaterialTheme({
      ...BASE_OPTIONS,
      contrastLevel: ContrastLevel.Medium.value,
      style: 'TonalSpot',
    });

    expect(theme.sourceColor).toBe(BASE_OPTIONS.sourceColor);
    expect(theme.contrastLevel).toBe(0.5);
    expect(theme.style).toBe(PaletteStyle.TonalSpot);
    expect(theme.customColors).toHaveLength(0);
  });

  it('should create light and dark schemes', () => {
    const theme = new MaterialTheme(BASE_OPTIONS);

    expect(theme.schemes.light).toBeInstanceOf(DynamicColorScheme);
    expect(theme.schemes.dark).toBeInstanceOf(DynamicColorScheme);
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
      customColors: [
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
    const theme = new MaterialTheme({
      ...BASE_OPTIONS,
      style: PaletteStyle.Vibrant
    });

    expect(theme.style).toBe(PaletteStyle.Vibrant);
    expect(theme.schemes.light.variant).toBe(PaletteStyle.Vibrant.value);
    expect(theme.schemes.dark.variant).toBe(PaletteStyle.Vibrant.value);
  });

  it('should handle toColorScheme', () => {
    const theme = new MaterialTheme(BASE_OPTIONS);
    const lightScheme = theme.schemes.light.toJSON();
    const darkScheme = theme.schemes.dark.toJSON();

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
      customColors: [
        {name: 'brand', value: 0x00ff00ff},
        {name: 'quaternary', value: 0xffffffff}
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

    const assertColorProperties = (colorName: string) => {
      const baseKeys = [
        colorName,
        `on${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`,
        `${colorName}Container`,
        `on${colorName.charAt(0).toUpperCase() + colorName.slice(1)}Container`
      ];

      DEFAULT_PALETTE_TONES.forEach(tone => {
        expect(themeColorScheme[`${colorName}${tone}`]).toBeDefined();
        expect(themeColorScheme[`brand${tone}`]).toBeDefined();
        expect(themeColorScheme[`quaternary${tone}`]).toBeDefined();
      })

      baseKeys.forEach(baseKey => {
        ['Light', 'Dark'].forEach(variant => {
          expect(themeColorScheme[`${baseKey}${variant}`]).toBeDefined();
        });
      });
    };


    theme.customColors.forEach(color => {
      assertColorProperties(color.color.name);
    });
  });

  it('should serialize to JSON with palettes', () => {
    const theme = new MaterialTheme({
      ...BASE_OPTIONS,
      customColors: [
        {
          name: 'brand-blended',
          value: 0x00ff00ff,
          blend: true,
        },
        {
          name: 'brand-unblended',
          value: 0x00ff00ff,
        },
      ]
    });

    const themeJSON = theme.toJSON();
    expect(themeJSON.sourceColor).toBe(BASE_OPTIONS.sourceColor);
    expect(themeJSON.contrastLevel).toBe(0.5);
    expect(themeJSON.style).toBe(PaletteStyle.TonalSpot.name);
    expect(themeJSON.schemes.light.primaryPaletteKeyColor).toBeDefined();
    expect(themeJSON.schemes.dark.primaryPaletteKeyColor).toBeDefined();
  });


});
