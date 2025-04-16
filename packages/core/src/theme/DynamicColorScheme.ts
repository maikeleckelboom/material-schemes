import {DynamicScheme, TonalPalette} from "@material/material-color-utilities";
import {PaletteStyle} from "./PaletteStyle.ts";
import {ContrastLevel} from "./ContrastLevel.ts";
import type {ColorScheme, Color} from "../types";


export interface DynamicSchemeOptions {
  sourceColor?: number;
  primary?: number;
  secondary?: number;
  tertiary?: number;
  neutral?: number;
  neutralVariant?: number;
  style?: PaletteStyle | string;
  contrastLevel?: number;
  isDark?: boolean;
}

export type DynamicSchemeInput =
  | ({ sourceColor: number; primary?: number } & DynamicSchemeOptions)
  | ({ sourceColor?: number; primary: number } & DynamicSchemeOptions);

export class DynamicColorScheme extends DynamicScheme {
  constructor(sourceColor: number, options?: Omit<DynamicSchemeInput, 'sourceColor'>);
  constructor(options: DynamicSchemeInput);
  constructor(
    sourceColorOrOptions: number | DynamicSchemeInput,
    optionsOrUndefined?: Omit<DynamicSchemeInput, 'sourceColor'>
  ) {
    const options: DynamicSchemeInput = typeof sourceColorOrOptions === 'number'
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
      style = PaletteStyle.TonalSpot.value,
      contrastLevel = ContrastLevel.Default.value
    } = options;

    const sourceColorArgb = Number(sourceColor ?? primary);

    if (isNaN(sourceColorArgb)) {
      throw new Error("Valid color required: provide either `sourceColor` or `primary`");
    }

    const scheme = PaletteStyle.from(style).toScheme(sourceColorArgb, isDark, contrastLevel);

    super({
      ...scheme,
      primaryPalette: primary ? TonalPalette.fromInt(primary) : scheme.primaryPalette,
      secondaryPalette: secondary ? TonalPalette.fromInt(secondary) : scheme.secondaryPalette,
      tertiaryPalette: tertiary ? TonalPalette.fromInt(tertiary) : scheme.tertiaryPalette,
      neutralPalette: neutral ? TonalPalette.fromInt(neutral) : scheme.neutralPalette,
      neutralVariantPalette: neutralVariant ? TonalPalette.fromInt(neutralVariant) : scheme.neutralVariantPalette,
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
