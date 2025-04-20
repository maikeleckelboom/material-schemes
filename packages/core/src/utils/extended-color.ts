import {harmonize} from "./blend.ts";
import {MaterialDynamicScheme} from "../theme";
import camelCase from "camelcase";
import type {ColorGroupOf, ExtendedColor, ExtendedColorGroup} from "../types";

export function createExtendedColor<C extends ExtendedColor>(
  source: number,
  color: C
): ExtendedColorGroup<C> {
  let value = color.value;
  if (color.blend) value = harmonize(value, source);

  const {primaryPalette: palette} = new MaterialDynamicScheme(source);
  const nameKey = camelCase(color.name);
  const pascalName = camelCase(color.name, {pascalCase: true});

  if (!palette) {
    throw new Error(`Palette is undefined for extended color: ${nameKey}`);
  }

  return {
    value,
    color,
    palette,
    light: {
      [nameKey]: palette.tone(40),
      [`on${pascalName}`]: palette.tone(100),
      [`${nameKey}Container`]: palette.tone(90),
      [`on${pascalName}Container`]: palette.tone(10),
    } as ColorGroupOf<C['name']>,
    dark: {
      [nameKey]: palette.tone(80),
      [`on${pascalName}`]: palette.tone(20),
      [`${nameKey}Container`]: palette.tone(30),
      [`on${pascalName}Container`]: palette.tone(90),
    } as ColorGroupOf<C['name']>,
  };
}

//
// const extendedColor = {
//   name: 'Attractive Woman' as const,
//   description: 'A custom extended color for demonstration purposes',
//   value: 0x6200ee,
//   blend: true,
// };
//
// const extendedColorGroup = createExtendedColor(0x6200ee, extendedColor);
// console.log(extendedColorGroup.light.onAttractiveWoman);
