import type {Color, ExtendedColor, MaterialThemeOptions} from "../types";
import {isColor} from "../utils";


export function normalizeThemeOptions(
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
