import {
  type CustomColorGroup,
  DynamicScheme,
  TonalPalette,
} from '@material/material-color-utilities';
import { Variant } from '../core';
import type { SchemeOptions } from './scheme.ts';
import type { StaticColor } from './color-scheme.ts';

export interface Theme {
  source: number;
  contrastLevel: number;
  variant: Variant;
  schemes: {
    light: DynamicScheme;
    dark: DynamicScheme;
  };
  palettes: {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    error: TonalPalette;
  };
  customColors: CustomColorGroup[];
}

export type ThemeOptions = Omit<SchemeOptions, 'isDark'> & {
  staticColors?: StaticColor[];
};
