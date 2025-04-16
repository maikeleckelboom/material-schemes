import type {ColorSchemeOptions, ColorSchemeReturnType, MaterialThemeOptions} from "../types";
import {DynamicColorScheme} from "./DynamicColorScheme";
import {PaletteStyle} from "./PaletteStyle";
import {type CustomColorGroup, TonalPalette} from "@material/material-color-utilities";
import {
  createCustomColor,
  createTonalPalette,
  formatTokenName,
  generateColorScheme,
  generateToneMapFromPalette
} from "../utils";

/**
 * DynamicMaterialTheme encapsulates theme generation for both light and dark color schemes.
 * It includes palette extraction, custom colors handling, and JSON transformation.
 */
export class DynamicMaterialTheme {
  public readonly sourceColor: number;
  public readonly contrastLevel: number;
  public readonly style: PaletteStyle;
  public readonly schemes: {
    light: DynamicColorScheme;
    dark: DynamicColorScheme;
  };
  public readonly palettes: {
    primary: TonalPalette;
    secondary: TonalPalette;
    tertiary: TonalPalette;
    neutral: TonalPalette;
    neutralVariant: TonalPalette;
    error: TonalPalette;
  };
  public readonly customColors: CustomColorGroup[];

  /**
   * Creates an instance of DynamicMaterialTheme.
   * @param options - Configuration options for the material theme.
   */
  constructor(options: MaterialThemeOptions) {
    const {staticColors = [], style = PaletteStyle.TonalSpot, ...schemeConfig} = options;

    // Helper to reduce repetitive construction logic.
    const createScheme = (isDark: boolean): DynamicColorScheme =>
      new DynamicColorScheme({...schemeConfig, style, isDark});

    this.schemes = {
      light: createScheme(false),
      dark: createScheme(true),
    };

    // Use the light scheme as the reference for certain properties.
    this.sourceColor = this.schemes.light.sourceColorArgb;
    this.contrastLevel = this.schemes.light.contrastLevel;
    this.style = style;

    // Extract palettes from the light scheme.
    this.palettes = {
      primary: this.schemes.light.primaryPalette,
      secondary: this.schemes.light.secondaryPalette,
      tertiary: this.schemes.light.tertiaryPalette,
      neutral: this.schemes.light.neutralPalette,
      neutralVariant: this.schemes.light.neutralVariantPalette,
      error: this.schemes.light.errorPalette,
    };

    // Create custom colors from static definitions.
    this.customColors = staticColors.map(staticColor =>
      createCustomColor(this.sourceColor, staticColor)
    );
  }

  /**
   * Converts the theme instance to a JSON object.
   * This method extracts key color values from the palettes.
   * @returns A JSON representation of the theme.
   */
  public toJSON() {
    return {
      sourceColor: this.sourceColor,
      contrastLevel: this.contrastLevel,
      style: this.style,
      schemes: {
        light: this.schemes.light.toJSON(),
        dark: this.schemes.dark.toJSON(),
      },
      palettes: {
        primary: generateToneMapFromPalette(this.palettes.primary),
        secondary: generateToneMapFromPalette(this.palettes.secondary),
        tertiary: generateToneMapFromPalette(this.palettes.tertiary),
        neutral: generateToneMapFromPalette(this.palettes.neutral),
        neutralVariant: generateToneMapFromPalette(this.palettes.neutralVariant),
        error: generateToneMapFromPalette(this.palettes.error),
        ...Object.fromEntries(
          this.customColors.map(customColor => [
            formatTokenName(customColor.color.name),
            generateToneMapFromPalette(createTonalPalette(customColor.value)),
          ])
        ),
      },
      customColors: this.customColors,
    };
  }

  /**
   * Generates a color scheme based on the theme and optional parameters.
   * @param opts - Optional parameters to modify the color scheme generation.
   * @returns The generated color scheme.
   */
  public toColorScheme<V extends boolean = false>(opts?: ColorSchemeOptions<V>): ColorSchemeReturnType<V> {
    return generateColorScheme(this, opts);
  }
}
