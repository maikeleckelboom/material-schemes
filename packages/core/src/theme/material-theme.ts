import {
  type Color,
  type ColorSchemeConfig,
  type ColorSchemeStylesConfig,
  type ExtendedColor,
  type MaterialThemeOptions,
  type StructuredColorScheme,
} from "../types";
import {DynamicColorScheme} from "./dynamic-color-scheme.ts";
import {PaletteStyle} from "./palette-style.ts";
import {type CustomColorGroup, TonalPalette} from "@material/material-color-utilities";
import {colorSchemeToCssVars, createColorScheme, createCustomColorGroup} from "../utils";
import {normalizeThemeOptions} from "../fn/internals.ts";

export class MaterialTheme {
  public readonly source: number;
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

  constructor(sourceColor: Color, extendedColors?: ExtendedColor[]);
  constructor(sourceColor: Color, options?: Omit<MaterialThemeOptions, 'sourceColor'>);
  constructor(options: MaterialThemeOptions);
  constructor(
    sourceOrOptions: Color | MaterialThemeOptions,
    optionsOrColors?: Omit<MaterialThemeOptions, 'sourceColor'> | ExtendedColor[]
  ) {
    const options = normalizeThemeOptions(sourceOrOptions, optionsOrColors);
    const {extendedColors = [], style = PaletteStyle.TonalSpot, ...config} = options;
    const createScheme = (isDark: boolean) => new DynamicColorScheme({...config, style, isDark});
    this.schemes = {
      light: createScheme(false),
      dark: createScheme(true),
    };
    this.source = this.schemes.light.sourceColorArgb;
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
    this.customColors = extendedColors.map(color => createCustomColorGroup(this.source, color));
  }

  public toColorScheme<V extends boolean>(options?: ColorSchemeConfig<V>): StructuredColorScheme<V> {
    return createColorScheme(this, options);
  }

  public toCssVars<V extends boolean = false>(options?: ColorSchemeStylesConfig<V>): string {
    const {selector, minify, ...opts} = options || {};
    const colorScheme = this.toColorScheme<V>(opts);
    return colorSchemeToCssVars(colorScheme, {selector, minify});
  }
}
