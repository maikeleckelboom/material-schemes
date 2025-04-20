import type {CustomColorGroup, DynamicScheme, TonalPalette} from '@material/material-color-utilities';
import type {
  ColorScheme,
  ColorSchemeConfig,
  ColorSchemeReturnType,
  ThemeColorSchemeConfig,
  StylesheetConfig,
} from '../types';
import {createTonalPalette, formatColorToken, formatCssVarName, formatTokenName, toHex} from '../utils';
import {DEFAULT_PALETTE_TONES, MATERIAL_COLOR_ROLES} from "../constants";
import {DynamicColorScheme, MaterialTheme} from "../theme";

function createColorScheme<V extends boolean>(
  theme: MaterialTheme,
  options?: ThemeColorSchemeConfig<V>,
): ColorSchemeReturnType<V>;
function createColorScheme<V extends boolean = false>(
  dynamicScheme: DynamicScheme | DynamicColorScheme,
  options?: ColorSchemeConfig<V>,
): ColorSchemeReturnType<V>;
function createColorScheme(
  dynamicSchemeOrTheme: MaterialTheme | DynamicScheme | DynamicColorScheme,
  options?: ThemeColorSchemeConfig,
): ColorScheme {
  return 'schemes' in dynamicSchemeOrTheme
    ? themeToTokens(dynamicSchemeOrTheme, options)
    : schemeToTokens(dynamicSchemeOrTheme, options);
}

// ___ Utility Functions ___
function reduceToObject<T, U>(items: T[], fn: (item: T) => U): U {
  return Object.assign({}, ...items.map(fn));
}

function optionToTones(paletteTones: number[] | boolean | undefined): number[] {
  if (Array.isArray(paletteTones)) return paletteTones;
  if (paletteTones) return [...DEFAULT_PALETTE_TONES];
  return [];
}

function paletteToTonalScheme(palette: TonalPalette, name: string, tones: number[]) {
  return valuesToTokens(name, tonesToValues(palette, tones));
}

function rolesToTokens(scheme: DynamicScheme, suffix?: string) {
  return MATERIAL_COLOR_ROLES.reduce((acc, role) => ({
    ...acc,
    [formatTokenName(role, {suffix})]: scheme[role]
  }), {} as ColorScheme);
}

function customGroupsToScheme(customColorGroups: CustomColorGroup[], options: ThemeColorSchemeConfig = {}) {
  return reduceToObject(customColorGroups, group => groupToTokens(group, options));
}

function themeToTokens(theme: MaterialTheme, options: ThemeColorSchemeConfig = {}): ColorScheme {
  const {dark = false, brightnessVariants = false, modifyColorScheme} = options;
  const baseScheme = dark ? theme.schemes.dark : theme.schemes.light;

  const colorSources: Record<string, string | number>[] = [
    rolesToTokens(baseScheme),
    customGroupsToScheme(theme.extendedColors, options),
  ];

  if (options.paletteTones) {
    colorSources.push(themePalettesToSchemes(theme, optionToTones(options.paletteTones)));
  }

  if (brightnessVariants) {
    colorSources.push(
      rolesToTokens(theme.schemes.light, 'light'),
      rolesToTokens(theme.schemes.dark, 'dark'),
    );
  }

  const colorScheme = Object.assign({}, ...colorSources);
  return modifyColorScheme?.(colorScheme) ?? colorScheme;
}

function schemeToPalettes(scheme: DynamicScheme) {
  return {
    primary: scheme.primaryPalette,
    secondary: scheme.secondaryPalette,
    tertiary: scheme.tertiaryPalette,
    neutral: scheme.neutralPalette,
    neutralVariant: scheme.neutralVariantPalette,
  };
}


