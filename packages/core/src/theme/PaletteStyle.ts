import {
  Hct,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant
} from "@material/material-color-utilities";
import {ContrastLevel} from "./ContrastLevel.ts";

type SchemeVariant =
  | SchemeContent
  | SchemeExpressive
  | SchemeFidelity
  | SchemeFruitSalad
  | SchemeMonochrome
  | SchemeNeutral
  | SchemeRainbow
  | SchemeTonalSpot
  | SchemeVibrant;

type SchemeConstructor = new (
  sourceColor: Hct,
  isDark: boolean,
  contrastLevel: number
) => SchemeVariant;

/**
 * Represents different visual styles for color palette generation,
 * each corresponding to specific Material Design theme variants.
 * These styles control how colors are derived from the source color and arranged in the palette.
 */
export class PaletteStyle {
  /** Human-readable style name (e.g., "Vibrant", "Monochrome") */
  public readonly name: string;
  /**
   * Numeric index for ordering styles.
   * @note Useful for maintaining consistent display order in UI controls
   */
  public readonly value: number;
  /**
   * Constructor for the associated Material Design scheme class
   * @private Internal use only - accessed via dynamicScheme()
   */
  public readonly schemeConstructor: SchemeConstructor;

  /** @private Prevents arbitrary instance creation - use predefined static instances */
  private constructor(
    name: string,
    value: number,
    schemeConstructor: SchemeConstructor
  ) {
    this.name = name;
    this.value = value;
    this.schemeConstructor = schemeConstructor;
  }

  /**
   * Generates a complete color scheme based on this palette style.
   *
   * @param sourceColor Base color in HCT (Hue-Chroma-Tone) color space
   * @param isDark Whether to generate a dark mode variant
   * @param contrastLevel Contrast adjustment (0 = default, 1 = maximum)
   * @returns Configured color scheme instance
   *
   * @example
   * const style = PaletteStyle.TonalSpot;
   * const scheme = style.dynamicScheme(Hct.fromInt(0xff0000), false, 0.5);
   */
  dynamicScheme(
    sourceColor: Hct,
    isDark: boolean = false,
    contrastLevel: number = ContrastLevel.Default.value
  ): SchemeVariant {
    return new this.schemeConstructor(sourceColor, isDark, contrastLevel);
  }

  /** Minimalist grayscale palette */
  public static readonly Monochrome = new PaletteStyle(
    "Monochrome",
    0,
    SchemeMonochrome
  );

  /** Subtle, low-chroma colors with natural feel */
  public static readonly Neutral = new PaletteStyle(
    "Neutral",
    1,
    SchemeNeutral
  );

  /** Classic Material Design style with tonal variations */
  public static readonly TonalSpot = new PaletteStyle(
    "TonalSpot",
    2,
    SchemeTonalSpot
  );

  /** Bold, high-chroma colors with maximum vibrancy */
  public static readonly Vibrant = new PaletteStyle(
    "Vibrant",
    3,
    SchemeVibrant
  );

  /** Expressive blends with artistic color transitions */
  public static readonly Expressive = new PaletteStyle(
    "Expressive",
    4,
    SchemeExpressive
  );

  /** Color-accurate palettes maintaining source hue */
  public static readonly Fidelity = new PaletteStyle(
    "Fidelity",
    5,
    SchemeFidelity
  );

  /** Optimized for readability in text-heavy interfaces */
  public static readonly Content = new PaletteStyle(
    "Content",
    6,
    SchemeContent
  );

  /** Full spectrum color progression */
  public static readonly Rainbow = new PaletteStyle(
    "Rainbow",
    7,
    SchemeRainbow
  );

  /** Complementary color pairs with natural harmony */
  public static readonly FruitSalad = new PaletteStyle(
    "FruitSalad",
    8,
    SchemeFruitSalad
  );

  /** Complete list of available palette styles in value order */
  public static readonly entries: readonly PaletteStyle[] = [
    PaletteStyle.Monochrome,
    PaletteStyle.Neutral,
    PaletteStyle.TonalSpot,
    PaletteStyle.Vibrant,
    PaletteStyle.Expressive,
    PaletteStyle.Fidelity,
    PaletteStyle.Content,
    PaletteStyle.Rainbow,
    PaletteStyle.FruitSalad,
  ];

  /**
   * Retrieves a PaletteStyle by its exact name
   *
   * @param name - Case-sensitive style name to lookup
   * @returns Matching PaletteStyle instance
   * @throws {Error} When no matching style exists
   *
   * @example
   * PaletteStyle.valueOf("Vibrant") // Returns Vibrant instance
   */
  static valueOf(name: string): PaletteStyle {
    const style = PaletteStyle.entries.find(s => s.name === name);
    if (!style) throw new Error(`No PaletteStyle with name '${name}' found.`)
    return style;
  }
}
