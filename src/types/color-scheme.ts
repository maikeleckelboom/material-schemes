import { COLOR_SCHEME_KEYS } from '../constants';

/**
 * A color value that can be a string (e.g., hex color code) or a number (e.g., ARGB format).
 */
export type Color = string | number;

/**
 * A looser version of the original Material color export.
 * Accepts hex strings in `value`, and `blend` is optional.
 */
export interface StaticColor {
  name: string;
  value: Color;
  blend?: boolean;
}

/**
 * Union type representing valid color scheme keys or any string.
 * @type {string} ColorKey
 * @description While technically allowing any string, should primarily use predefined M3 color keys
 * for proper type safety and design system compliance.
 */
export type ColorKey = (typeof COLOR_SCHEME_KEYS)[number];

/**
 * Interface representing a complete Material Design 3 color scheme
 * @interface
 * @property {number} [key] - Numeric color value (typically 32-bit integer in 0xAARRGGBB format)
 * @description Maps M3 color roles to their actual color values. While extensible via string index,
 * custom properties should follow M3 naming conventions.
 */
export interface ColorScheme extends Record<ColorKey | string, number> {}

/**
 * Color scheme representing a collection of custom colors
 * @template T - Generic type extending Record<string, string | number>
 * @type {CustomColorScheme<T>} CustomColorScheme allows for additional properties
 * @description This type is used for custom color schemes that may not strictly adhere to M3 naming conventions.
 */
export type CustomColorScheme<T = Record<string, string | number>> = T & {
  [key: string]: number;
};

/**
 * Utility type for creating color scheme variants with suffix-appended keys
 * @template Suffix - String suffix to append to color keys
 * @type {Object} SuffixedColorScheme
 * @example
 * type PrimaryLight = SuffixedColorScheme<'Light'>; // Creates { primaryLight: number, ... }
 */
type SuffixedColorScheme<Suffix extends string> = {
  [K in ColorKey as `${K}${Suffix}`]: number;
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
 * @type {ColorScheme | (ColorScheme & LightColorScheme & DarkColorScheme)} ColorSchemeReturnType
 * @description When brightnessVariants=true, combines base scheme with light/dark variants
 * @example
 * // With variants:
 * type FullScheme = ColorSchemeReturnType<true>;  // Contains 'primary', 'primaryLight', 'primaryDark'
 * // Without variants:
 * type BaseScheme = ColorSchemeReturnType; // Only contains base keys
 */
export type ColorSchemeReturnType<V extends boolean> = V extends true
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
export interface ColorSchemeOptions<V extends boolean = false> {
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
   * Set to `false` to disable tonal palette generation.
   * If an array is provided, it should contain the tones to be generated.
   * @default false
   */
  paletteTones?: false | number[];
  /**
   * Type-safe color scheme modifier that preserves existing properties
   * while allowing new property additions
   */
  modifyColorScheme?: <T extends ColorSchemeReturnType<V>>(colorScheme: T) => T;
}
