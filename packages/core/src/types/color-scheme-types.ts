import {MATERIAL_COLOR_ROLES} from "../constants";
import type {Color} from "./color.ts";

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
 * standard Material color roles to their corresponding `Color` Values.
 * This type enforces the presence of all standard roles defined in `ColorRoleKey`.
 *
 * @see ColorRoleKey for the required standard keys.
 * @see Color for the value type.
 */
export type MaterialColorScheme = {
  [key in ColorRoleKey]: Color;
};

/**
 * Represents a complete color scheme, including all standard Material Design roles
 * and potentially additional custom or extended color roles.
 *
 * It extends `MaterialColorScheme` to ensure all standard roles are present
 * and adds an index signature `[key: string]: Color` to allow any number of
 * extra string keys mappings to `Color` Values. This is often used to hold the
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
export type ModeledColorScheme<V extends boolean = false> =
  V extends true
    ? ColorScheme & SuffixedColorScheme<"Light"> & SuffixedColorScheme<"Dark">
    : ColorScheme
