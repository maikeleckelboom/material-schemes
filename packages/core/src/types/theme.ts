import {type CustomColorGroup, Hct, TonalPalette,} from '@material/material-color-utilities';
import {DynamicColorScheme, type DynamicColorSchemeOptions} from "../theme";

enum Variant {
  MONOCHROME = 0,
  NEUTRAL = 1,
  TONAL_SPOT = 2,
  VIBRANT = 3,
  EXPRESSIVE = 4,
  FIDELITY = 5,
  CONTENT = 6,
  RAINBOW = 7,
  FRUIT_SALAD = 8
}

export interface StaticColor {
  name: string;
  value: Color;
  blend?: boolean;
}

export type Color = number | string | Hct;

export interface MaterialThemeJSON {
  source: number;
  contrastLevel: number;
  style: string;
  schemes: {
    light: Record<string, number>;
    dark: Record<string, number>;
  };
  palettes: {
    primary: Record<string, number>;
    secondary: Record<string, number>;
    tertiary: Record<string, number>;
    neutral: Record<string, number>;
    neutralVariant: Record<string, number>;
  };
  customColors: CustomColorGroup[];
}

export type MaterialThemeOptions =DynamicColorSchemeOptions & {
  staticColors?: StaticColor[];
};
