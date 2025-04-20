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
  optionsOrCustomColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
): MaterialTheme {
  const options = (() => {
    if (isColor(sourceOrOptions)) {
      if (Array.isArray(optionsOrCustomColors)) {
        return {
          sourceColor: sourceOrOptions,
          customColors: optionsOrCustomColors
        };
      }
      return {
        sourceColor: sourceOrOptions,
        ...optionsOrCustomColors
      };
    }
    return sourceOrOptions;
  })();
  return new MaterialTheme(options);
}
