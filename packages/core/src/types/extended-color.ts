import type {CamelCase, PascalCase} from 'type-fest';
import type {Color} from './color.ts';
import {type TonalPalette} from '@material/material-color-utilities';
import {harmonize} from '../utils';
import {MaterialDynamicScheme} from '../theme';
import camelCase from "camelcase";

export interface ExtendedColor {
  name: string;
  value: Color;
  blend?: boolean;
  description?: string;
}

export type ColorGroupOf<T extends string = string> = Record<
  | CamelCase<T>
  | `on${PascalCase<T>}`
  | `${CamelCase<T>}Container`
  | `on${PascalCase<T>}Container`,
  number
>;

export interface ExtendedColorGroup<C extends ExtendedColor = ExtendedColor> {
  value: Color;
  color: C;
  light: ColorGroupOf<C['name']>;
  dark: ColorGroupOf<C['name']>;
  palette: TonalPalette;
}

export function createExtendedColor<C extends ExtendedColor>(
  source: number,
  color: C
): ExtendedColorGroup<C> {
  let value = color.value;
  if (color.blend) value = harmonize(value, source);

  const {primaryPalette: palette} = new MaterialDynamicScheme(source);
  const nameKey = camelCase(color.name);
  const pascalName = camelCase(color.name, {pascalCase: true});

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


const extendedColor = {
  name: 'super iron man' as const,
  description: 'A custom extended color for demonstration purposes',
  value: 0x6200ee,
  blend: true,
};

const extendedColorGroup = createExtendedColor(0x6200ee, extendedColor);
console.log(extendedColorGroup.light.onSuperIronManContainer);
