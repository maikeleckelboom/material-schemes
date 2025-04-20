import type {Color, ExtendedColor, MaterialThemeOptions} from "../types";
import {MaterialTheme} from "../theme";
import {normalizeThemeOptions} from "./internals.ts";

export function dynamicMaterialTheme(
  sourceColor: Color,
  options?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
): MaterialTheme;
export function dynamicMaterialTheme(options: MaterialThemeOptions): MaterialTheme;
export function dynamicMaterialTheme(
  sourceOrOptions: Color | MaterialThemeOptions,
  optionsOrColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
): MaterialTheme {
  const options = normalizeThemeOptions(sourceOrOptions, optionsOrColors);
  return new MaterialTheme(options);
}
