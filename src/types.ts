import type { DynamicScheme, TonalPalette, Variant } from '@material/material-color-utilities';
import type {
  MATERIAL_COLOR_ROLES,
  MATERIAL_OPTIONAL_COLOR_ROLES,
  MATERIAL_PALETTE_KEY_COLORS,
  MATERIAL_REQUIRED_COLOR_ROLES,
  PALETTE_STYLE_NAMES,
  SUPPORTED_PLATFORMS,
  SUPPORTED_SPEC_VERSIONS,
} from './roles';
import type { ContrastLevel } from './contrast';
import type { PaletteStyle } from './palette';
import type { DynamicColorScheme } from './scheme';

export type Color = string | number;

export type MaterialPaletteKeyColorRole = (typeof MATERIAL_PALETTE_KEY_COLORS)[number];

export type MaterialColorRole = (typeof MATERIAL_COLOR_ROLES)[number];

export type MaterialRequiredColorRole = (typeof MATERIAL_REQUIRED_COLOR_ROLES)[number];

export type MaterialOptionalColorRole = (typeof MATERIAL_OPTIONAL_COLOR_ROLES)[number];

export type PaletteStyleName = (typeof PALETTE_STYLE_NAMES)[number];

export type MaterialVariantName =
  | 'monochrome'
  | 'neutral'
  | 'tonalSpot'
  | 'tonal-spot'
  | 'vibrant'
  | 'expressive'
  | 'fidelity'
  | 'content'
  | 'rainbow'
  | 'fruitSalad'
  | 'fruit-salad';

export type PaletteStyleInput = PaletteStyle | PaletteStyleName | MaterialVariantName | Variant;

export type ContrastLevelInput = ContrastLevel | number;

export type SpecVersion = (typeof SUPPORTED_SPEC_VERSIONS)[number];

export type Platform = (typeof SUPPORTED_PLATFORMS)[number];

export type MaterialColorScheme = { [Role in MaterialRequiredColorRole]: Color } & {
  [Role in MaterialOptionalColorRole]?: Color;
};

export interface ColorScheme extends MaterialColorScheme {
  [key: string]: Color;
}

export type SuffixedMaterialColorScheme<Suffix extends string> = {
  [Role in MaterialRequiredColorRole as `${Role}${Suffix}`]: Color;
} & {
  [Role in MaterialOptionalColorRole as `${Role}${Suffix}`]?: Color;
};

export type StructuredColorScheme<WithBrightnessVariants extends boolean = false> =
  WithBrightnessVariants extends true
    ? ColorScheme & SuffixedMaterialColorScheme<'Light'> & SuffixedMaterialColorScheme<'Dark'>
    : ColorScheme;

export interface CustomColor {
  name: string;
  value: Color;
  blend?: boolean;
  description?: string;
}

export interface CustomColorGroup {
  color: {
    name: string;
    value: number;
    blend: boolean;
    description?: string;
  };
  value: number;
  light: {
    color: number;
    onColor: number;
    colorContainer: number;
    onColorContainer: number;
  };
  dark: {
    color: number;
    onColor: number;
    colorContainer: number;
    onColorContainer: number;
  };
  palette: TonalPalette;
}

export type MaterialCustomColorGroup = CustomColorGroup & {
  color: CustomColorGroup['color'];
};

export interface SchemeOptionsBase {
  sourceColors?: readonly Color[];
  primary?: Color;
  secondary?: Color;
  tertiary?: Color;
  neutral?: Color;
  neutralVariant?: Color;
  contrastLevel?: ContrastLevelInput;
  variant?: PaletteStyleInput;
  style?: PaletteStyleInput;
  specVersion?: SpecVersion;
  platform?: Platform;
  isDark?: boolean;
}

export type SchemeOptions =
  | (SchemeOptionsBase & { sourceColor: Color; primary?: Color })
  | (SchemeOptionsBase & { sourceColor?: Color; primary: Color })
  | (SchemeOptionsBase & { sourceColors: readonly Color[]; sourceColor?: Color; primary?: Color });

export type SchemeSource = Color | SchemeOptions;

export type ThemeOptions = Omit<SchemeOptions, 'isDark'> & {
  customColors?: readonly CustomColor[];
};

export type ThemeSource = Color | ThemeOptions;

export interface MaterialThemeShape {
  source: number;
  sourceColors: readonly number[];
  contrastLevel: number;
  style: PaletteStyle;
  variant: Variant;
  specVersion: SpecVersion;
  platform: Platform;
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
    error: TonalPalette;
  };
  customColors: MaterialCustomColorGroup[];
}

export type ColorSchemeSource = DynamicScheme | DynamicColorScheme | MaterialThemeShape;

export type ModifyColorSchemeFn<WithBrightnessVariants extends boolean = false> = (
  colorScheme: StructuredColorScheme<WithBrightnessVariants>,
) => StructuredColorScheme<WithBrightnessVariants> & Record<string, Color>;

export interface ColorSchemeOptions<WithBrightnessVariants extends boolean = false> {
  dark?: boolean;
  brightnessVariants?: WithBrightnessVariants;
  paletteTones?: boolean | readonly number[];
  modifyColorScheme?: ModifyColorSchemeFn<WithBrightnessVariants>;
}

export type CssVarMap = Record<`--${string}`, string>;

export interface SerializeCssVarMapOptions {
  selector?: string;
  minify?: boolean;
}

export interface CssVarMapOptions {
  prefix?: string;
}
