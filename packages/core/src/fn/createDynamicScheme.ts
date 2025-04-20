import {DynamicColorScheme} from "../theme";
import type {Color, DynamicColorSchemeOptions} from "../types";
import {isColor} from "../utils";

export function createDynamicScheme(
  source: Color | DynamicColorSchemeOptions,
  options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>,
): DynamicColorScheme {
  if (isColor(source)) {
    return new DynamicColorScheme(source, options);
  }
  if (typeof source === 'object') {
    return new DynamicColorScheme(source);
  }
  // If source is not a color or an object, throw an error
  // This is a safeguard, as TypeScript should prevent this case
  throw new Error(
    'Invalid scheme configuration. Expected either a color value (number/string/HCT) ' +
    'or a complete DynamicColorSchemeOptions object.'
  );
}
