import {DynamicScheme, TonalPalette} from "@material/material-color-utilities";
import type {Color, ColorScheme, ColorSchemeOptions} from "../";
import {
  ContrastLevel,
  DEFAULT_PALETTE_TONES, generateColorScheme,
  generateTonalPaletteTokens,
  generateToneMapFromPalette,
  isColor,
  PaletteStyle,
  toArgb,
  toHct
} from "../";


/**
 * Configuration options to override specific palettes and adjust parameters when generating a dynamic color scheme.
 *
 * @interface DynamicColorSchemeConfig
 *
 * @property {Color} [secondary] - An optional override for the secondary color palette.
 *   If not provided, the secondary palette is generated from the source color based on the selected palette style.
 * @property {Color} [tertiary] - An optional override for the tertiary color palette.
 *   Defaults to a generated value from the source color.
 * @property {Color} [neutral] - An optional override for the neutral background palette.
 *   Defaults to a generated value from the source color.
 * @property {Color} [neutralVariant] - An optional override for a variant of the neutral palette,
 *   used for subtle visual differences.
 * @property {PaletteStyle} [style=PaletteStyle.TonalSpot] - Visual style used for palette generation.
 * @property {number} [contrastLevel=0] - Numeric value for contrast adjustment (0 means default contrast, 1 indicates maximum contrast).
 * @property {boolean} [isDark=false] - Flag to determine if the generated scheme should be tailored for dark mode.
 */
export interface DynamicColorSchemeConfig {
  sourceColor?: Color;
  primary?: Color;
  secondary?: Color;
  tertiary?: Color;
  neutral?: Color;
  neutralVariant?: Color;
  style?: PaletteStyle;
  contrastLevel?: number;
  isDark?: boolean;
}

/**
 * Options for constructing a dynamic color scheme.
 *
 * This union type requires that either a `sourceColor` or a `primary` color is provided.
 * The provided color serves as the basis for scheme generation, while the additional configuration
 * is defined in {@link DynamicColorSchemeConfig}.
 *
 * @property {Object} DynamicColorSchemeOptions
 * @property {Color} [sourceColor] - The base color from which to generate the color scheme. Use this if you want to generate a scheme from a single source color.
 * @property {Color} [primary] - A primary color override. Use this when you want to provide a direct primary color.
 */
export type DynamicColorSchemeOptions =
  | ({ sourceColor: Color; primary?: Color } & DynamicColorSchemeConfig)
  | ({ sourceColor?: Color; primary: Color } & DynamicColorSchemeConfig);

/**
 * A customizable dynamic color scheme generator that extends Material Design's DynamicScheme.
 *
 * This class leverages Material Color Utilities to create adaptable color schemes which support:
 * - Light and dark mode variations.
 * - Contrast level adjustments.
 * - Customizable palette overrides (secondary, tertiary, neutral, etc.).
 *
 * It accepts either a source color (with an optional primary override) or a complete configuration object.
 *
 * @example <caption>Overload Example 1: Using a source color with additional options</caption>
 * // Create a dynamic color scheme by passing a source color along with extra configuration options.
 * const scheme = new DynamicColorScheme(0xFF6750A4, {
 *   style: PaletteStyle.Vibrant,
 *   isDark: true,
 *   contrastLevel: 0.7,
 *   secondary: '#FF4081'
 * });
 *
 * @example <caption>Overload Example 2: Using a complete configuration object</caption>
 * // Create a dynamic color scheme using an object that includes either a sourceColor or a primary color.
 * const scheme = new DynamicColorScheme({
 *   primary: '#2196F3',
 *   tertiary: '#FFC107',
 *   contrastLevel: 0.5
 * });
 *
 * @extends DynamicScheme
 */
