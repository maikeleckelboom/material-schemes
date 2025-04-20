import {MaterialDynamicScheme} from "../theme";
import type {Color, MaterialDynamicSchemeOptions} from "../types";
import {isColor} from "../utils";

export function createDynamicScheme(
  source: Color | MaterialDynamicSchemeOptions,
  options?: Omit<MaterialDynamicSchemeOptions, 'sourceColor'>,
): MaterialDynamicScheme {
  if (isColor(source)) {
    return new MaterialDynamicScheme(source, options);
  }
  if (typeof source === 'object') {
    return new MaterialDynamicScheme(source);
  }

  throw new Error('Invalid argument: source must be a Color or MaterialDynamicSchemeOptions');
}
