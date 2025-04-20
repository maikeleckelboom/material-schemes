import type {Color, ExtendedColor, MaterialThemeOptions} from "../types";
import {MaterialTheme} from "../theme";
import {isColor} from "../utils";

export function createMaterialTheme(
  sourceColor: Color,
  options?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
): MaterialTheme;
export function createMaterialTheme(options: MaterialThemeOptions): MaterialTheme;
export function createMaterialTheme(
  sourceOrOptions: Color | MaterialThemeOptions,
  optionsOrExtendedColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
): MaterialTheme {
  // @ts-ignore let the class constructor handle the overloads
  return new MaterialTheme(sourceOrOptions, optionsOrExtendedColors);
}
