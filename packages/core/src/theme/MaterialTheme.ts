import type {
  Color,
  ColorSchemeOptions,
  ColorSchemeReturnType,
  CustomColorOptions,
  MaterialThemeOptions
} from "../types";
import {DynamicColorScheme} from "./DynamicColorScheme";
import {PaletteStyle} from "./PaletteStyle";
import {type CustomColorGroup, TonalPalette} from "@material/material-color-utilities";
import {createCssVarMap, createCustomColorGroup, generateColorScheme, isColor, serializeCssVars} from "../utils";


export class MaterialTheme {
  public readonly sourceColor: Color;
  public readonly contrastLevel: number;
  public readonly style: PaletteStyle;
  public readonly schemes: Readonly<{
    light: DynamicColorScheme;
    dark: DynamicColorScheme;
  }>;
  public readonly palettes: {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    error: TonalPalette;
  };
  public readonly customColors: CustomColorGroup[];

  constructor(sourceColor: Color, customColors?: CustomColorOptions[]);
  constructor(sourceColor: Color, options?: Omit<MaterialThemeOptions, 'sourceColor'>);
  constructor(options: MaterialThemeOptions);
  constructor(
    sourceOrOptions: Color | MaterialThemeOptions,
    optionsOrStaticColors?: Omit<MaterialThemeOptions, 'sourceColor'> | CustomColorOptions[]
  ) {
    const opts = this.resolveArguments(sourceOrOptions, optionsOrStaticColors);
    const {customColors = [], style = PaletteStyle.TonalSpot, ...config} = opts;

    const createScheme = (isDark: boolean): DynamicColorScheme =>
      new DynamicColorScheme({...config, style, isDark});

    this.schemes = {
      light: createScheme(false),
      dark: createScheme(true),
    };

    this.sourceColor = this.schemes.light.sourceColorArgb;
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
      createCustomColorGroup(this.sourceColor, customColor)
    );
  }

  /**
   * Return theme as JSON.
   */
  public toJSON() {
    return {
      sourceColor: this.sourceColor,
      contrastLevel: this.contrastLevel,
      style: this.style.name,
      schemes: {
        light: this.schemes.light.toJSON(),
        dark: this.schemes.dark.toJSON(),
      },
      palettes: {
        primary: this.palettes.primary,
        secondary: this.palettes.secondary,
        tertiary: this.palettes.tertiary,
        neutral: this.palettes.neutral,
        neutralVariant: this.palettes.neutralVariant,
        error: this.palettes.error,
      },
      customColors: this.customColors
    }
  }


  /**
   * Generates a color scheme based on the theme and optional parameters.
   * @param options - Optional parameters to modify the color scheme generation.
   * @returns The generated color scheme.
   */
  public toColorScheme<V extends boolean>(options?: ColorSchemeOptions<V>): ColorSchemeReturnType<V> {
    return generateColorScheme(this, options);
  }

  /**
   * Generates a CSS variable map based on the theme and optional parameters.
   * @param options - Optional parameters to modify the CSS variable generation.
   * @returns The generated CSS variable map.
   */
  public toCssText<V extends boolean>(options?: ColorSchemeOptions<V> & { selector?: string }): string {
    const {selector, ...colorSchemeOpts} = options || {};
    const colorScheme = this.toColorScheme(colorSchemeOpts);
    const cssVars = createCssVarMap(colorScheme);
    return serializeCssVars(cssVars, selector);
  }

  /** @internal */
  private resolveArguments(
    sourceOrOptions: Color | MaterialThemeOptions,
    optionsOrCustomColors?: Omit<MaterialThemeOptions, 'sourceColor'> | CustomColorOptions[]
  ): MaterialThemeOptions {
    if (isColor(sourceOrOptions)) {
      if (Array.isArray(optionsOrCustomColors)) {
        return {
          sourceColor: sourceOrOptions,
          customColors: optionsOrCustomColors
        };
      }
      return {
        sourceColor: sourceOrOptions,
        ...optionsOrCustomColors
      };
    }

    return sourceOrOptions;
  }
}
