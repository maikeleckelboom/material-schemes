import {PaletteStyle} from "../theme";
import {
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant
} from "@material/material-color-utilities";
import {PALETTE_STYLE_NAMES} from "../constants";

/**
 * Represents a color value that can be either a number or a string.
 *
 * Accepted formats:
 * - ARGB numeric values (e.g., 0xFFFFFFFF for white).
 * - Hexadecimal color codes as strings (e.g., "#FFFFFF" for white).
 */
export type Color = number | string;

/**
 * A union type representing the valid string names for predefined Material Design 3
 * dynamic color palette generation styles (e.g., 'TonalSpot', 'Vibrant').
 *
 * Derived from the available `PaletteStyle` options.
 * Useful for referring to a style by name.
 *
 * @see PaletteStyle for the corresponding style objects/enums.
 * @example 'Vibrant'
 */
export type PaletteStyleName = typeof PALETTE_STYLE_NAMES[number];

/**
 * A type union encompassing all specific, concrete implementations of Material Design 3
 * dynamic color schemes (like SchemeContent, SchemeExpressive, etc.).
 */
export type SchemeVariant =
  | SchemeContent
  | SchemeExpressive
  | SchemeFidelity
  | SchemeFruitSalad
  | SchemeMonochrome
  | SchemeNeutral
  | SchemeRainbow
  | SchemeTonalSpot
  | SchemeVibrant;

/**
 * Represents an extended color object that includes additional metadata
 * about a color.
 *
 * @interface ExtendedColor
 * @property {string} name - The name of the color.
 * @property {Color} value - The base color value, typically represented as a predefined color object or value.
 * @property {boolean} [blend] - An optional property indicating whether the color can be blended with others.
 * @property {string} [description] - An optional property that provides a human-readable description of the color.
 */
export interface ExtendedColor {
  name: string;
  value: Color;
  blend?: boolean;
  description?: string;
}

/**
 * Options for generating a dynamic color scheme based on Material Design 3 principles.
 * Allows specifying a source color or overriding individual palettes.
 *
 * @see https://m3.material.io/styles/color/dynamic-color/overview
 */
export interface DynamicColorSchemeOptions {
  /**
   * The single seed color used to generate all tonal palettes.
   * If primary, secondary, etc. are provided, they override the generated palettes.
   *
   * @example '#6750A4' or 0xFF6750A4
   */
  sourceColor?: Color;

  /**
   * Specifies a custom primary color for the theme.
   * When provided with `sourceColor`, this overrides the primary tonal palette.
   * When used without `sourceColor`, this serves as the main seed color.
   * Used for prominent interactive elements like buttons, active states, and primary actions.
   */
  primary?: Color;

  /**
   * Defines the aesthetic style of the generated color palettes (e.g., `Vibrant`, `Expressive`, `TonalSpot`).
   * Can be a predefined style object or the name of a style.
   *
   * @default 'TonalSpot'
   * @see https://m3.material.io/styles/color/dynamic-color/user-generated-color#cda6c985-814f-496c-be19-9e043b69f8f5
   */
  style?: PaletteStyle | PaletteStyleName;

  /**
   * Adjusts the contrast level between colors.
   * A value of 0.0 is the default contrast.
   * Negative values decrease contrast, positive values increase it.
   * The exact behavior depends on the underlying dynamic color generation algorithm.
   *
   * @default 0.0
   * @see https://m3.material.io/styles/color/dynamic-color/user-generated-color#9ae639f2-d46e-4a11-a0c6-e77d52d3ce5a
   */
  contrastLevel?: number;

  /**
   * Toggles the generated scheme between light and dark modes.
   * `true` generates a dark scheme, `false` generates a light scheme.
   *
   * @default false
   */
  isDark?: boolean;

  /**
   * Overrides the generated secondary tonal palette.
   * Often used for less prominent components, filters, and extending the color expression.
   */
  secondary?: Color;

  /**
   * Overrides the generated tertiary tonal palette.
   * Used for contrasting accents and highlighting elements.
   */
  tertiary?: Color;

  /**
   * Overrides the generated neutral tonal palette.
   * Primarily used for surface colors (like backgrounds) and text/icon colors.
   */
  neutral?: Color;

  /**
   * Overrides the generated neutral variant tonal palette.
   * Used for medium-emphasis elements, like outlines, dividers, and secondary text.
   */
  neutralVariant?: Color;
}

/**
 * Configuration options for creating a complete Material Theme, potentially including custom colors.
 * This builds upon `DynamicColorSchemeOptions` but excludes the `isDark` property,
 * as light/dark modes might be handled separately or through a different mechanism.
 */
export type MaterialThemeOptions = Omit<DynamicColorSchemeOptions, 'isDark'> & {
  /**
   * An array of additional, custom color roles beyond the standard
   * Material Design palettes (primary, secondary, tertiary, etc.).
   * Useful for brand colors or specific UI requirements.
   *
   * @example
   * ```ts
   * const options: MaterialThemeOptions = {
   *   sourceColor: '#FF0000',
   *   extendedColors: [{
   *     name: 'Custom blue',
   *     value: '#0000FF',
   *     description: 'Special element color',
   *     blend: true
   *   }]
   * }
   * ```
   */
  extendedColors?: ExtendedColor[];
};


