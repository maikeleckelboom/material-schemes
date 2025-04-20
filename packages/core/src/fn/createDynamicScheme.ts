import {DynamicColorScheme, type DynamicColorSchemeOptions} from "../theme";
import type {Color} from "../types";
import {isColor} from "../utils";

export function createDynamicScheme(
  source: Color | DynamicColorSchemeOptions,
  options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>,
): DynamicColorScheme {
  if (isColor(source)) {
    return new DynamicColorScheme(source, options);
  }

  if (typeof source === 'object' && source !== null) {
    return new DynamicColorScheme(source);
  }

  throw new Error(
    'Invalid scheme configuration. Expected either a color value (number/string/HCT) ' +
    'or a complete DynamicColorSchemeOptions object.'
  );
}

const t = createDynamicScheme('#88ff85')
const t2 = createDynamicScheme(0xFF6200EE, {
  primary: 0xFFBB86FC,
  secondary: 0xFF03DAC5,
  tertiary: 0xFF018786,
  neutral: 0xFF121212,
  neutralVariant: 0xFF121212,
  contrastLevel: 0.5,
  style: 'tonalSpot',
});
