import {DynamicScheme, TonalPalette} from "@material/material-color-utilities";
import {PaletteStyle} from "./PaletteStyle.ts";
import type {Color, ColorScheme} from "../types";
import {toArgb, toHct} from "../utils";
import {isColor} from "../utils/color.ts";

export interface DynamicColorSchemeConfig {
  secondary?: Color;
  tertiary?: Color;
  neutral?: Color;
  neutralVariant?: Color;
  style?: PaletteStyle;
  contrastLevel?: number;
  isDark?: boolean;
}

// The input must have at least one of sourceColor or primary.
// If both are provided, both types are valid.
export type DynamicColorSchemeOptions =
  | ({ sourceColor: Color; primary?: Color } & DynamicColorSchemeConfig)
  | ({ sourceColor?: Color; primary: Color } & DynamicColorSchemeConfig);

export class DynamicColorScheme extends DynamicScheme {
  /**
   * Creates a color scheme from a source color and optional overrides
   * @param sourceColor - Base color for the scheme
   * @param options - Additional customization parameters (without sourceColor)
   */
  constructor(sourceColor: Color, options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>);
  /**
   * Creates a color scheme from a configuration object
   * @param options - Configuration with at least sourceColor or primary
   */
  constructor(options: DynamicColorSchemeOptions);
  constructor(
    sourceOrOptions: Color | DynamicColorSchemeOptions,
    maybeOptions?: Omit<DynamicColorSchemeOptions, 'sourceColor'>
  ) {
    const opts: DynamicColorSchemeOptions = isColor(sourceOrOptions)
      ? {sourceColor: sourceOrOptions, ...maybeOptions}
      : sourceOrOptions;

    const {
      sourceColor,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      isDark = false,
      style = PaletteStyle.TonalSpot,
      contrastLevel = 0
    } = opts;

    const sourceColorHct = toHct(sourceColor ?? primary ?? 0);
    const scheme = style.createScheme(sourceColorHct, isDark, contrastLevel);

    super({
      ...scheme,
      primaryPalette: primary ? TonalPalette.fromInt(toArgb(primary)) : scheme.primaryPalette,
      secondaryPalette: secondary ? TonalPalette.fromInt(toArgb(secondary)) : scheme.secondaryPalette,
      tertiaryPalette: tertiary ? TonalPalette.fromInt(toArgb(tertiary)) : scheme.tertiaryPalette,
      neutralPalette: neutral ? TonalPalette.fromInt(toArgb(neutral)) : scheme.neutralPalette,
      neutralVariantPalette: neutralVariant ? TonalPalette.fromInt(toArgb(neutralVariant)) : scheme.neutralVariantPalette,
    });
  }

  public toJSON(): ColorScheme {
    return {
      primaryPaletteKeyColor: this.primaryPaletteKeyColor,
      secondaryPaletteKeyColor: this.secondaryPaletteKeyColor,
      tertiaryPaletteKeyColor: this.tertiaryPaletteKeyColor,
      neutralPaletteKeyColor: this.neutralPaletteKeyColor,
      neutralVariantPaletteKeyColor: this.neutralVariantPaletteKeyColor,
      background: this.background,
      onBackground: this.onBackground,
      surface: this.surface,
      surfaceDim: this.surfaceDim,
      surfaceBright: this.surfaceBright,
      surfaceContainerLowest: this.surfaceContainerLowest,
      surfaceContainerLow: this.surfaceContainerLow,
      surfaceContainer: this.surfaceContainer,
      surfaceContainerHigh: this.surfaceContainerHigh,
      surfaceContainerHighest: this.surfaceContainerHighest,
      onSurface: this.onSurface,
      surfaceVariant: this.surfaceVariant,
      onSurfaceVariant: this.onSurfaceVariant,
      inverseSurface: this.inverseSurface,
      inverseOnSurface: this.inverseOnSurface,
      outline: this.outline,
      outlineVariant: this.outlineVariant,
      shadow: this.shadow,
      scrim: this.scrim,
      surfaceTint: this.surfaceTint,
      primary: this.primary,
      onPrimary: this.onPrimary,
      primaryContainer: this.primaryContainer,
      onPrimaryContainer: this.onPrimaryContainer,
      inversePrimary: this.inversePrimary,
      secondary: this.secondary,
      onSecondary: this.onSecondary,
      secondaryContainer: this.secondaryContainer,
      onSecondaryContainer: this.onSecondaryContainer,
      tertiary: this.tertiary,
      onTertiary: this.onTertiary,
      tertiaryContainer: this.tertiaryContainer,
      onTertiaryContainer: this.onTertiaryContainer,
      error: this.error,
      onError: this.onError,
      errorContainer: this.errorContainer,
      onErrorContainer: this.onErrorContainer,
      primaryFixed: this.primaryFixed,
      primaryFixedDim: this.primaryFixedDim,
      onPrimaryFixed: this.onPrimaryFixed,
      onPrimaryFixedVariant: this.onPrimaryFixedVariant,
      secondaryFixed: this.secondaryFixed,
      secondaryFixedDim: this.secondaryFixedDim,
      onSecondaryFixed: this.onSecondaryFixed,
      onSecondaryFixedVariant: this.onSecondaryFixedVariant,
      tertiaryFixed: this.tertiaryFixed,
      tertiaryFixedDim: this.tertiaryFixedDim,
      onTertiaryFixed: this.onTertiaryFixed,
      onTertiaryFixedVariant: this.onTertiaryFixedVariant,
    };
  }
}
