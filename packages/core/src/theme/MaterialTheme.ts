import type {
  ColorSchemeReturnType,
  Color,
  ColorSchemeStylesConfig,
  ExtendedColor,
  ThemeColorSchemeConfig,
  MaterialThemeOptions,
} from "../types";
import {DynamicColorScheme} from "./DynamicColorScheme";
import {PaletteStyle} from "./PaletteStyle";
import {type CustomColorGroup, TonalPalette} from "@material/material-color-utilities";
import {createColorScheme, createCustomColorGroup, colorSchemeToCssVars, formatCustomColor, isColor} from "../utils";

export class MaterialTheme {
  public readonly sourceColorArgb: number;
  public readonly contrastLevel: number;
  public readonly style: PaletteStyle;
  public readonly schemes: Readonly<{
    light: DynamicColorScheme;
    dark: DynamicColorScheme;
  }>;
  public readonly palettes: Readonly<{
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    error: TonalPalette;
  }>;
  public readonly extendedColors: CustomColorGroup[];

  constructor(sourceColor: Color, extendedColors?: ExtendedColor[]);
  constructor(sourceColor: Color, options?: Omit<MaterialThemeOptions, 'sourceColor'>);
  constructor(options: MaterialThemeOptions);
  constructor(
    sourceOrOptions: Color | MaterialThemeOptions,
    optionsOrColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
  ) {
    const options = (() => {
      if (isColor(sourceOrOptions)) {
        if (Array.isArray(optionsOrColors)) {
          return {
            sourceColor: sourceOrOptions,
            extendedColors: optionsOrColors
          };
        }
        return {
          sourceColor: sourceOrOptions,
          ...optionsOrColors
        };
      }
      return sourceOrOptions;
    })();
    const {extendedColors = [], style = PaletteStyle.TonalSpot, ...config} = options;
    const createScheme = (isDark: boolean) => new DynamicColorScheme({...config, style, isDark});
    this.schemes = {
      light: createScheme(false),
      dark: createScheme(true),
    };
    this.sourceColorArgb = this.schemes.light.sourceColorArgb;
    this.contrastLevel = this.schemes.light.contrastLevel;
    this.style = PaletteStyle.fromName(style);
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
  }

  public toColorScheme<V extends boolean>(options?: ThemeColorSchemeConfig<V>): ColorSchemeReturnType<V> {
    return createColorScheme(this, options);
  }

  public toCssVars<V extends boolean = false>(options?: ColorSchemeStylesConfig<V>): string {
    const {selector, minify, ...opts} = options || {};
    const colorScheme = this.toColorScheme<V>(opts);
    return colorSchemeToCssVars(colorScheme, {selector, minify});
  }
}