function schemeToTokens(scheme: DynamicScheme, options?: ColorSchemeConfig) {
  const dynamicSchemeColors: ColorScheme = rolesToTokens(scheme);

  if (options?.paletteTones) {
    const targetTones = optionToTones(options.paletteTones);
    Object.entries(schemeToPalettes(scheme)).forEach(([name, palette]) => {
      Object.assign(dynamicSchemeColors, paletteToTonalScheme(palette, name, targetTones));
    });
  }

  return options?.modifyColorScheme?.(dynamicSchemeColors) ?? dynamicSchemeColors;
}

function groupToTokens(group: CustomColorGroup, options: ThemeColorSchemeConfig) {
  const colorGroup: Record<string, string | number> = {};
  optionsToVariants(options).forEach(({type, suffix = ''}) => {
    Object.entries(group[type]).forEach(([pattern, value]) => {
      colorGroup[formatColorToken(pattern, group.color.name, suffix)] = value;
    });
  });
  return colorGroup;
}

function optionsToVariants(options: ThemeColorSchemeConfig): { type: 'light' | 'dark', suffix?: string }[] {
  const variants: { type: 'light' | 'dark', suffix?: string }[] = [{type: options.dark ? 'dark' : 'light'}];
  if (options.brightnessVariants) variants.push(
    {type: 'light', suffix: 'Light'},
    {type: 'dark', suffix: 'Dark'}
  );
  return variants;
}

function themePalettesToSchemes(theme: MaterialTheme, tones: number[]) {
  return Object.assign(
    corePalettesToSchemes(theme.palettes, tones),
    customPalettesToSchemes(theme.extendedColors, tones)
  );
}

function corePalettesToSchemes(palettes: Record<string, TonalPalette>, tones: number[]) {
  return reduceToObject(Object.entries(palettes), ([name, palette]) =>
    valuesToTokens(name, tonesToValues(palette, tones))
  );
}

function customPalettesToSchemes(groups: CustomColorGroup[], tones: number[]) {
  return reduceToObject(groups, group =>
    valuesToTokens(
      formatTokenName(group.color.name),
      tonesToValues(createTonalPalette(group.value), tones)
    )
  );
}

function tonesToValues(palette: TonalPalette, tones?: number[]): Record<number, number> {
  return Object.fromEntries((tones || DEFAULT_PALETTE_TONES).map(t => [t, palette.tone(t)]));
}

function valuesToTokens(name: string, colors: Record<number, string | number>) {
  return Object.fromEntries(
    Object.entries(colors).map(([tone, color]) =>
      [formatTokenName(name, {suffix: tone}), color]
    )
  ) as ColorScheme;
}

function cssVarsToString(colorScheme: Record<string, string | number>, options?: StylesheetConfig): string {
  const {selector, minify = true} = options || {};
  let css = entriesToCssDecls(colorScheme);

  if (minify) css = css.replace(/\s+/g, ' ').trim();
  if (selector) css = wrapWithSelector(css, selector, minify);

  return css;
}

function entriesToCssDecls(colorScheme: Record<string, string | number>): string {
  return Object.entries(colorScheme)
    .map(([varName, value]) => `${varName}: ${value};`)
    .join('\n');
}

function wrapWithSelector(css: string, selector: string, minify: boolean): string {
  const TAB_SIZE = 2;
  const indent = ' '.repeat(TAB_SIZE);
  return minify
    ? `${selector}{${css}}`
    : `${selector} {\n${css.split('\n').map(line => `${indent}${line}`).join('\n')}\n}`;
}

function tokensToCssVarMap(colorScheme: Record<string, string | number>) {
  return Object.fromEntries(
    Object.entries(colorScheme).map(([key, value]) => [
      formatCssVarName(key),
      typeof value === 'number' ? toHex(value) : value
    ])
  );
}

function colorSchemeToCssVars(colorScheme: Record<string, string | number>, options?: StylesheetConfig): string {
  return cssVarsToString(tokensToCssVarMap(colorScheme), options);
}

export {
  createColorScheme,
  themeToTokens,
  schemeToTokens,
  colorSchemeToCssVars,
};
