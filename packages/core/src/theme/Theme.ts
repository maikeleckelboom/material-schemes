import {PaletteStyle, type PaletteStyleIdentifier} from "./PaletteStyle.ts";
import {DynamicColorScheme} from "./DynamicColorScheme.ts";
import {TonalPalette} from "@material/material-color-utilities";
import {createCustomColor} from "../utils/custom-color.ts";

/**
 * Custom color used to pair with a theme
 */
export interface CustomColor {
  value: number;
  name: string;
  blend: boolean;
}

export interface StaticColor {
  name: string;
  value: number | string;
  blend?: boolean;
}

/**
 * Color group
 */
export interface ColorGroup {
  color: number;
  onColor: number;
  colorContainer: number;
  onColorContainer: number;
}

/**
 * Custom Color Group
 */
export interface CustomColorGroup {
  color: CustomColor;
  value: number;
  light: ColorGroup;
  dark: ColorGroup;
}

/**
 * Theme
 */
interface Theme {
  source: number;
  contrastLevel: number;
  style: PaletteStyleIdentifier;
  schemes: {
    light: DynamicColorScheme
    dark: DynamicColorScheme
  }
  palettes: {
    primary: TonalPalette
    secondary: TonalPalette
    tertiary: TonalPalette
    neutral: TonalPalette
    neutralVariant: TonalPalette
    error: TonalPalette
  }
  staticColors: CustomColorGroup[]
}

/**
 * Generate a theme from a source color
 *
 * @param source Source color
 * @param staticColors Array of custom colors
 * @return Theme object
 */
export function themeFromSourceColor(source: number, staticColors: StaticColor[] = []) {
  const sourceArgb = Number(source);
  if (isNaN(sourceArgb)) {
    throw new Error("Source color must be a valid number.");
  }

  const baseScheme = new DynamicColorScheme(sourceArgb);
  const darkScheme = new DynamicColorScheme(sourceArgb, {isDark: true});

  return {
    source,
    contrastLevel: baseScheme.contrastLevel,
    style: PaletteStyle.fromVariant(baseScheme.variant).id,
    schemes: {
      light: baseScheme,
      dark: darkScheme
    },
    palettes: {
      primary: baseScheme.primaryPalette,
      secondary: baseScheme.secondaryPalette,
      tertiary: baseScheme.tertiaryPalette,
      neutral: baseScheme.neutralPalette,
      neutralVariant: baseScheme.neutralVariantPalette,
      error: baseScheme.errorPalette
    },
    staticColors: staticColors.map((staticColor) => createCustomColor(source, staticColor)),
    toJSON() {
      return {
        source: this.source,
        contrastLevel: this.contrastLevel,
        style: this.style.toString(),
        schemes: {
          light: this.schemes.light.toJSON(),
          dark: this.schemes.dark.toJSON()
        },
        palettes: {
          // primary: this.palettes.primary.toJSON(),
          // secondary: this.palettes.secondary.toJSON(),
          // tertiary: this.palettes.tertiary.toJSON(),
          // neutral: this.palettes.neutral.toJSON(),
          // neutralVariant: this.palettes.neutralVariant.toJSON(),
          // error: this.palettes.error.toJSON()
        },
        staticColors: this.staticColors
      };
    }
  };
}

