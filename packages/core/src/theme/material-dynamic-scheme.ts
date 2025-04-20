import {DynamicScheme, type TonalPalette} from "@material/material-color-utilities";
import {
  type Color,
  type SharedColorSchemeConfig,
  type ColorSchemeReturnType,
  type ColorSchemeStylesConfig,
  ContrastLevel,
  createColorScheme,
  createTonalPalette,
  colorSchemeToCssVars,
  type MaterialDynamicSchemeOptions,
  isColor,
  PaletteStyle,
  toHct,
} from "../";

/**
 * A customizable dynamic color scheme generator that extends Material Design's DynamicScheme.
 * @extends DynamicScheme
 */
export class MaterialDynamicScheme extends DynamicScheme {
  constructor(sourceColor: Color, options?: Omit<MaterialDynamicSchemeOptions, 'sourceColor'>);
  constructor(options: MaterialDynamicSchemeOptions);
  constructor(source: Color | MaterialDynamicSchemeOptions, options?: Omit<MaterialDynamicSchemeOptions, 'sourceColor'>) {
    const opts: MaterialDynamicSchemeOptions = isColor(source) ? {sourceColor: source, ...options} : source;

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
    const scheme = PaletteStyle.from(style).dynamicScheme(sourceColor, isDark, contrastLevel);

    super({
      ...scheme,
      primaryPalette: MaterialDynamicScheme.createPaletteOverride(primary, scheme.primaryPalette),
      secondaryPalette: MaterialDynamicScheme.createPaletteOverride(secondary, scheme.secondaryPalette),
      tertiaryPalette: MaterialDynamicScheme.createPaletteOverride(tertiary, scheme.tertiaryPalette),
      neutralPalette: MaterialDynamicScheme.createPaletteOverride(neutral, scheme.neutralPalette),
      neutralVariantPalette: MaterialDynamicScheme.createPaletteOverride(neutralVariant, scheme.neutralVariantPalette),
    });
  }

  /** @internal */
  private static createPaletteOverride(color: Color | undefined, defaultPalette: TonalPalette): TonalPalette {
    if (color && !isColor(color)) {
      color = 0x00000000;
    }
    return color ? createTonalPalette(color) : defaultPalette;
  }

  public toColorScheme<V extends boolean = false>(options?: SharedColorSchemeConfig<V>): ColorSchemeReturnType {
    return createColorScheme(this, options);
  }

  public toCssVars(options?: ColorSchemeStylesConfig<false, false>): string {
    const {selector, minify, ...opts} = options || {};
    const colorScheme = this.toColorScheme(opts);
    return colorSchemeToCssVars(colorScheme, {selector, minify});
  }
}
