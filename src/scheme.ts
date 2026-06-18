import {
  DynamicScheme,
  type DynamicColor,
  type TonalPalette,
} from '@material/material-color-utilities';
import { formatColorToken, formatTokenName, isColor, toArgb, toHct } from './color';
import { ContrastLevel } from './contrast';
import { createCssVarMap, createCssVariables, serializeCssVarMap } from './css';
import { createPalette, PaletteStyle } from './palette';
import {
  DEFAULT_PALETTE_TONES,
  MATERIAL_COLOR_ROLES,
  MATERIAL_OPTIONAL_COLOR_ROLES,
  SUPPORTED_PLATFORMS,
  SUPPORTED_SPEC_VERSIONS,
} from './roles';
import type {
  Color,
  ColorScheme,
  ColorSchemeOptions,
  CssVarMap,
  MaterialColorRole,
  MaterialOptionalColorRole,
  MaterialThemeShape,
  Platform,
  SchemeOptions,
  SchemeOptionsBase,
  SerializeCssVarMapOptions,
  SpecVersion,
  StructuredColorScheme,
} from './types';

export class DynamicColorScheme extends DynamicScheme {
  public constructor(sourceColor: Color, options?: SchemeOptionsBase);
  public constructor(options: SchemeOptions);
  public constructor(source: Color | SchemeOptions, options: SchemeOptionsBase = {}) {
    const resolvedOptions = normalizeSchemeOptions(source, options);
    const {
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      isDark = false,
    } = resolvedOptions;
    const sourceColor = getRequiredSourceColor(resolvedOptions);
    const contrastLevel = getContrastLevelValue(resolvedOptions.contrastLevel);
    const style = PaletteStyle.from(resolvedOptions.variant ?? resolvedOptions.style);
    const specVersion = getSpecVersionValue(resolvedOptions.specVersion);
    const platform = getPlatformValue(resolvedOptions.platform);
    const dynamicScheme = style.dynamicScheme(
      toHct(sourceColor),
      isDark,
      contrastLevel,
      specVersion,
      platform,
    );

    super({
      ...dynamicScheme,
      primaryPalette: DynamicColorScheme.createPaletteOverride(
        primary,
        dynamicScheme.primaryPalette,
      ),
      secondaryPalette: DynamicColorScheme.createPaletteOverride(
        secondary,
        dynamicScheme.secondaryPalette,
      ),
      tertiaryPalette: DynamicColorScheme.createPaletteOverride(
        tertiary,
        dynamicScheme.tertiaryPalette,
      ),
      neutralPalette: DynamicColorScheme.createPaletteOverride(
        neutral,
        dynamicScheme.neutralPalette,
      ),
      neutralVariantPalette: DynamicColorScheme.createPaletteOverride(
        neutralVariant,
        dynamicScheme.neutralVariantPalette,
      ),
    });
  }

  public toColorScheme<WithBrightnessVariants extends boolean = false>(
    options?: ColorSchemeOptions<WithBrightnessVariants>,
  ): StructuredColorScheme<WithBrightnessVariants> {
    return createColorScheme(this, options);
  }

  public toCssVarMap(options?: ColorSchemeOptions): CssVarMap {
    return createCssVarMap(this.toColorScheme(options));
  }

  public toCssVariables(options: ColorSchemeOptions & SerializeCssVarMapOptions = {}): string {
    const { selector, minify, ...colorSchemeOptions } = options;
    return createCssVariables(
      this.toColorScheme(colorSchemeOptions),
      createSerializeOptions(selector, minify),
    );
  }

  public toCssVars(options: ColorSchemeOptions & SerializeCssVarMapOptions = {}): string {
    return this.toCssVariables(options);
  }

  private static createPaletteOverride(
    color: Color | undefined,
    fallback: TonalPalette,
  ): TonalPalette {
    return color == null ? fallback : createPalette(color);
  }
}

export function createScheme(sourceColor: Color, options?: SchemeOptionsBase): DynamicColorScheme;
export function createScheme(options: SchemeOptions): DynamicColorScheme;
export function createScheme(
  sourceOrOptions: Color | SchemeOptions,
  options: SchemeOptionsBase = {},
): DynamicColorScheme {
  return isColor(sourceOrOptions)
    ? new DynamicColorScheme(sourceOrOptions, options)
    : new DynamicColorScheme(sourceOrOptions);
}

