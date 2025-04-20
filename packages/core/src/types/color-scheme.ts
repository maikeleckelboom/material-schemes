import {MATERIAL_COLOR_ROLES} from "../constants";
import type {Color} from "./theme.ts";

/**
 * Represents the valid string names for standard Material Design color roles.
 * This is a union type derived from the `MATERIAL_COLOR_ROLES` constant,
 * including names like 'primary', 'onPrimary', 'secondary', 'surface', etc.
 *
 * @see MATERIAL_COLOR_ROLES for the source array of role names.
 */
export type ColorRoleKey = (typeof MATERIAL_COLOR_ROLES)[number];

/**
 * Defines the core structure for a Material Design color scheme, mapping
 * standard Material color roles to their corresponding `Color` values.
 * This type enforces the presence of all standard roles defined in `ColorRoleKey`.
 *
 * @see ColorRoleKey for the required standard keys.
 * @see Color for the value type.
 */
export type MaterialColorScheme = {
  [K in ColorRoleKey]: Color;
};

/**
 * Represents a complete color scheme, including all standard Material Design roles
 * and potentially additional custom or extended color roles.
 *
 * It extends `MaterialColorScheme` to ensure all standard roles are present,
 * and adds an index signature `[key: string]: Color` to allow any number of
 * extra string keys mapping to `Color` values. This is often used to hold the
 * final theme object containing standard and extended/custom colors.
 *
 * @see MaterialColorScheme for the base set of standard roles.
 * @see Color for the value type.
 */
export interface ColorScheme extends MaterialColorScheme {
  /** Allows for additional, non-standard color roles (e.g., custom brand colors). */
  [key: string]: Color;
}

/**
 * A generic type that creates a color scheme object where the standard Material Design
 * color role keys are transformed by appending a specified `Suffix`.
 *
 * For example, given `ColorRoleKey` 'primary' and `Suffix` 'Light', it creates a key 'primaryLight'.
 * Used to generate theme-specific variants (e.g., light and dark modes) with distinct key names.
 *
 * @template Suffix The string suffix to append to each standard color role key (e.g., "Light", "Dark").
 * @see ColorRoleKey for the base keys being transformed.
 * @see LightColorScheme for an example usage with "Light".
 * @see DarkColorScheme for an example usage with "Dark".
 */
type SuffixedColorScheme<Suffix extends string> = {
  [K in ColorRoleKey as `${K}${Suffix}`]: Color;
};

/**
 * Represents a color scheme specifically generated or adapted for a **light UI theme**.
 *
 * This type is a specialization of `SuffixedColorScheme` using the 'Light' identifier.
 * Its color role keys include a 'Light' suffix (e.g., `primaryLight`, `onSurfaceLight`).
 *
 * @see SuffixedColorScheme for the generic structure with suffixed keys.
 * @see DarkColorScheme for the dark theme equivalent.
 */
export type LightColorScheme = SuffixedColorScheme<"Light">;

/**
 * Represents a color scheme specifically generated or adapted for a **dark UI theme**.
 *
 * This type is a specialization of `SuffixedColorScheme` using the 'Dark' identifier.
 * Its color role keys include a 'Dark' suffix (e.g., `primaryDark`, `onSurfaceDark`).
 *
 * @see SuffixedColorScheme for the generic structure with suffixed keys.
 * @see LightColorScheme for the light theme equivalent.
 */
export type DarkColorScheme = SuffixedColorScheme<"Dark">;

/**
 * A conditional type determining the structure of a generated color scheme object
 * based on whether brightness variants (light/dark suffixed keys) are included.
 *
 * @template V A boolean indicating if brightness variants (`LightColorScheme`, `DarkColorScheme`) are generated (`true`) or not (`false`). Defaults to `false`.
 *
 * @returns If `AllowV` is `true`, returns an intersection type containing the base `ColorScheme`
 * (standard + custom roles) merged with `LightColorScheme` and `DarkColorScheme` (suffixed roles).
 * @returns If `AllowV` is `false`, returns just the base `ColorScheme`.
 *
 * @see ColorScheme for the base scheme structure.
 * @see LightColorScheme for the light variant structure.
 * @see DarkColorScheme for the dark variant structure.
 */
