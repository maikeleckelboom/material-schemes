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
  [K in ColorRoleKey]: Color;
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
