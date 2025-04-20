import type {CamelCase, PascalCase} from 'type-fest';
import type {Color} from './color.ts';
import {type TonalPalette} from '@material/material-color-utilities';

export interface ExtendedColor {
  name: string;
  value: Color;
  blend?: boolean;
  description?: string;
}

// Define the color group keys explicitly to avoid recursive type resolution
// export type ColorGroupKey<TName extends string = never> =
//   | CamelCase<TName>
//   | `on${PascalCase<TName>}`
//   | `${CamelCase<TName>}Container`
//   | `on${PascalCase<TName>}Container`;
//
// export type ColorGroupOf<TName extends string = never> = Record<
//   ColorGroupKey<TName>,
//   number
// >;
//
// export interface ExtendedColorGroup<C extends ExtendedColor> {
//   value: Color;
//   color: C;
//   light: ColorGroupOf<C['name']>;
//   dark: ColorGroupOf<C['name']>;
//   palette: TonalPalette;
// }

/**
 * A simple color group mapping from key strings to numeric values.
 */
export type ColorGroup = Record<string, number>;

export interface ExtendedColorGroup {
  /** Raw color value */
  value: Color;
  /** Extended color metadata */
  color: Required<ExtendedColor>;
  /** Light theme color group */
  light: ColorGroup;
  /** Dark theme color group */
  dark: ColorGroup;
  /** Tonal palette for the color */
  palette: TonalPalette;
}
