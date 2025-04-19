import type {CustomColorGroup, DynamicScheme, TonalPalette} from '@material/material-color-utilities';
import type {Color, ColorScheme, ColorSchemeOptions, ColorSchemeReturnType, CSSColorScheme} from '../types';
import {createPalette, formatColorToken, formatCssVarName, formatTokenName, toHex} from '../utils';
import {DEFAULT_PALETTE_TONES, MATERIAL_COLOR_ROLES} from "../constants";
import {MaterialTheme} from "../theme";

export function toColorScheme<V extends boolean = false>(
  source: MaterialTheme,
  options?: ColorSchemeOptions<V>,
): ColorSchemeReturnType<V>;
export function toColorScheme<V extends boolean = false>(
  source: DynamicScheme,
  options?: ColorSchemeOptions,
): ColorSchemeReturnType<V>;
export function toColorScheme(
  source: MaterialTheme | DynamicScheme,
  options?: ColorSchemeOptions,
): ColorScheme {
  return 'schemes' in source
    ? extractSchemeFromTheme(source, options)
    : extractSchemeFromDynamic(source, options);
}

export function extractSchemeFromTheme(theme: MaterialTheme, options: ColorSchemeOptions = {}): ColorScheme {
  const {dark = false, brightnessVariants = false, modifyColorScheme} = options;
  const baseScheme = dark ? theme.schemes.dark : theme.schemes.light;
  const scheme: ColorScheme = {};

  if (options.paletteTones) {
    const tones = Array.isArray(options.paletteTones) ? options.paletteTones : [...DEFAULT_PALETTE_TONES];
    Object.assign(scheme, extractTonalPalettesFromTheme(theme, tones));
  }

  Object.assign(
    scheme,
    createSchemeTokens(baseScheme),
    deriveCustomColorTokens(theme.customColors, options),
  );

  if (brightnessVariants) {
    Object.assign(
      scheme,
      createSchemeTokens(theme.schemes.light, 'light'),
      createSchemeTokens(theme.schemes.dark, 'dark'),
    );
  }

  return modifyColorScheme?.(scheme) ?? scheme;
}

function extractSchemeFromDynamic(
  scheme: DynamicScheme,
  options?: ColorSchemeOptions,
): ColorScheme {
  return options?.modifyColorScheme?.(createSchemeTokens(scheme)) ?? createSchemeTokens(scheme);
}

export function deriveCustomColorTokens(
  customColorGroups: CustomColorGroup[],
  options: ColorSchemeOptions = {},
): ColorScheme {
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

function createSchemeTokens(scheme: DynamicScheme, suffix?: string): ColorScheme {
  return MATERIAL_COLOR_ROLES.reduce((acc, key) => {
    const colorName = formatTokenName(key, {suffix});
    acc[colorName] = scheme[key];
    return acc;
  }, {} as ColorScheme);
}

function extractTonalPalettesFromTheme(theme: MaterialTheme, tones?: number[]) {
  const tonalColors: Record<string, string> = {};
  for (const [paletteName, palette] of Object.entries(theme.palettes)) {
    const paletteColors = deriveToneMapFromPalette(palette, tones);
    Object.assign(tonalColors, generateTonalPaletteTokens(paletteName, paletteColors));
  }
  for (const customColor of theme.customColors) {
    const palette = createPalette(customColor.value);
    if (palette) {
      const paletteColors = deriveToneMapFromPalette(palette, tones);
      Object.assign(tonalColors, generateTonalPaletteTokens(customColor.color.name, paletteColors));
    }
  }
  return tonalColors;
}

export function deriveToneMapFromPalette(palette: TonalPalette, tones?: number[]): Record<number, number> {
  const paletteTones = tones ?? DEFAULT_PALETTE_TONES;
  return Object.fromEntries(paletteTones.map((tone) => [tone, palette.tone(tone)]));
}

export function generateTonalPaletteTokens(paletteName: string, paletteColors: Record<number, Color>) {
  const tonalKeys: Record<string, Color> = {};
  for (const [tone, color] of Object.entries(paletteColors)) {
    const key = formatTokenName(paletteName, {suffix: tone});
    tonalKeys[key] = color;
  }
  return tonalKeys;
}

export function extractCustomColorToneMapping(customColorGroups: CustomColorGroup[] = []) {
  return Object.fromEntries(
    customColorGroups.map(customColor => [
      formatTokenName(customColor.color.name),
      deriveToneMapFromPalette(createPalette(customColor.value)),
    ])
  );
}


export function createCssVarMap(colorScheme: ColorScheme): CSSColorScheme {
  return Object.fromEntries(
    Object.entries(colorScheme).map(([key, value]) => [
      formatCssVarName(key),
      toHex(value)
    ]),
  );
}

export function serializeCssVars(colorScheme: CSSColorScheme, selector?: string): string {
  const cssText = Object.entries(colorScheme)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
  return selector ? `${selector} {\n${cssText}\n}` : cssText;
}

/**
 * Generates a CSS string with variables based on a color scheme.
 * @param colorScheme - The color scheme to generate CSS variables from.
 * @param options - Optional parameters to modify the CSS variable generation.
 * @returns The generated CSS string.
 */
export function createCssText(colorScheme: ColorScheme, options?: { selector?: string }): string {
  const {selector} = options || {};
  const cssVars = createCssVarMap(colorScheme);
  return serializeCssVars(cssVars, selector);
}
