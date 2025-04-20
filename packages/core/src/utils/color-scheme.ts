import type {CustomColorGroup, DynamicScheme, TonalPalette} from '@material/material-color-utilities';
import type {
  AdaptiveColorScheme,
  Color,
  ColorScheme,
  ColorSchemeConfig,
  CssOutputConfig,
  CssVariableMap,
  FullColorSchemeConfig,
} from '../types';
import {createTonalPalette, formatColorToken, formatCssVarName, formatTokenName, toHex} from '../utils';
import {DEFAULT_PALETTE_TONES, MATERIAL_COLOR_ROLES} from "../constants";
import {MaterialTheme} from "../theme";

export function createColorScheme<V extends boolean>(
  theme: MaterialTheme,
  options?: FullColorSchemeConfig<V>,
): AdaptiveColorScheme<V>;
export function createColorScheme<V extends boolean = false>(
  dynamicScheme: DynamicScheme,
  options?: ColorSchemeConfig,
): AdaptiveColorScheme<V>;
export function createColorScheme(
  dynamicSchemeOrTheme: MaterialTheme | DynamicScheme,
  options?: FullColorSchemeConfig,
): ColorScheme {
  return 'schemes' in dynamicSchemeOrTheme
    ? buildColorScheme(dynamicSchemeOrTheme, options)
    : buildDynamicColorScheme(dynamicSchemeOrTheme, options);
}

export function buildColorScheme(theme: MaterialTheme, options: FullColorSchemeConfig = {}): ColorScheme {
  const {dark = false, brightnessVariants = false, modifyColorScheme} = options;
  const baseScheme = dark ? theme.schemes.dark : theme.schemes.light;
  const colorScheme: ColorScheme = {};

  if (options.paletteTones) {
    const targetTones = Array.isArray(options.paletteTones)
      ? options.paletteTones
      : [...DEFAULT_PALETTE_TONES];
    Object.assign(colorScheme, createTonalPaletteColors(theme, targetTones));
  }

  Object.assign(
    colorScheme,
    createDynamicSchemeColors(baseScheme),
    createCustomColorScheme(theme.customColors, options),
  );

  if (brightnessVariants) {
    Object.assign(
      colorScheme,
      createDynamicSchemeColors(theme.schemes.light, 'light'),
      createDynamicSchemeColors(theme.schemes.dark, 'dark'),
    );
  }

  return modifyColorScheme?.(colorScheme) ?? colorScheme;
}

function buildDynamicColorScheme(scheme: DynamicScheme, options?: ColorSchemeConfig): ColorScheme {
  const dynamicSchemeColors = createDynamicSchemeColors(scheme);
  return options?.modifyColorScheme?.(dynamicSchemeColors) ?? dynamicSchemeColors;
}

export function createCustomColorScheme(
  customColorGroups: CustomColorGroup[],
  options: FullColorSchemeConfig = {},
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
        const token = formatColorToken(pattern, customColor.color.name, suffix)
        colorGroup[token] = value;
      }
    }

    customColors.push(colorGroup);
  }

  return Object.assign({}, ...customColors);
}

export function createDynamicSchemeColors(dynamicScheme: DynamicScheme, suffix?: string): ColorScheme {
  return MATERIAL_COLOR_ROLES.reduce((acc, key) => {
    const colorName = formatTokenName(key, {suffix});
    acc[colorName] = dynamicScheme[key];
    return acc;
  }, {} as ColorScheme);
}


/**
 * Options for processing custom color tones
 */
export interface ProcessCustomColorOptions {
  /** Specific tones to generate (uses DEFAULT_PALETTE_TONES if not provided) */
  tones?: number[];
  /** Name formatter function (defaults to formatTokenName) */
  nameFormatter?: (name: string) => string;
  /** Add a prefix to each name */
  prefix?: string;
  /** Add a suffix to each name */
  suffix?: string;
}

/**
 * Result of processing a custom color
 */
export interface ProcessedCustomColorTone {
  /** Formatted name of the custom color */
  name: string;
  /** Original name from the color group */
  originalName: string;
  /** Mapping of tone numbers to colors */
  mapping: Record<number, Color>;
  /** The tonal palette created from the color */
  palette: TonalPalette;
}

