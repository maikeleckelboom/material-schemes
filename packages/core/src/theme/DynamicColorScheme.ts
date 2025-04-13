import {DynamicScheme as M3DynamicScheme, TonalPalette} from "@material/material-color-utilities";
import {PaletteStyle} from "./PaletteStyle.ts";
import {Contrast} from "./Contrast.ts";

export interface ColorScheme {
  primaryPaletteKeyColor: number;
  secondaryPaletteKeyColor: number;
  tertiaryPaletteKeyColor: number;
  neutralPaletteKeyColor: number;
  neutralVariantPaletteKeyColor: number;
  background: number;
  onBackground: number;
  surface: number;
  surfaceDim: number;
  surfaceBright: number;
  surfaceContainerLowest: number;
  surfaceContainerLow: number;
  surfaceContainer: number;
  surfaceContainerHigh: number;
  surfaceContainerHighest: number;
  onSurface: number;
  surfaceVariant: number;
  onSurfaceVariant: number;
  inverseSurface: number;
  inverseOnSurface: number;
  outline: number;
  outlineVariant: number;
  shadow: number;
  scrim: number;
  surfaceTint: number;
  primary: number;
  onPrimary: number;
  primaryContainer: number;
  onPrimaryContainer: number;
  inversePrimary: number;
  secondary: number;
  onSecondary: number;
  secondaryContainer: number;
  onSecondaryContainer: number;
  tertiary: number;
  onTertiary: number;
  tertiaryContainer: number;
  onTertiaryContainer: number;
  error: number;
  onError: number;
  errorContainer: number;
  onErrorContainer: number;
  primaryFixed: number;
  primaryFixedDim: number;
  onPrimaryFixed: number;
  onPrimaryFixedVariant: number;
  secondaryFixed: number;
  secondaryFixedDim: number;
  onSecondaryFixed: number;
  onSecondaryFixedVariant: number;
  tertiaryFixed: number;
  tertiaryFixedDim: number;
  onTertiaryFixed: number;
  onTertiaryFixedVariant: number;
}

export type Color = number

export interface DynamicSchemeOptions {
  sourceColor?: Color;
  primary?: Color;
  secondary?: Color;
  tertiary?: Color;
  neutral?: Color;
  neutralVariant?: Color;
  style?: PaletteStyle | string;
  contrastLevel?: number;
  isDark?: boolean;
}

export type DynamicSchemeOptionsInput =
  | ({ sourceColor: number; primary?: number } & DynamicSchemeOptions)
  | ({ sourceColor?: number; primary: number } & DynamicSchemeOptions);

export class DynamicColorScheme extends M3DynamicScheme {
  // Overload 1: sourceColor and options separately
  constructor(sourceColor: Color, options?: Omit<DynamicSchemeOptionsInput, 'sourceColor'>);
  // Overload 2: full configuration object
  constructor(options: DynamicSchemeOptionsInput);
  constructor(arg1: Color | DynamicSchemeOptionsInput, arg2?: Omit<DynamicSchemeOptionsInput, 'sourceColor'>) {
    const options: DynamicSchemeOptionsInput = typeof arg1 === 'number'
      ? {sourceColor: arg1, ...arg2}
      : arg1;

    const {
      sourceColor,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      isDark = false,
      style = PaletteStyle.TonalSpot,
      contrastLevel = Contrast.Default.value
    } = options;

    const sourceColorArgb = Number(sourceColor ?? primary);
    if (isNaN(sourceColorArgb)) {
      throw new Error("Valid color required: provide either sourceColor or primary");
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
