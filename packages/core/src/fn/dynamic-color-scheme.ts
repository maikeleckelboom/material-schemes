import {DynamicColorScheme} from "../theme";
import {isColor} from '../utils';
import type {Color, DynamicSchemeOptions} from "../types";

export function dynamicColorScheme(
  source: Color | DynamicSchemeOptions,
  options?: Omit<DynamicSchemeOptions, 'sourceColor'>,
): DynamicColorScheme {
  if (isColor(source) && source == null) {
    throw new Error('Invalid argument: source must be a Color or DynamicSchemeOptions');
  }
  if (isColor(source)) {
    return new DynamicColorScheme(source, options);
  }
  if (typeof source === 'object') {
    return new DynamicColorScheme(source);
  }

  throw new Error('Invalid argument: source must be a Color or DynamicSchemeOptions');
}
