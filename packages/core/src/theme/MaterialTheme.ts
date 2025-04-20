import type {
  AdaptiveColorScheme,
  Color,
  ColorSchemeStylesConfig,
  CustomColorInput,
  FullColorSchemeConfig,
  MaterialThemeOptions,
} from "../types";
import {DynamicColorScheme} from "./DynamicColorScheme";
import {PaletteStyle} from "./PaletteStyle";
import {type CustomColorGroup, TonalPalette} from "@material/material-color-utilities";
import {createCustomColorGroup, cssVarMapToText, formatCustomColor, isColor, createColorScheme} from "../utils";

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
  public readonly customColors: CustomColorGroup[];

  constructor(sourceColor: Color, customColors?: CustomColorInput[]);
  constructor(sourceColor: Color, options?: Omit<MaterialThemeOptions, 'sourceColor'>);
  constructor(options: MaterialThemeOptions);
  constructor(
    sourceOrOptions: Color | MaterialThemeOptions,
    optionsOrStaticColors?: Omit<MaterialThemeOptions, 'sourceColor'> | CustomColorInput[]
  ) {
    const options = (() => {
      if (isColor(sourceOrOptions)) {
        if (Array.isArray(optionsOrStaticColors)) {
          return {
            sourceColor: sourceOrOptions,
            customColors: optionsOrStaticColors
          };
        }
        return {
          sourceColor: sourceOrOptions,
          ...optionsOrStaticColors
        };
      }
      return sourceOrOptions;
    })();
    const {customColors = [], style = PaletteStyle.TonalSpot, ...config} = options;
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
    this.customColors = customColors.map(customColor =>
      createCustomColorGroup(this.sourceColorArgb, customColor)
    );
  }

  public toJSON() {
    return {
      sourceColor: this.sourceColorArgb,
      contrastLevel: this.contrastLevel,
      style: this.style.name,
      schemes: {
        light: this.schemes.light.toJSON(),
        dark: this.schemes.dark.toJSON(),
      },
      palettes: this.palettes,
      customColors: this.customColors.map(formatCustomColor),
    }
  }

  public toColorScheme<V extends boolean>(options: FullColorSchemeConfig<V> = {}): AdaptiveColorScheme<V> {
    return createColorScheme(this, options);
  }

  public toCssVars<V extends boolean = false>(options: ColorSchemeStylesConfig<V> = {}): string {
    const {selector, minify, ...opts} = options || {};
    const colorScheme = this.toColorScheme<V>(opts);
    return cssVarMapToText(colorScheme, {selector, minify});
  }
}
