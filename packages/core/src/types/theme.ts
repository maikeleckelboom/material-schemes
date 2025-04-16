import {type CustomColorGroup, TonalPalette,} from '@material/material-color-utilities';
import {DynamicColorScheme} from "../theme";

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

export type Color = number | string;

export interface FullSchemeOptions {
  sourceColor?: Color;
  primary?: Color;
  secondary?: Color;
  tertiary?: Color;
  neutral?: Color;
  neutralVariant?: Color;
  variant?: Variant;
  contrastLevel?: number;
  isDark?: boolean;
}

export type SchemeOptions =
  | (FullSchemeOptions & { primary: Color; sourceColor?: Color })
  | (FullSchemeOptions & { sourceColor: Color; primary?: Color });

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

export interface MaterialTheme {
  source: number;
  contrastLevel: number;
  variant: Variant;
  schemes: {
    light: DynamicColorScheme;
    dark: DynamicColorScheme;
  };
  palettes: {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
  };
  customColors: CustomColorGroup[];
  toJSON: () => MaterialThemeJSON
}

export type ThemeOptions = Omit<SchemeOptions, 'isDark'> & {
  staticColors?: StaticColor[];
};
