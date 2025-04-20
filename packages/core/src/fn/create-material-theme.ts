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
  optionsOrColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
): MaterialTheme {
  const options = resolveThemeOptions(sourceOrOptions, optionsOrColors);
  return new MaterialTheme(options);
}

export function resolveThemeOptions(
  sourceOrOptions: Color | MaterialThemeOptions,
  optionsOrColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
): MaterialThemeOptions {
  if (isColor(sourceOrOptions)) {
    if (Array.isArray(optionsOrColors)) {
      return {
        sourceColor: sourceOrOptions,
        extendedColors: optionsOrColors
      };
    }
    return {
      sourceColor: sourceOrOptions,
      ...optionsOrColors
    };
  }
  return sourceOrOptions;
}
