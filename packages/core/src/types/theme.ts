import {
  DynamicScheme,
  TonalPalette,
} from '@material/material-color-utilities';

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

export type Color = number | string;

export interface ColorGroup {
  color: number;
  onColor: number;
  colorContainer: number;
  onColorContainer: number;
}

export interface CustomColorGroup {
  color: CustomColor;
  value: number;
  light: ColorGroup;
  dark: ColorGroup;
}

export interface CustomColor {
  value: number;
  name: string;
  blend: boolean;
}

export interface StaticColor {
  name: string;
  value: Color;
  blend?: boolean;
}

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