export type ColorSchemeReturnType<AllowVariants extends boolean = false> =
  AllowVariants extends true
    ? ColorScheme & LightColorScheme & DarkColorScheme
    : ColorScheme

/**
 * Defines the signature for a function used to modify a generated color scheme
 * after initial generation but before final output.
 *
 * This allows for custom tweaks and overrides to the color values.
 *
 * @template AllowVariants Boolean indicating if the scheme being modified includes light/dark suffixed variants.
 * This ensures the function receives and potentially returns the correct scheme shape.
 * @template ReturnType The expected return type of the modification function, defaults to the input
 * scheme type potentially merged with partial overrides.
 * @param colorScheme The generated color scheme object (potentially including variants) to be modified.
 * @returns The modified color scheme object.
 *
 * @see ColorSchemeReturnType for the structure of the `scheme` parameter and default return type `R`.
 * @see ColorSchemeConfig where this function type is typically used.
 */
export type ModifyColorSchemeFn<
  AllowVariants extends boolean = false,
  ReturnType = ColorSchemeReturnType<AllowVariants> & Partial<ColorScheme>
> = (colorScheme: ColorSchemeReturnType<AllowVariants>) => ReturnType;

/**
 * Configuration options specifically related to the generation and modification
 * of color values within a single color scheme (e.g., for a base theme, light, or dark).
 *
 * @template V Boolean indicating if the context where this config is used involves brightness variants.
 * This often influences the signature of `modifyColorScheme`, Defaults to `boolean`.
 */
export interface ColorSchemeConfig<AllowVariants extends boolean = boolean> {
  /**
   * Specifies which tones from the tonal palettes should be included in the output scheme.
   * - `true`: Include a default set of tones (implementation-defined).
   * - `number[]`: An array of specific tone values (e.g., [0, 10, 90, 100]) to include.
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
  modifyColorScheme?: ModifyColorSchemeFn<AllowVariants>;
}

/**
 * Configuration options for generating the overall theme structure, including
 * whether to generate dark mode and suffixed brightness variants, in addition
 * to the base color generation options.
 *
 * @template AllowVariants If true, enables the generation of suffixed keys
 * (e.g., `primaryLight`, `primaryDark`) alongside the base keys.
 * Defaults to `false`.
 * @template AllowDark If true, allows enabling dark mode generation via the `dark` property.
 * If false, the `dark` property is disallowed, defaults to `true`.
 * @extends ColorSchemeConfig Extends base options for palette tones and modification.
 */
export interface ThemeColorSchemeConfig<
  AllowVariants extends boolean = false,
  AllowDark extends boolean = true
> extends ColorSchemeConfig<AllowVariants> {
  /**
   * Determines whether a dark color scheme should be generated alongside the light/default one.
   * Only available if the `AllowDark` generic is `true`.
   * - `true`: Generate both light and dark schemes.
   * - `false` or omitted: Generate only the light/default scheme.
   */
  dark?: AllowDark extends true ? boolean : never;

  /**
   * Explicitly enables or disables the generation of suffixed brightness variants
   * (e.g., `primaryLight`, `primaryDark`) in the final output object.
   * Should match the `AllowVariants` generic passed to the configuration context.
   * - `true`: Include suffixed variants.
   * - `false` or omitted: Do not include suffixed variants.
   */
  brightnessVariants?: AllowVariants;
}

/**
 * Configuration options specifically related to generating CSS output,
 * such as CSS Custom Properties (variables).
 */
export interface StylesheetConfig {
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
 * (light/dark modes, variants from `ThemeColorSchemeConfig`) with options for CSS output
 * (`StylesheetConfig`).
 *
 * Typically used when generating themed CSS Custom Properties (variables) directly from
 * the color scheme generation process.
 *
 * @template AllowVariants Enables/disables suffixed brightness variants.
 * @template AllowDark Allows/disallows dark mode generation, defaults to `true`.
 * @extends ThemeColorSchemeConfig Inherits theme structure options.
 * @extends StylesheetConfig Inherits CSS output options.
 */
export interface ColorSchemeStylesConfig<
  AllowVariants extends boolean,
  AllowDark extends boolean = true
> extends ThemeColorSchemeConfig<AllowVariants, AllowDark>, StylesheetConfig {
  // This interface combines the properties from the extended interfaces.
  // No additional properties are defined here directly.
}
