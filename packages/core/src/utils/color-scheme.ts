import type {CustomColorGroup, TonalPalette} from '@material/material-color-utilities';
import type {Color, ColorScheme, ColorSchemeOptions, ColorSchemeReturnType} from '../types';
import {createPalette, formatColorToken, formatTokenName} from '../utils';
import {COLOR_ROLES, DEFAULT_PALETTE_TONES} from "../constants";
import {DynamicColorScheme, DynamicMaterialTheme} from "../theme";

/**
 * Generates a color scheme fromName a DynamicMaterialTheme or DynamicScheme.
 *
 * @template {boolean} [V=false] Indicates whether brightness variants are included
 * @param {DynamicMaterialTheme | DynamicColorScheme} source Color scheme source data
 * @param {ColorSchemeOptions<V extends boolean>} [options] Configuration options
 * @returns {ColorSchemeReturnType<V extends boolean>} Color scheme with color tokens
 *
 * @example
 * // Basic usage with a theme
 * const scheme = generateColorScheme(theme);
 *
 * @example
 * // Dark mode with brightness variants
 * const scheme = generateColorScheme(theme, { dark: true, brightnessVariants: true });
 *
 * @example
 * // Custom color modification
 * const scheme = generateColorScheme(theme, {
 *   modifyColorScheme: colors => ({ ...colors, accent: 0x00FF00 })
 * });
 */
export function generateColorScheme<V extends boolean = false>(
  source: DynamicMaterialTheme,
  options?: ColorSchemeOptions<V>,
): ColorSchemeReturnType<V>;
export function generateColorScheme<V extends boolean = false>(
  source: DynamicColorScheme,
  options?: ColorSchemeOptions,
): ColorSchemeReturnType<V>;
export function generateColorScheme(
  source: DynamicMaterialTheme | DynamicColorScheme,
  options?: ColorSchemeOptions,
): ColorScheme {
  return 'schemes' in source
    ? extractSchemeFromTheme(source, options)
    : extractSchemeFromDynamic(source, options);
}

export function extractSchemeFromTheme(theme: DynamicMaterialTheme, options: ColorSchemeOptions = {}): ColorScheme {
  const {dark = false, brightnessVariants = false, modifyColorScheme} = options;
  const baseScheme = dark ? theme.schemes.dark : theme.schemes.light;
  const scheme: ColorScheme = {};

  if (options.paletteTones) {
    const tones = Array.isArray(options.paletteTones) ? options.paletteTones : [...DEFAULT_PALETTE_TONES];
    Object.assign(scheme, extractTonalPalettesFromTheme(theme, tones));
    for (const customColor of theme.customColorGroups) {
      const palette = createPalette(customColor.value);
      if (palette) {
        const paletteColors = generateToneMapFromPalette(palette, tones);
        Object.assign(scheme, generateTonalPaletteTokens(customColor.color.name, paletteColors));
      }
    }
  }

  Object.assign(
    scheme,
    createSchemeColorTokens(baseScheme),
    createTokensFromCustomColor(theme.customColorGroups, options),
  );

  if (brightnessVariants) {
    Object.assign(
      scheme,
      createSchemeColorTokens(theme.schemes.light, 'light'),
      createSchemeColorTokens(theme.schemes.dark, 'dark'),
    );
  }

  return modifyColorScheme?.(scheme) ?? scheme;
}

function extractSchemeFromDynamic(
  scheme: DynamicColorScheme,
  options?: ColorSchemeOptions,
): ColorScheme {
  return options?.modifyColorScheme?.(createSchemeColorTokens(scheme)) ?? createSchemeColorTokens(scheme);
}

export function createTokensFromCustomColor(
  customColorGroups: CustomColorGroup[],
  options: ColorSchemeOptions = {},
):ColorScheme {
  const customColors: ColorScheme[] = [];

  for (const customColor of customColorGroups) {
    const variants: { type: 'light' | 'dark'; suffix?: string }[] = [
      {type: options.dark ? 'dark' : 'light'},
    ];

    if (options.brightnessVariants) {
      variants.push({type: 'light', suffix: 'Light'}, {type: 'dark', suffix: 'Dark'});
    }

    const colorGroup: ColorScheme = {};

    for (const {type, suffix} of variants) {
      const colorVariant = customColor[type];
      for (const [pattern, value] of Object.entries(colorVariant)) {
        colorGroup[formatColorToken(pattern, customColor.color.name, suffix)] = value;
      }
    }

    customColors.push(colorGroup);
  }

  return Object.assign({}, ...customColors);
}

function createSchemeColorTokens(scheme: DynamicColorScheme, suffix?: string): ColorScheme {
  return COLOR_ROLES.reduce((acc, key) => {
    const colorName = formatTokenName(key, {suffix});
    acc[colorName] = scheme[key];
    return acc;
  }, {} as ColorScheme);
}

function extractTonalPalettesFromTheme(theme: DynamicMaterialTheme, tones?: number[]) {
  const tonalColors: Record<string, string> = {};
  for (const [paletteName, palette] of Object.entries(theme.palettes)) {
    const paletteColors = generateToneMapFromPalette(palette, tones);
    Object.assign(tonalColors, generateTonalPaletteTokens(paletteName, paletteColors));
  }
  for (const customColor of theme.customColorGroups) {
    const palette = createPalette(customColor.value);
    if (palette) {
      const paletteColors = generateToneMapFromPalette(palette, tones);
      Object.assign(tonalColors, generateTonalPaletteTokens(customColor.color.name, paletteColors));
    }
  }
  return tonalColors;
}

export function generateToneMapFromPalette(palette: TonalPalette, tones?: number[]): Record<number, Color> {
  const paletteTones = tones ?? DEFAULT_PALETTE_TONES;
  return Object.fromEntries(paletteTones.map((tone) => [tone, palette.tone(tone)]));
}

export function generateTonalPaletteTokens(
  paletteName: string,
  paletteColors: Record<number, Color>,
) {
  const tonalKeys: Record<string, Color> = {};
  for (const [tone, color] of Object.entries(paletteColors)) {
    const key = formatTokenName(paletteName, {suffix: tone});
    tonalKeys[key] = color;
  }
  return tonalKeys;
}