export function createColorScheme<WithBrightnessVariants extends boolean = false>(
  source: MaterialThemeShape,
  options?: ColorSchemeOptions<WithBrightnessVariants>,
): StructuredColorScheme<WithBrightnessVariants>;
export function createColorScheme<WithBrightnessVariants extends boolean = false>(
  source: DynamicScheme,
  options?: ColorSchemeOptions<WithBrightnessVariants>,
): StructuredColorScheme<WithBrightnessVariants>;
export function createColorScheme<WithBrightnessVariants extends boolean = false>(
  source: DynamicScheme | MaterialThemeShape,
  options: ColorSchemeOptions<WithBrightnessVariants> = {},
): StructuredColorScheme<WithBrightnessVariants> {
  const colorScheme = isThemeShape(source)
    ? createColorSchemeFromTheme(source, options)
    : createColorSchemeFromDynamicScheme(source, options);

  return applyColorSchemeModifier(colorScheme, options);
}

function createColorSchemeFromTheme<WithBrightnessVariants extends boolean>(
  theme: MaterialThemeShape,
  options: ColorSchemeOptions<WithBrightnessVariants>,
): StructuredColorScheme<WithBrightnessVariants> {
  const baseScheme = options.dark ? theme.schemes.dark : theme.schemes.light;
  const colorScheme: ColorScheme = {
    ...rolesToScheme(baseScheme),
    ...customGroupsToScheme(theme, options),
  };

  if (options.paletteTones) {
    Object.assign(colorScheme, themePalettesToScheme(theme, options.paletteTones));
  }

  if (options.brightnessVariants) {
    Object.assign(
      colorScheme,
      rolesToScheme(theme.schemes.light, 'Light'),
      rolesToScheme(theme.schemes.dark, 'Dark'),
      customGroupsToScheme(theme, { ...options, brightnessVariants: true }, false),
    );
  }

  return colorScheme as StructuredColorScheme<WithBrightnessVariants>;
}

function createColorSchemeFromDynamicScheme<WithBrightnessVariants extends boolean>(
  scheme: DynamicScheme,
  options: ColorSchemeOptions<WithBrightnessVariants>,
): StructuredColorScheme<WithBrightnessVariants> {
  const colorScheme: ColorScheme = rolesToScheme(scheme);

  if (options.paletteTones) {
    Object.assign(colorScheme, schemePalettesToScheme(scheme, options.paletteTones));
  }

  return colorScheme as StructuredColorScheme<WithBrightnessVariants>;
}

function applyColorSchemeModifier<WithBrightnessVariants extends boolean>(
  colorScheme: StructuredColorScheme<WithBrightnessVariants>,
  options: ColorSchemeOptions<WithBrightnessVariants>,
): StructuredColorScheme<WithBrightnessVariants> {
  return options.modifyColorScheme?.(colorScheme) ?? colorScheme;
}

function rolesToScheme(scheme: DynamicScheme, suffix?: string): ColorScheme {
  const output: Record<string, Color> = {};

  for (const role of MATERIAL_COLOR_ROLES) {
    const value = readSchemeRole(scheme, role);
    if (value === undefined) continue;
    output[formatTokenName(role, suffix === undefined ? {} : { suffix })] = value;
  }

  return output as ColorScheme;
}

function readSchemeRole(scheme: DynamicScheme, role: MaterialColorRole): number | undefined {
  const colors = scheme.colors as unknown as Record<string, () => DynamicColor | undefined>;
  const colorFactory = colors[role];
  if (typeof colorFactory !== 'function') {
    if (isOptionalRole(role)) return undefined;
    throw new Error(`MaterialDynamicColors method is unavailable: ${role}`);
  }

  const dynamicColor = colorFactory.call(scheme.colors);
  if (dynamicColor === undefined) {
    if (isOptionalRole(role)) return undefined;
    throw new Error(`Material dynamic color is unavailable: ${role}`);
  }

  return scheme.getArgb(dynamicColor);
}

function customGroupsToScheme(
  theme: MaterialThemeShape,
  options: ColorSchemeOptions<boolean>,
  includeBase: boolean = true,
): Record<string, Color> {
  const colorScheme: Record<string, Color> = {};
  const variants: { type: 'light' | 'dark'; suffix?: string }[] = [];

  if (includeBase) variants.push({ type: options.dark ? 'dark' : 'light' });

  if (options.brightnessVariants) {
    variants.push({ type: 'light', suffix: 'Light' }, { type: 'dark', suffix: 'Dark' });
  }

  for (const customColor of theme.customColors) {
    for (const variant of variants) {
      const colorGroup = customColor[variant.type];
      for (const [pattern, value] of Object.entries(colorGroup)) {
        colorScheme[formatColorToken(pattern, customColor.color.name, variant.suffix)] = value;
      }
    }
  }

  return colorScheme;
}

