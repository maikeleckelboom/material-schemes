import type {Color} from "./color.ts";
import type {ColorRoleKey, ColorScheme} from "./color-scheme-types.ts";

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
export type ColorSchemeReturnType<V extends boolean = false> =
  V extends true
    ? ColorScheme & LightColorScheme & DarkColorScheme
    : ColorScheme
