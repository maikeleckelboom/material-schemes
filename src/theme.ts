import { harmonize, isColor, toArgb } from './color';
import { resolveContrastLevelValue } from './contrast';
import { createCssVariables } from './css';
import { createPalette, PaletteStyle } from './palette';
import { SUPPORTED_PLATFORMS, SUPPORTED_SPEC_VERSIONS } from './roles';
import { createColorScheme, createScheme, DynamicColorScheme } from './scheme';
import type {
  Color,
  ColorSchemeOptions,
  CustomColor,
  MaterialCustomColorGroup,
  MaterialThemeShape,
  Platform,
  SerializeCssVarMapOptions,
  SpecVersion,
  StructuredColorScheme,
  ThemeOptions,
} from './types';

export class MaterialTheme implements MaterialThemeShape {
  public readonly source: number;
  public readonly sourceColors: readonly number[];
  public readonly contrastLevel: number;
  public readonly style: PaletteStyle;
  public readonly variant: MaterialThemeShape['variant'];
  public readonly specVersion: SpecVersion;
  public readonly platform: Platform;
  public readonly schemes: MaterialThemeShape['schemes'];
  public readonly palettes: MaterialThemeShape['palettes'];
  public readonly customColors: MaterialCustomColorGroup[];

  public constructor(sourceColor: Color, options?: Omit<ThemeOptions, 'sourceColor'>);
  public constructor(options: ThemeOptions);
  public constructor(
    sourceOrOptions: Color | ThemeOptions,
    options: Omit<ThemeOptions, 'sourceColor'> = {},
  ) {
    const themeOptions = normalizeThemeOptions(sourceOrOptions, options);
    this.sourceColors = resolveThemeSourceColors(themeOptions);
    this.source = this.sourceColors[0] as number;
    this.contrastLevel = resolveContrastLevelValue(themeOptions.contrastLevel);
    this.style = PaletteStyle.from(themeOptions.variant ?? themeOptions.style);
    this.variant = this.style.value;
    this.specVersion = resolveSpecVersion(themeOptions.specVersion);
    this.platform = resolvePlatform(themeOptions.platform);

    this.schemes = {
      light: createScheme({
        ...themeOptions,
        sourceColor: this.source,
        sourceColors: this.sourceColors,
        isDark: false,
      }),
      dark: createScheme({
        ...themeOptions,
        sourceColor: this.source,
        sourceColors: this.sourceColors,
        isDark: true,
      }),
    };

    this.palettes = {
      primary: this.schemes.light.primaryPalette,
      secondary: this.schemes.light.secondaryPalette,
      tertiary: this.schemes.light.tertiaryPalette,
      neutral: this.schemes.light.neutralPalette,
      neutralVariant: this.schemes.light.neutralVariantPalette,
      error: this.schemes.light.errorPalette,
    };

    this.customColors = [...(themeOptions.customColors ?? [])].map((color) =>
      createCustomColorGroup(this.source, color),
    );
  }

  public toColorScheme<WithBrightnessVariants extends boolean = false>(
    options?: ColorSchemeOptions<WithBrightnessVariants>,
  ): StructuredColorScheme<WithBrightnessVariants> {
    return createColorScheme(this, options);
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
}

export function createTheme(
  sourceColor: Color,
  options?: Omit<ThemeOptions, 'sourceColor'>,
): MaterialTheme;
export function createTheme(options: ThemeOptions): MaterialTheme;
export function createTheme(
  sourceOrOptions: Color | ThemeOptions,
  options: Omit<ThemeOptions, 'sourceColor'> = {},
): MaterialTheme {
  return new MaterialTheme(sourceOrOptions as Color, options);
}

export function createCustomColorGroup(
  sourceColor: Color,
  color: CustomColor,
): MaterialCustomColorGroup {
  const sourceArgb = toArgb(sourceColor);
  const originalValue = toArgb(color.value);
  const value = color.blend ? harmonize(originalValue, sourceArgb) : originalValue;
  const palette = createPalette(value);
  const colorMetadata = {
    name: color.name,
    value,
    blend: color.blend ?? false,
    ...(color.description === undefined ? {} : { description: color.description }),
  };

  return {
    value,
    color: colorMetadata,
    palette,
    light: {
      color: palette.tone(40),
      onColor: palette.tone(100),
      colorContainer: palette.tone(90),
      onColorContainer: palette.tone(10),
    },
    dark: {
      color: palette.tone(80),
      onColor: palette.tone(20),
      colorContainer: palette.tone(30),
      onColorContainer: palette.tone(90),
    },
  };
}

function normalizeThemeOptions(
  sourceOrOptions: Color | ThemeOptions,
  options: Omit<ThemeOptions, 'sourceColor'>,
): ThemeOptions {
  return isColor(sourceOrOptions) ? { ...options, sourceColor: sourceOrOptions } : sourceOrOptions;
}

function resolveThemeSourceColors(options: ThemeOptions): readonly number[] {
  if (options.sourceColors !== undefined) {
    if (options.sourceColors.length === 0) {
      throw new Error('sourceColors must contain exactly one source color in this v0 package.');
    }
    if (options.sourceColors.length > 1) {
      throw new Error(
        'Multiple source colors are not supported by @material/material-color-utilities@0.4.0; v0 rejects extra source colors instead of ignoring them.',
      );
    }
    return [toArgb(options.sourceColors[0] as Color)];
  }

  const sourceColor = options.sourceColor ?? options.primary;
  if (sourceColor == null) throw new Error('createTheme requires sourceColor or primary.');
  return [toArgb(sourceColor)];
}

function resolveSpecVersion(specVersion: ThemeOptions['specVersion']): SpecVersion {
  if (specVersion === undefined) return '2021';
  if ((SUPPORTED_SPEC_VERSIONS as readonly string[]).includes(specVersion)) return specVersion;
  throw new Error(`Unsupported Material specVersion: ${specVersion}`);
}

function resolvePlatform(platform: ThemeOptions['platform']): Platform {
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

export { DynamicColorScheme };
