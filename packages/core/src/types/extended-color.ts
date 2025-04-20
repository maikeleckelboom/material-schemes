import type {CamelCase, PascalCase} from 'type-fest';
import type {Color} from './color.ts';
import {type TonalPalette} from '@material/material-color-utilities';

export interface ExtendedColor {
  name: string;
  value: Color;
  blend?: boolean;
  description?: string;
}

type ColorGroupRole<TName extends string = never> =
  | CamelCase<TName>
  | `on${PascalCase<TName>}`
  | `${CamelCase<TName>}Container`
  | `on${PascalCase<TName>}Container`;

export type ExtendedColorScheme<TName extends string = never> = Record<
  ColorGroupRole<TName>,
  number
>;

/**
 * A simple color group mapping from key strings to numeric values.
 */

export interface ExtendedColorGroup<C extends ExtendedColor> {
  /** Raw color value */
  value: Color;
  /** Extended color metadata */
  color: Required<C>;
  /** Light theme color group */
  light: ExtendedColorScheme<C['name']>;
  /** Dark theme color group */
  dark: ExtendedColorScheme<C['name']>;
  /** Tonal palette for the color */
  palette: TonalPalette;
}
