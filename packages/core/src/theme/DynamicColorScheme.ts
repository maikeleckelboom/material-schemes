import {DynamicScheme, TonalPalette} from "@material/material-color-utilities";
import {PaletteStyle, type PaletteStyleIdentifier} from "./PaletteStyle.ts";
import type {Color, ColorScheme} from "../types";
import {toArgb} from "../utils";


export interface DynamicColorSchemeOptions {
  sourceColor?: Color;
  primary?: Color;
  secondary?: Color;
  tertiary?: Color;
  neutral?: Color;
  neutralVariant?: Color;
  style?: PaletteStyleIdentifier | string;
  contrastLevel?: number;
  isDark?: boolean;
}

type DynamicColorSchemeInputOptions =
  | ({ sourceColor: Color; primary?: Color } & DynamicColorSchemeOptions)
  | ({ sourceColor?: Color; primary: Color } & DynamicColorSchemeOptions);

export class DynamicColorScheme extends DynamicScheme {
  constructor(sourceColor: Color, options?: Omit<DynamicColorSchemeInputOptions, 'sourceColor'>);
  constructor(options: DynamicColorSchemeInputOptions);
  constructor(
    sourceColorOrOptions: Color | DynamicColorSchemeInputOptions,
    optionsOrUndefined?: Omit<DynamicColorSchemeInputOptions, 'sourceColor'>
  ) {
    const options: DynamicColorSchemeInputOptions = (typeof sourceColorOrOptions === 'number' || typeof sourceColorOrOptions === 'string')
      ? {sourceColor: sourceColorOrOptions, ...optionsOrUndefined}
      : sourceColorOrOptions;

    const {
      sourceColor,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      isDark = false,
      style = 'TonalSpot',
      contrastLevel = 0
    } = options;

    const sourceColorArgb = toArgb(sourceColor ?? primary ?? 0);
    const scheme = PaletteStyle.from(style).toScheme(sourceColorArgb, isDark, contrastLevel);

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
