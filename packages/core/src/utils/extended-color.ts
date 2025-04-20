import {harmonize} from "./blend.ts";
import {DynamicColorScheme} from "../theme";
import camelCase from "camelcase";
import type {ExtendedColor, ExtendedColorGroup, ExtendedColorScheme} from "../types";

export function createExtendedColor<C extends ExtendedColor>(
  source: number,
  color: C
): ExtendedColorGroup<C> {
  let value = color.value;
  const name = color.name;
  const blend = color.blend ?? false;
  const description = color.description ?? '';

  if (blend) {
    value = harmonize(source, value)
  }

  const {primaryPalette: palette} = new DynamicColorScheme(source);
  const nameKey = camelCase(name);
  const pascalName = camelCase(name, {pascalCase: true});

  const light = {
    [nameKey]: palette.tone(40),
    [`on${pascalName}`]: palette.tone(100),
    [`${nameKey}Container`]: palette.tone(90),
    [`on${pascalName}Container`]: palette.tone(10),
  } as ExtendedColorScheme<C['name']>;

  const dark = {
    [nameKey]: palette.tone(80),
    [`on${pascalName}`]: palette.tone(20),
    [`${nameKey}Container`]: palette.tone(30),
    [`on${pascalName}Container`]: palette.tone(90),
  } as ExtendedColorScheme<C['name']>;

  return {
    value,
    color: {
      name,
      value,
      description,
      blend,
    } as Required<C>,
    palette,
    light,
    dark,
  };
}

// const extendedColor = {
//   name: 'Attractive Woman' as const,
//   description: 'A custom extended color for demonstration purposes',
//   value: 0x6200ee,
//   blend: true,
// };
//
// const extendedColorGroup = createExtendedColor(0x6200ee, extendedColor);
// console.log(extendedColorGroup.light.onAttractiveWoman);