/**
 * Process custom color groups to generate tonal palettes and mappings.
 * This helper function centralizes the common logic of creating tonal palettes and mappings.
 *
 * @param customColorGroups - The array of custom color groups
 * @param options - Configuration options for processing
 * @returns An array of objects with name, palette, and tonal mapping for each custom color
 */
export function processCustomColorTones(
  customColorGroups: CustomColorGroup[] = [],
  options?: number[] | ProcessCustomColorOptions
): ProcessedCustomColorTone[] {
  // Handle the case where options is just an array of tones
  const opts: ProcessCustomColorOptions = Array.isArray(options)
    ? {tones: options}
    : options || {};

  const {
    tones,
    nameFormatter = formatTokenName,
    prefix,
    suffix
  } = opts;

  const processedColors: ProcessedCustomColorTone[] = [];

  for (const customColor of customColorGroups) {
    const originalName = customColor.color.name;
    const palette = createTonalPalette(customColor.value);

    let formattedName = nameFormatter(originalName);
    if (prefix) formattedName = `${prefix}${formattedName}`;
    if (suffix) formattedName = `${formattedName}${suffix}`;

    const tonalMapping = createTonalMapping(palette, tones);
    processedColors.push({
      name: formattedName,
      originalName,
      palette: palette,
      mapping: tonalMapping,
    });
  }

  return processedColors;
}

function createTonalPaletteColors(theme: MaterialTheme, tones?: number[]) {
  const tonalColors: Record<string, string> = {};

  // Process standard palettes
  for (const [paletteName, palette] of Object.entries(theme.palettes)) {
    const paletteColors = createTonalMapping(palette, tones);
    Object.assign(tonalColors, getColorsFromTonalMapping(paletteName, paletteColors));
  }

  // Process custom colors using the common helper with options
  const processedCustomColors = processCustomColorTones(theme.customColors, {tones});

  // Apply the mapping for each processed color
  for (const {name, mapping} of processedCustomColors) {
    Object.assign(tonalColors, getColorsFromTonalMapping(name, mapping));
  }

  return tonalColors;
}

export function createTonalMapping(palette: TonalPalette, tones?: number[]): Record<number, number> {
  const paletteTones = tones ?? DEFAULT_PALETTE_TONES;
  return Object.fromEntries(paletteTones.map((tone) => [tone, palette.tone(tone)]));
}

export function getColorsFromTonalMapping(name: string, colors: Record<number, Color>) {
  const tonalKeys: Record<string, Color> = {};
  for (const [tone, color] of Object.entries(colors)) {
    const key = formatTokenName(name, {suffix: tone});
    tonalKeys[key] = color;
  }
  return tonalKeys;
}

export function stringifyCssVars(
  colorScheme: ColorScheme,
  options?: CssOutputConfig
): string {
  const {selector, minify = true} = options || {};
  const entries = Object.entries(colorScheme);
  if (entries.length === 0) return '';
  let processedCss = entries.map(([key, value]) => `${key}: ${value};`).join('\n');
  if (minify) {
    processedCss = processedCss.replace(/\s+/g, ' ').trim();
  }
  if (selector) {
    return minify
      ? `${selector}{${processedCss}}`
      : `${selector} {\n${processedCss}\n}`;
  }
  return processedCss;
}


export function createCssVarsMap(colorScheme: ColorScheme): CssVariableMap {
  return Object.fromEntries(
    Object.entries(colorScheme).map(([key, value]) => [
      formatCssVarName(key),
      typeof value === 'number' ? toHex(value) : value
    ]),
  );
}

export function createCssVarsText(colorScheme: ColorScheme, options?: CssOutputConfig): string {
  const cssVars = createCssVarsMap(colorScheme);
  return stringifyCssVars(cssVars, options);
}

// Unused - May be removed in the future
export function extractCustomColorToneMapping(
  customColorGroups: CustomColorGroup[] = [],
  options?: ProcessCustomColorOptions
) {
  // Use the common helper function to process custom colors with options
  const processedTones = processCustomColorTones(customColorGroups, options);

  // Convert the result array to the desired object format
  return Object.fromEntries(
    processedTones.map(item => [item.name, item.mapping])
  );
}
