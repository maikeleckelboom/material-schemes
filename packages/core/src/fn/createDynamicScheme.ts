import {DynamicColorScheme} from "../theme";
import type {Color, DynamicColorSchemeOptions} from "../types";
import {isColor} from "../utils";

export function createDynamicScheme(
  source: Color | DynamicColorSchemeOptions,
  options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>,
): DynamicColorScheme {
  if (isColor(source)) {
    return new DynamicColorScheme({
      sourceColor: source,
      ...options,
    });
  }
  throw new Error(
    'Invalid scheme configuration. Expected either a color value (number/string/HCT) ' +
    'or a complete DynamicColorSchemeOptions object.'
  );
}
