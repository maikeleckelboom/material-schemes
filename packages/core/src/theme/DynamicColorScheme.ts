import {DynamicScheme, TonalPalette} from "@material/material-color-utilities";
import {PaletteStyle} from "../constants/PaletteStyle.ts";
import {Contrast} from "../constants/Contrast.ts";

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


type AdditionalOptions = {
  style?: PaletteStyle | string;
  isDark?: boolean;
  contrastLevel?: number;
  secondary?: number;
  tertiary?: number;
  neutral?: number;
  neutralVariant?: number;
};

export type DynamicColorSchemeOptions =
  | ({ sourceColor: number; primary?: number } & AdditionalOptions)
  | ({ sourceColor?: number; primary: number } & AdditionalOptions);

function paletteStyleFromName(style: string | PaletteStyle): string {
  return typeof style === 'string' ? style : style.name;
}

export class DynamicColorScheme extends DynamicScheme {
  // Overload 1: Accepts a source color and then extra options (sourceColor not repeated)
  constructor(sourceColor: number, options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>);
  // Overload 2: Accepts a configuration object
  constructor(config: DynamicColorSchemeOptions);
  // Actual implementation
  constructor(arg1: number | DynamicColorSchemeOptions, arg2?: Omit<DynamicColorSchemeOptions, 'sourceColor'>) {
    let config: DynamicColorSchemeOptions;
    if (typeof arg1 === 'number') {
      // If the first argument is a number, we combine it with the rest of the options.
      config = {sourceColor: arg1, ...arg2};
    } else {
      // Otherwise, the caller passed a configuration object.
      config = arg1;
    }

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
    } = config;

    const sourceColorArgb = Number(sourceColor ?? primary);
    if (isNaN(sourceColorArgb)) {
      throw new Error("Either sourceColor or primary must be provided.");
    }

    const paletteStyle = PaletteStyle.fromName(paletteStyleFromName(style));
    const scheme = paletteStyle.createScheme(sourceColorArgb, isDark, contrastLevel);

    super({
      isDark,
      contrastLevel,
      variant: scheme.variant,
      sourceColorArgb,
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
