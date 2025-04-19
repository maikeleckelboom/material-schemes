import {customColor, type CustomColorGroup} from "@material/material-color-utilities";
import {toArgb} from "./conversion.ts";
import type {Color, CustomColorOptions} from "../types";
import {formatTokenName} from "./formatting.ts";
import {deriveToneMapFromPalette} from "./color-scheme.ts";
import {createPalette} from "./palette.ts";

/**
 * Generate a custom color group from source and target color
 *
 * @param source Source color
 * @param color Custom color
 * @return Custom color group
 *
 * @link https://m3.material.io/styles/color/the-color-system/color-roles
 */
export function createCustomColorGroup(source: Color, color: CustomColorOptions): CustomColorGroup {
  return customColor(toArgb(source), {
    name: color.name,
    value: toArgb(color.value),
    blend: !!color.blend,
  })
}

export function createCustomColorPalettes(customColorGroups: CustomColorGroup[]): Record<string, Record<number, Color>> {
  return Object.fromEntries(
    customColorGroups.map(customColor => [
      formatTokenName(customColor.color.name),
      deriveToneMapFromPalette(createPalette(customColor.value)),
    ])
  );
}
