import {PALETTE_STYLE_NAMES} from "../constants/defaults";
import {
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
} from "@material/material-color-utilities";

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
export type PaletteStyleSchemeVariant =
  | SchemeContent
  | SchemeExpressive
  | SchemeFidelity
  | SchemeFruitSalad
  | SchemeMonochrome
  | SchemeNeutral
  | SchemeRainbow
  | SchemeTonalSpot
  | SchemeVibrant;
