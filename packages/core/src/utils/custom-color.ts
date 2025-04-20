import {customColor, type CustomColorGroup} from "@material/material-color-utilities";
import {toArgb} from "./conversion.ts";
import type {Color, ExtendedColor} from "../types";

/**
 * Generate a custom color group from source and target color
 *
 * @param source Source color
 * @param color Custom color
 * @return Custom color group
 *
 * @link https://m3.material.io/styles/color/the-color-system/color-roles
 */
export function createCustomColorGroup(source: Color, color: ExtendedColor): CustomColorGroup {
  return customColor(toArgb(source), {
    name: color.name,
    value: toArgb(color.value),
    blend: !!color.blend,
  })
}

// TODO: Make a new interface named `ExtendedColorGroup`
//  with formatted names and color roles
