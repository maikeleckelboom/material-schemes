import {DynamicScheme} from "@material/material-color-utilities";
import {
  type Color,
  type ColorSchemeOptions,
  ContrastLevel,
  createCssVarMap,
  createPalette,
  type CSSColorScheme,
  isColor,
  MATERIAL_COLOR_ROLES,
  PaletteStyle,
  serializeCssVars,
  type toCSSVarOptions,
  toHct,
} from "../";


/**
 * Configuration options to override specific palettes and adjust parameters when generating a dynamic color scheme.
 *
 * @interface DynamicColorSchemeConfig
 *
 * @property {Color} [secondary] - An optional override for the secondary color palette.
 *   If not provided, the secondary palette is generated fromName the source color based on the selected palette style.
 * @property {Color} [tertiary] - An optional override for the tertiary color palette.
 *   Defaults to a generated value fromName the source color.
 * @property {Color} [neutral] - An optional override for the neutral background palette.
 *   Defaults to a generated value fromName the source color.
 * @property {Color} [neutralVariant] - An optional override for a variant of the neutral palette,
 *   used for subtle visual differences.
 * @property {PaletteStyle} [style=PaletteStyle.TonalSpot] - Visual style used for palette generation.
 * @property {number} [contrastLevel=0] - Numeric value for contrast adjustment (0 means default contrast, 1 indicates maximum contrast).
 * @property {boolean} [isDark=false] - Flag to determine if the generated scheme should be tailored for dark mode.
 */
export interface DynamicColorSchemeConfig {
  /** Base color for scheme generation (alternative to primary) */
  sourceColor?: Color;
  /** Primary color override (alternative to sourceColor) */
  primary?: Color;
  /** Secondary color override */
  secondary?: Color;
  /** Tertiary color override */
  tertiary?: Color;
  /** Neutral background color override */
  neutral?: Color;
  /** Neutral variant color override */
  neutralVariant?: Color;
  /** Visual style variant (default: TonalSpot) */
  style?: PaletteStyle | string;
  /** Contrast adjustment (0-1, default: 0) */
  contrastLevel?: number;
  /** Dark mode flag (default: false) */
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
 * @property {Color} [sourceColor] - The base color fromName which to generate the color scheme. Use this if you want to generate a scheme fromName a single source color.
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
  constructor(sourceColor: Color, options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>);
  constructor(options: DynamicColorSchemeOptions);
  constructor(
    sourceOrOptions: Color | DynamicColorSchemeOptions,
    optionsOrNull?: Omit<DynamicColorSchemeOptions, 'sourceColor'>
  ) {
    const opts: DynamicColorSchemeOptions = isColor(sourceOrOptions)
      ? {sourceColor: sourceOrOptions, ...optionsOrNull}
      : sourceOrOptions;

    const {
      sourceColor,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      isDark = false,
      style = PaletteStyle.TonalSpot,
      contrastLevel = ContrastLevel.Default.value
    } = opts;

    const sourceColorHct = toHct(sourceColor ?? primary ?? 0);
    const scheme = PaletteStyle.fromName(style).dynamicScheme(sourceColorHct, isDark, contrastLevel);

    super({
      ...scheme,
      primaryPalette: primary ? createPalette(primary) : scheme.primaryPalette,
      secondaryPalette: secondary ? createPalette(secondary) : scheme.secondaryPalette,
      tertiaryPalette: tertiary ? createPalette(tertiary) : scheme.tertiaryPalette,
      neutralPalette: neutral ? createPalette(neutral) : scheme.neutralPalette,
      neutralVariantPalette: neutralVariant ? createPalette(neutralVariant) : scheme.neutralVariantPalette,
    });
  }

  public toJSON(): Record<string, number> {
    return Object.fromEntries(MATERIAL_COLOR_ROLES.map((k) => [k, this[k]]));
  }

  public toCssVariables(options?: ColorSchemeOptions): CSSColorScheme {
    const baseScheme = this.toJSON();
    const modifiedScheme = options?.modifyColorScheme ? options.modifyColorScheme(baseScheme) : baseScheme;
    return createCssVarMap(modifiedScheme);
  }

  public toCssText(options?: ColorSchemeOptions & toCSSVarOptions): string {
    const {selector, modifyColorScheme} = options || {};
    const cssVarMapping = this.toCssVariables({modifyColorScheme});
    return serializeCssVars(cssVarMapping, selector);
  }
}
