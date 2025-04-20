import {DynamicScheme, type TonalPalette} from "@material/material-color-utilities";
import {
  type AdaptiveColorScheme,
  type Color,
  type ColorSchemeConfig,
  type ColorSchemeStylesConfig,
  ContrastLevel,
  createColorScheme,
  createCssVarsText,
  createTonalPalette,
  type DynamicColorSchemeOptions,
  isColor,
  MATERIAL_COLOR_ROLES,
  type MaterialColorScheme,
  PaletteStyle,
  toHct,
} from "../";

/**
 * A customizable dynamic color scheme generator that extends Material Design's DynamicScheme.
 * It accepts either a source color (with an optional primary override) or a complete configuration object.
 * @extends DynamicScheme
 */
export class DynamicColorScheme extends DynamicScheme {
  constructor(sourceColor: Color, options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>);
  constructor(options: DynamicColorSchemeOptions);
  constructor(source: Color | DynamicColorSchemeOptions, options?: Omit<DynamicColorSchemeOptions, 'sourceColor'>) {
    const opts: DynamicColorSchemeOptions = isColor(source) ? {sourceColor: source, ...options} : source;

    const {
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      isDark = false,
      style = PaletteStyle.TonalSpot,
      contrastLevel = ContrastLevel.Default.value
    } = opts;

    const sourceColor = toHct(opts?.sourceColor ?? primary ?? 0);
    const scheme = PaletteStyle.fromName(style).dynamicScheme(sourceColor, isDark, contrastLevel);

    super({
      ...scheme,
      primaryPalette: DynamicColorScheme.createPaletteOverride(primary, scheme.primaryPalette),
      secondaryPalette: DynamicColorScheme.createPaletteOverride(secondary, scheme.secondaryPalette),
      tertiaryPalette: DynamicColorScheme.createPaletteOverride(tertiary, scheme.tertiaryPalette),
      neutralPalette: DynamicColorScheme.createPaletteOverride(neutral, scheme.neutralPalette),
      neutralVariantPalette: DynamicColorScheme.createPaletteOverride(neutralVariant, scheme.neutralVariantPalette),
    });
  }

  /** @internal */
  private static createPaletteOverride(
    color: Color | undefined,
    defaultPalette: TonalPalette
  ): TonalPalette {
    if (color && !isColor(color)) {
      color = 0x00000000;
    }
    return color ? createTonalPalette(color) : defaultPalette;
  }

  public toJSON(): MaterialColorScheme {
    return MATERIAL_COLOR_ROLES.reduce((acc, role) => {
      acc[role] = this[role];
      return acc;
    }, {} as MaterialColorScheme);
  }

  public toColorScheme(options: ColorSchemeConfig<false> = {}): AdaptiveColorScheme {
    return createColorScheme(this, options);
  }

  public toCssVars(options: ColorSchemeStylesConfig = {}): string {
    const {selector, ...opts} = options || {};
    const colorScheme = this.toColorScheme(opts);
    return createCssVarsText(colorScheme, {selector});
  }
}
