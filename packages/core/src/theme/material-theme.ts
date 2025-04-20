import {
  type Color,
  type ColorSchemeConfig,
  type ModeledColorScheme,
  type ColorSchemeStylesConfig,
  type ExtendedColor,
  type MaterialThemeOptions,
  type ExtendedColorGroup,
} from "../types";
import {MaterialDynamicScheme} from "./material-dynamic-scheme.ts";
import {PaletteStyle} from "./palette-style.ts";
import {type CustomColorGroup, TonalPalette} from "@material/material-color-utilities";
import {colorSchemeToCssVars, createColorScheme, createCustomColorGroup, createExtendedColor} from "../utils";
import {resolveOptions} from "../fn/create-material-theme.ts";

export class MaterialTheme {
  public readonly sourceColorArgb: number;
  public readonly contrastLevel: number;
  public readonly style: PaletteStyle;
  public readonly schemes: Readonly<{
    light: MaterialDynamicScheme;
    dark: MaterialDynamicScheme;
  }>;
  public readonly palettes: Readonly<{
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    error: TonalPalette;
  }>;
  public readonly staticColors: ExtendedColorGroup[];
  public readonly extendedColors: CustomColorGroup[];

  constructor(sourceColor: Color, extendedColors?: ExtendedColor[]);
  constructor(sourceColor: Color, options?: Omit<MaterialThemeOptions, 'sourceColor'>);
  constructor(options: MaterialThemeOptions);
  constructor(
    sourceOrOptions: Color | MaterialThemeOptions,
    optionsOrColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
  ) {
    const options = resolveOptions(sourceOrOptions, optionsOrColors);
    const {extendedColors = [], style = PaletteStyle.TonalSpot, ...config} = options;
    const createScheme = (isDark: boolean) => new MaterialDynamicScheme({...config, style, isDark});
    this.schemes = {
      light: createScheme(false),
      dark: createScheme(true),
    };
    this.sourceColorArgb = this.schemes.light.sourceColorArgb;
    this.contrastLevel = this.schemes.light.contrastLevel;
    this.style = PaletteStyle.from(style);
    this.palettes = {
      primary: this.schemes.light.primaryPalette,
      secondary: this.schemes.light.secondaryPalette,
      tertiary: this.schemes.light.tertiaryPalette,
      neutral: this.schemes.light.neutralPalette,
      neutralVariant: this.schemes.light.neutralVariantPalette,
      error: this.schemes.light.errorPalette,
    };
    this.extendedColors = extendedColors.map(color =>
      createCustomColorGroup(this.sourceColorArgb, color)
    );
    this.staticColors = extendedColors.map(color =>
      createExtendedColor(this.sourceColorArgb, color)
    );
  }

  public toColorScheme<V extends boolean>(options?: ColorSchemeConfig<V>): ModeledColorScheme<V> {
    return createColorScheme(this, options);
  }

  public toCssVars<V extends boolean = false>(options?: ColorSchemeStylesConfig<V>): string {
    const {selector, minify, ...opts} = options || {};
    const colorScheme = this.toColorScheme<V>(opts);
    return colorSchemeToCssVars(colorScheme, {selector, minify});
  }
}
