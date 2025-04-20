import type {ModeledColorScheme, ColorScheme} from "./color-scheme-types.ts";

/**
 * Defines the signature for a function used to modify a generated color scheme
 * after initial generation but before final output.
 *
 * This allows for custom tweaks and overrides to the color Values.
 *
 * @template V Boolean indicating if the scheme being modified includes light/dark suffixed variants.
 * This ensures the function receives and potentially returns the correct scheme shape.
 * @template R The expected return type of the modification function, defaults to the input
 * scheme type potentially merged with partial overrides.
 * @param colorScheme The generated color scheme object (potentially including variants) to be modified.
 * @returns The modified color scheme object.
 *
 * @see ModeledColorScheme for the structure of the `scheme` parameter and default return type `R`.
 * @see SharedColorSchemeConfig where this function type is typically used.
 */
type ModifyColorSchemeFn<
  V extends boolean = false,
  R = ModeledColorScheme<V> & Partial<ColorScheme>
> = (colorScheme: ModeledColorScheme<V>) => R;

/**
 * Configuration options specifically related to the generation and modification
 * of color Values within a single color scheme (e.g., for a base theme, light, or dark).
 *
 * @template V Boolean indicating if the context where this config is used involves brightness variants.
 * This often influences the signature of `modifyColorScheme`, Defaults to `boolean`.
 */
export interface SharedColorSchemeConfig<V extends boolean = boolean> {
  /**
   * Specifies which tones from the tonal palettes should be included in the output scheme.
   * - `true`: Include a default set of tones (implementation-defined).
   * - `number[]`: An array of specific tone Values (e.g., [0, 10, 90, 100]) to include.
   * - `undefined` (or omitted): Include all tones (0-100).
   */
  paletteTones?: boolean | number[];

  /**
   * An optional function to modify the generated color scheme object after
   * initial palette generation but before final use or output.
   * Allows for fine-grained adjustments or overrides.
   *
   * @see ModifyColorSchemeFn for the function signature.
   */
  modifyColorScheme?: ModifyColorSchemeFn<V>;
}

/**
 * Configuration options for generating the overall theme structure, including
 * whether to generate dark mode and suffixed brightness variants, in addition
 * to the base color generation options.
 *
 * @template V If true, enables the generation of suffixed keys
 * (e.g., `primaryLight`, `primaryDark`) alongside the base keys.
 * Defaults to `false`.
 * @template D If true, allows enabling dark mode generation via the `dark` property.
 * If false, the `dark` property is disallowed, defaults to `true`.
 * @extends SharedColorSchemeConfig Extends base options for palette tones and modification.
 */
export interface ColorSchemeConfig<
  V extends boolean = false,
  D extends boolean = true
> extends SharedColorSchemeConfig<V> {
  /**
   * Determines whether a dark color scheme should be generated alongside the light/default one.
   * Only available if the `D` generic is `true`.
   * - `true`: Generate both light and dark schemes.
   * - `false` or omitted: Generate only the light/default scheme.
   */
  dark?: D extends true ? boolean : never;

  /**
   * Explicitly enables or disables the generation of suffixed brightness variants
   * (e.g., `primaryLight`, `primaryDark`) in the final output object.
   * Should match the `V` generic passed to the configuration context.
   * - `true`: Include suffixed variants.
   * - `false` or omitted: Do not include suffixed variants.
   */
  brightnessVariants?: V;
}

/**
 * Configuration options specifically related to generating CSS output,
 * such as CSS Custom Properties (variables).
 */
export interface SerializeCssVarsConfig {
  /**
   * The CSS selector under which the color variables should be emitted.
   * If omitted, variables are typically emitted under `:root` or a default selector.
   * @example ':root'
   * @example '.theme-dark'
   */
  selector?: string;

  /**
   * If true, the generated CSS output will be minified.
   * @default false
   */
  minify?: boolean;
}

/**
 * A comprehensive configuration interface that combines options for theme structure generation
 * (light/dark modes, variants from `ColorSchemeConfig`) with options for CSS output
 * (`SerializeCssVarsConfig`).
 *
 * Typically used when generating themed CSS Custom Properties (variables) directly from
 * the color scheme generation process.
 *
 * @template V Enables/disables suffixed brightness variants.
 * @template D Allows/disallows dark mode generation, defaults to `true`.
 * @extends ColorSchemeConfig Inherits theme structure options.
 * @extends SerializeCssVarsConfig Inherits CSS output options.
 */
export interface ColorSchemeStylesConfig<
  V extends boolean,
  D extends boolean = true
> extends ColorSchemeConfig<V, D>, SerializeCssVarsConfig {
}
