import {MaterialDynamicScheme} from "../theme";
import type {Color, DynamicSchemeOptions} from "../types";

import {isColor} from '../utils/color';

export function createDynamicScheme(
  source: Color | DynamicSchemeOptions,
  options?: Omit<DynamicSchemeOptions, 'sourceColor'>,
): MaterialDynamicScheme {
  if (isColor(source) && source == null) {
    throw new Error('Invalid argument: source must be a Color or DynamicSchemeOptions');
  }
  if (isColor(source)) {
    return new MaterialDynamicScheme(source, options);
  }
  if (typeof source === 'object') {
    return new MaterialDynamicScheme(source);
  }

  throw new Error('Invalid argument: source must be a Color or DynamicSchemeOptions');
}