export class DynamicColorScheme extends DynamicScheme {
  /**
   * Constructs a DynamicColorScheme instance.
   *
   * There are two overloads:
   *
   * **Overload 1: ** Create by providing a `sourceColor` along with optional additional options.
   *
   * @param {Color} sourceColor - The base color in any supported format (e.g., hex, RGB, HCT).
   * @param {Omit<DynamicColorSchemeOptions, 'sourceColor'>} [options] - Additional options such as palette overrides, style, dark mode flag, and contrast level.
   *
   * **Overload 2: ** Create by providing a complete configuration object that requires `sourceColor` or `primary` color.
   *
   * @param {DynamicColorSchemeOptions} options - A configuration object with all necessary parameters.
   *
   * @throws Will throw an error if neither a source color nor a primary color override is provided.
   */
  constructor(sourceColor: Color, options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>);
  constructor(options: DynamicColorSchemeOptions);
  constructor(
    seedOrOptions: Color | DynamicColorSchemeOptions,
    optionsOrNull?: Omit<DynamicColorSchemeOptions, 'sourceColor'>
  ) {
    const opts: DynamicColorSchemeOptions = isColor(seedOrOptions)
      ? {sourceColor: seedOrOptions, ...optionsOrNull}
      : seedOrOptions;

    const {
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      isDark = false,
      style = PaletteStyle.TonalSpot,
      contrastLevel = ContrastLevel.Default.value
    } = opts;

    const sourceColor = toHct(opts.sourceColor ?? primary ?? 0);
    const scheme = style.dynamicScheme(sourceColor, isDark, contrastLevel);

    super({
      ...scheme,
      primaryPalette: primary ? TonalPalette.fromInt(toArgb(primary)) : scheme.primaryPalette,
      secondaryPalette: secondary ? TonalPalette.fromInt(toArgb(secondary)) : scheme.secondaryPalette,
      tertiaryPalette: tertiary ? TonalPalette.fromInt(toArgb(tertiary)) : scheme.tertiaryPalette,
      neutralPalette: neutral ? TonalPalette.fromInt(toArgb(neutral)) : scheme.neutralPalette,
      neutralVariantPalette: neutralVariant ? TonalPalette.fromInt(toArgb(neutralVariant)) : scheme.neutralVariantPalette,
    });
  }

  /**
   * Serializes the dynamic color scheme into a plain object for external use, such as theme injection or storage.
   *
   * The returned object adheres to the {@link ColorScheme} type, containing all key palette and surface colors.
   *
   * @returns {ColorScheme} An object representing the complete color scheme.
   *
   * @example
   * const jsonScheme = scheme.toJSON();
   * console.log(jsonScheme.primary); // Outputs the primary color value.
   */
  public toJSON(): ColorScheme {
    return {
      primaryPaletteKeyColor: this.primaryPaletteKeyColor,
      secondaryPaletteKeyColor: this.secondaryPaletteKeyColor,
      tertiaryPaletteKeyColor: this.tertiaryPaletteKeyColor,
      neutralPaletteKeyColor: this.neutralPaletteKeyColor,
      neutralVariantPaletteKeyColor: this.neutralVariantPaletteKeyColor,
      background: this.background,
      onBackground: this.onBackground,
      surface: this.surface,
      surfaceDim: this.surfaceDim,
      surfaceBright: this.surfaceBright,
      surfaceContainerLowest: this.surfaceContainerLowest,
      surfaceContainerLow: this.surfaceContainerLow,
      surfaceContainer: this.surfaceContainer,
      surfaceContainerHigh: this.surfaceContainerHigh,
      surfaceContainerHighest: this.surfaceContainerHighest,
      onSurface: this.onSurface,
      surfaceVariant: this.surfaceVariant,
      onSurfaceVariant: this.onSurfaceVariant,
      inverseSurface: this.inverseSurface,
      inverseOnSurface: this.inverseOnSurface,
      outline: this.outline,
      outlineVariant: this.outlineVariant,
      shadow: this.shadow,
      scrim: this.scrim,
      surfaceTint: this.surfaceTint,
      primary: this.primary,
      onPrimary: this.onPrimary,
      primaryContainer: this.primaryContainer,
      onPrimaryContainer: this.onPrimaryContainer,
      inversePrimary: this.inversePrimary,
      secondary: this.secondary,
      onSecondary: this.onSecondary,
      secondaryContainer: this.secondaryContainer,
      onSecondaryContainer: this.onSecondaryContainer,
      tertiary: this.tertiary,
      onTertiary: this.onTertiary,
      tertiaryContainer: this.tertiaryContainer,
      onTertiaryContainer: this.onTertiaryContainer,
      error: this.error,
      onError: this.onError,
      errorContainer: this.errorContainer,
      onErrorContainer: this.onErrorContainer,
      primaryFixed: this.primaryFixed,
      primaryFixedDim: this.primaryFixedDim,
      onPrimaryFixed: this.onPrimaryFixed,
      onPrimaryFixedVariant: this.onPrimaryFixedVariant,
      secondaryFixed: this.secondaryFixed,
      secondaryFixedDim: this.secondaryFixedDim,
      onSecondaryFixed: this.onSecondaryFixed,
      onSecondaryFixedVariant: this.onSecondaryFixedVariant,
      tertiaryFixed: this.tertiaryFixed,
      tertiaryFixedDim: this.tertiaryFixedDim,
      onTertiaryFixed: this.onTertiaryFixed,
      onTertiaryFixedVariant: this.onTertiaryFixedVariant,
    };
  }

  /**
   * Generates a color scheme based on the current instance and applies any modifications specified in the options.
   * @param options - Optional configuration object to modify the generated color scheme.
   * @returns {ColorScheme} The generated color scheme, potentially modified by the provided options.
   */
  public toColorScheme(options?: ColorSchemeOptions): ColorScheme {
    return generateColorScheme(this, options);
  }
}
