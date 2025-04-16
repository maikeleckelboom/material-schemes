import {DynamicScheme} from '@material/material-color-utilities';
import type {Color, ColorScheme, ColorSchemeOptions, ColorSchemeReturnType, MaterialTheme} from '../types';
import {formatColorToken, formatTokenName} from '../utils';
import {getColorsFromPalette} from './palette.ts';
import {COLOR_ROLES, DEFAULT_PALETTE_TONES} from "../constants";

/**
 * Generates a color scheme from a MaterialTheme or DynamicScheme, supporting dark mode,
 * brightness variants, and custom color modifications.
 *
 * @template {boolean} [V=false] Whether brightness variants are included
 * @param {MaterialTheme | DynamicScheme} source Color scheme source data
 * @param {ColorSchemeOptions<V extends boolean>} [options] Configuration options
 * @returns {ColorSchemeReturnType<V extends boolean>} Color scheme with numeric color values
 *
 * @example
 * // Basic usage with a theme
 * const scheme = createColorScheme(theme);
 *
 * @example
 * // Dark mode with brightness variants
 * const scheme = createColorScheme(theme, { dark: true, brightnessVariants: true });
 *
 * @example
 * // Custom color modification
 * const scheme = createColorScheme(theme, {
 *   modifyColorScheme: colors => ({ ...colors, accent: 0x00FF00 })
 * });
 */
export function createColorScheme<V extends boolean = false>(
  source: MaterialTheme,
  options?: ColorSchemeOptions<V>,
): ColorSchemeReturnType<V>;
export function createColorScheme(
  source: DynamicScheme,
  options?: ColorSchemeOptions,
): ColorScheme;
export function createColorScheme(
  source: MaterialTheme | DynamicScheme,
  options?: ColorSchemeOptions,
): ColorScheme {
  return 'schemes' in source
    ? createFromTheme(source, options)
    : createFromScheme(source, options);
}

function createFromTheme(theme: MaterialTheme, options: ColorSchemeOptions = {}): ColorScheme {
  const {
    dark = false,
    brightnessVariants = false,
    paletteTones,
    modifyColorScheme,
  } = options;

  const baseScheme = dark ? theme.schemes.dark : theme.schemes.light;

  const scheme: ColorScheme = {};

  if (paletteTones) {
    Object.assign(scheme, getPaletteColorsFromTheme(theme, paletteTones));
  }

  Object.assign(
    scheme,
    getColorsFromScheme(baseScheme),
    createCustomColorsFromTheme(theme, options),
  );

  if (brightnessVariants) {
    Object.assign(
      scheme,
      getColorsFromScheme(theme.schemes.light, 'light'),
      getColorsFromScheme(theme.schemes.dark, 'dark'),
    );
  }

  return modifyColorScheme?.(scheme) ?? scheme;
}

function createFromScheme(
  scheme: DynamicScheme,
  options?: ColorSchemeOptions,
): ColorScheme {
  return (
    options?.modifyColorScheme?.(getColorsFromScheme(scheme)) ??
    getColorsFromScheme(scheme)
  );
}

export function createCustomColorsFromTheme(
  theme: MaterialTheme,
  options: ColorSchemeOptions = {},
): ColorScheme {
  const customColors: ColorScheme[] = [];

  for (const customColor of theme.customColors) {
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

export function getColorsFromScheme(
  scheme: DynamicScheme,
  suffix?: string,
): ColorScheme {
  return COLOR_ROLES.reduce((acc, key) => {
    const colorName = formatTokenName(key, {suffix});
    acc[colorName] = scheme[key];
    return acc;
  }, {} as ColorScheme);
}

export function getPaletteColorsFromTheme(theme: MaterialTheme, tones: number[] = [...DEFAULT_PALETTE_TONES]) {
  const tonalColors: Record<string, string> = {};
  for (const [paletteName, palette] of Object.entries(theme.palettes)) {
    const paletteColors = getColorsFromPalette(palette, tones);
    Object.assign(tonalColors, createTonalPaletteTokens(paletteName, paletteColors));
  }
  return tonalColors;
}

export function createTonalPaletteTokens(
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
