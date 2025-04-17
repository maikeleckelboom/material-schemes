import {type CustomColor, type CustomColorGroup, Hct, TonalPalette,} from '@material/material-color-utilities';
import {DynamicColorScheme, type DynamicColorSchemeOptions, PaletteStyle} from "../theme";

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
  sourceColor: Color;
  contrastLevel: number;
  style: string;
  schemes: {
    light: Record<string, Color>;
    dark: Record<string, Color>;
  };
  palettes: {
    primary: Record<string, Color>;
    secondary: Record<string, Color>;
    tertiary: Record<string, Color>;
    neutral: Record<string, Color>;
    neutralVariant: Record<string, Color>;
    [key: string]: Record<string, Color>;
  };
  customColors: CustomColor[];
}

export type MaterialThemeOptions =DynamicColorSchemeOptions & {
  staticColors?: StaticColor[];
};
