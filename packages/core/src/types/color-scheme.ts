import {MATERIAL_COLOR_ROLES} from "../constants";
import type {Color} from "./theme.ts";
import type {KebabCase} from "type-fest";

/**
 * Union type representing valid color scheme keys or any string.
 * @type {string} ColorRoleKey
 * @description While technically allowing any string, should primarily use predefined M3 color keys
 * for proper type safety and design system compliance.
 */
export type ColorRoleKey = (typeof MATERIAL_COLOR_ROLES)[number];

/**
 * Interface representing a complete Material Design 3 color scheme
 * @interface
 * @property {number} [key] - Numeric color value (typically 32-bit integer in 0xAARRGGBB format)
 * @description Maps M3 color roles to their actual color entries. While extensible via string index,
 * custom properties should follow M3 naming conventions.
 */
export interface ColorScheme extends Record<ColorRoleKey | string, Color> {
  /** Custom or additional entries */
  [key: string]: Color;
}

/**
 * Interface for CSS color scheme variables
 * @interface
 * @property {string} [key] - Numeric color value (typically 32-bit integer in 0xAARRGGBB format)
 * @description Maps M3 color roles to their actual color entries. While extensible via string index,
 * custom properties should follow M3 naming conventions.
 */
export interface CSSColorScheme extends Record<KebabCase<ColorRoleKey | string>, Color> {
  [key: `--${KebabCase<ColorRoleKey | string>}`]: Color;
}


/**
 * Utility type for creating color scheme variants with suffix-appended keys
 * @template Suffix - String suffix to append to color keys
 * @type {Object} SuffixedColorScheme
 * @example
 * type PrimaryLight = SuffixedColorScheme<'Light'>; // Creates { primaryLight: number, ... }
 */
type SuffixedColorScheme<Suffix extends string> = {
  [K in ColorRoleKey as `${K}${Suffix}`]: Color;
};

/**
 * Light mode variant color scheme with '-Light' suffix appended to keys
 * @type {SuffixedColorScheme<'Light'>} LightColorScheme
 */
export type LightColorScheme = SuffixedColorScheme<'Light'>;

/**
 * Dark mode variant color scheme with '-Dark' suffix appended to keys
 * @type {SuffixedColorScheme<'Dark'>} DarkColorScheme
 */
export type DarkColorScheme = SuffixedColorScheme<'Dark'>;

/**
 * Return type for color scheme generation based on options
 * @template BV - Boolean type for brightness variants flag
 */
export type ColorSchemeReturnType<V extends boolean | undefined> = V extends true
  ? ColorScheme & LightColorScheme & DarkColorScheme
  : ColorScheme;

/**
 * Options for generating color schemes
 * @interface
 * @template V - Boolean type for brightness variants flag
 * @property {boolean} [dark=false] - Whether to generate dark mode colors
 * @property {V} [brightnessVariants=false] - Generate light/dark variants when true
 * @property {Function} [modifyColorScheme] - Post-processing function for scheme customization
 */
export interface ColorSchemeOptions<
  V extends boolean = boolean,
  U extends ColorSchemeReturnType<V> = ColorSchemeReturnType<V>
> {
  /**
   * Whether to use the dark scheme
   * @default false
   */
  dark?: boolean;
  /**
   * Whether to add light and dark variants of the colors
   * @default false
   */
  brightnessVariants?: V;
  /**
   * Specifies which tonal palette tones to generate and include in the color scheme.
   * - When `true`, uses the default array: [0,5,10,15,20,25,30,35,40,50,60,70,80,90,95,98,99,100]
   * - When `false` (default), disables tonal palette generation
   * - Provide a custom number array to specify exact tones
   * @default false
   */
  paletteTones?: boolean | number[];
  /**
   * The color scheme modifier accepts the generated color scheme and should
   * return a value that extends the base color scheme type.
   * This lets you add,
   * remove, or transform properties as long as the final result is assignable to U.
   */
  modifyColorScheme?: (colorScheme: ColorSchemeReturnType<V>) => U;
}