function themePalettesToScheme(
  theme: MaterialThemeShape,
  paletteTones: boolean | readonly number[],
): Record<string, Color> {
  const output: Record<string, Color> = {};
  const tones = optionToTones(paletteTones);

  for (const [paletteName, palette] of Object.entries(theme.palettes)) {
    Object.assign(output, paletteToScheme(paletteName, palette, tones));
  }

  for (const customColor of theme.customColors) {
    Object.assign(
      output,
      paletteToScheme(customColor.color.name, createPalette(customColor.value), tones),
    );
  }

  return output;
}

function schemePalettesToScheme(
  scheme: DynamicScheme,
  paletteTones: boolean | readonly number[],
): Record<string, Color> {
  const palettes = {
    primary: scheme.primaryPalette,
    secondary: scheme.secondaryPalette,
    tertiary: scheme.tertiaryPalette,
    neutral: scheme.neutralPalette,
    neutralVariant: scheme.neutralVariantPalette,
    error: scheme.errorPalette,
  };

  const output: Record<string, Color> = {};
  const tones = optionToTones(paletteTones);

  for (const [paletteName, palette] of Object.entries(palettes)) {
    Object.assign(output, paletteToScheme(paletteName, palette, tones));
  }

  return output;
}

function paletteToScheme(
  paletteName: string,
  palette: TonalPalette,
  tones: readonly number[],
): Record<string, Color> {
  return Object.fromEntries(
    tones.map((tone) => [formatTokenName(paletteName, { suffix: tone }), palette.tone(tone)]),
  );
}

function optionToTones(paletteTones: boolean | readonly number[]): readonly number[] {
  if (Array.isArray(paletteTones)) return [...paletteTones];
  return DEFAULT_PALETTE_TONES;
}

function normalizeSchemeOptions(
  source: Color | SchemeOptions,
  options: SchemeOptionsBase,
): SchemeOptions {
  return isColor(source) ? { ...options, sourceColor: source } : source;
}

function getRequiredSourceColor(options: SchemeOptions): Color {
  if (options.sourceColors !== undefined) {
    if (options.sourceColors.length === 0) {
      throw new Error('sourceColors must contain exactly one source color in this v0 package.');
    }
    if (options.sourceColors.length > 1) {
      throw new Error(
        'Multiple source colors are not supported by @material/material-color-utilities@0.4.0; v0 rejects extra source colors instead of ignoring them.',
      );
    }
    return options.sourceColors[0] as Color;
  }

  const sourceColor = options.sourceColor ?? options.primary;
  if (sourceColor == null) throw new Error('createScheme requires sourceColor or primary.');
  return sourceColor;
}

function getContrastLevelValue(contrastLevel: SchemeOptionsBase['contrastLevel']): number {
  return contrastLevel instanceof ContrastLevel
    ? contrastLevel.value
    : (contrastLevel ?? ContrastLevel.Default.value);
}

function getSpecVersionValue(specVersion: SchemeOptionsBase['specVersion']): SpecVersion {
  if (specVersion === undefined) return '2021';
  if ((SUPPORTED_SPEC_VERSIONS as readonly string[]).includes(specVersion)) return specVersion;
  throw new Error(`Unsupported Material specVersion: ${specVersion}`);
}

function getPlatformValue(platform: SchemeOptionsBase['platform']): Platform {
  if (platform === undefined) return 'phone';
  if ((SUPPORTED_PLATFORMS as readonly string[]).includes(platform)) return platform;
  throw new Error(`Unsupported Material platform: ${platform}`);
}

function createSerializeOptions(
  selector: string | undefined,
  minify: boolean | undefined,
): SerializeCssVarMapOptions {
  return {
    ...(selector === undefined ? {} : { selector }),
    ...(minify === undefined ? {} : { minify }),
  };
}

function isThemeShape(source: DynamicScheme | MaterialThemeShape): source is MaterialThemeShape {
  return 'schemes' in source && 'palettes' in source;
}

function isOptionalRole(role: MaterialColorRole): role is MaterialOptionalColorRole {
  return (MATERIAL_OPTIONAL_COLOR_ROLES as readonly string[]).includes(role);
}

export function sourceColorToArgb(options: SchemeOptions): number {
  return toArgb(getRequiredSourceColor(options));
}

export { serializeCssVarMap };
