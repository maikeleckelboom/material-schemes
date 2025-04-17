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
    contrastLevel: ContrastLevel.Medium.value
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
    expect(theme.customColorGroups).toHaveLength(0);
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

    expect(theme.customColorGroups).toHaveLength(1);
    expect(theme.customColorGroups[0]?.color.name).toBe('brand');
    expect(theme.customColorGroups[0]?.color.value).toBe(0x00ff00ff);
  });


  it('should handle different styles', () => {
    const theme = new DynamicMaterialTheme({
      ...BASE_OPTIONS,
      style: PaletteStyle.Vibrant
    });

    expect(theme.style).toBe(PaletteStyle.Vibrant);
    expect(theme.schemes.light.variant).toBe(PaletteStyle.Vibrant.value);
    expect(theme.schemes.dark.variant).toBe(PaletteStyle.Vibrant.value);
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
  it('should apply blending for custom colors when blend flag is true', () => {
    // Create the theme instance with both blended and unblended static colors.
    const theme = new DynamicMaterialTheme({
      ...BASE_OPTIONS,
      staticColors: [
        {
          name: 'brand-blended',
          value: 0x00ff00ff, // arbitrary ARGB value
          blend: true,
        },
        {
          name: 'brand-unblended',
          value: 0x00ff00ff, // same starting value
        },
      ],
    });

    // Convert the theme to a JSON object.
    const themeJSON = theme.toJSON();

    // Retrieve the computed palettes for each custom color.
    // It is assumed that your theme object offers a getter like getCustomColor(name)
    // that returns an object with a `palette` property.
    // @ts-ignore
    const blendedColor = themeJSON.palettes.brandBlended;
    // @ts-ignore
    const unblendedColor = themeJSON.palettes.brandUnblended;

    const blendedPalette = blendedColor['20'];
    const unblendedPalette = unblendedColor['20'];
    const blendedPalette100 = blendedColor['80'];
    const unblendedPalette100 = unblendedColor['80'];

    // Check that the endpoint values (commonly at key '20' and '80') remain unchanged.
    expect(blendedPalette).toBeDefined();
    expect(unblendedPalette).toBeDefined();
    expect(blendedPalette100).toBeDefined();
    expect(unblendedPalette100).toBeDefined();
    // Verify that at least one intermediate stop has been modified due to blending.
    // You can check one or multiple keys; here we check keys '5' and '50'
    // for the blended color.
    expect(blendedColor['5']).not.toEqual(unblendedColor['5']);
    expect(blendedColor['50']).not.toEqual(unblendedColor['50']);
    expect(blendedColor['95']).not.toEqual(unblendedColor['95']);

  });
  // toJSON
  it('should serialize to JSON with palettes', () => {
    const theme = new DynamicMaterialTheme({
      ...BASE_OPTIONS,
      staticColors: [
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
