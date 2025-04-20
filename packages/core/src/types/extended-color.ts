import type {CamelCase, PascalCase} from 'type-fest';
import type {Color} from './color.ts';
import {type TonalPalette} from '@material/material-color-utilities';

export interface ExtendedColor {
  name: string;
  value: Color;
  blend?: boolean;
  description?: string;
}

export type ColorGroupOf<TName extends string = string> = Record<
  | CamelCase<TName>
  | `on${PascalCase<TName>}`
  | `${CamelCase<TName>}Container`
  | `on${PascalCase<TName>}Container`,
  number
>;

export interface ExtendedColorGroup<C extends ExtendedColor = ExtendedColor> {
  value: Color;
  color: C;
  light: ColorGroupOf<C['name']>;
  dark: ColorGroupOf<C['name']>;
  palette: TonalPalette;
}
