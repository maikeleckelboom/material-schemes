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
import {ContrastLevel} from "./contrast-level.ts";
import type {PaletteStyleName, PaletteStyleScheme} from "../types";

type SchemeConstructor = new (
  sourceColor: Hct,
  isDark: boolean,
  contrastLevel: number
) => PaletteStyleScheme;

/**
 * Defines visual styles for generating Material Design color palettes,
 * each mapped to specific algorithmically generated theme variants.
 *
 * Implemented as a typesafe enum pattern with associated scheme constructors.
 */
export class PaletteStyle {
  /** Display-friendly style name (e.g., "Vibrant", "Monochrome") */
  public readonly name: string;
  /**
   * Ordering index matching Material Design's internal variant order
   * @remark Useful for maintaining consistent UI presentation order
   */
  public readonly value: number;
  /** @internal Associated Material Design scheme constructor */
  private readonly schemeConstructor: SchemeConstructor;

  /** @private Restrict instantiation to predefined static instances */
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
   * Generates a color scheme instance using this style's algorithm
   * @param sourceColorHct Base color in HCT color space
   * @param isDark Dark mode toggle (default: false)
   * @param contrastLevel Contrast adjustment (0-1, default: 0)
   */
  dynamicScheme(
    sourceColorHct: Hct,
    isDark: boolean = false,
    contrastLevel: number = ContrastLevel.Default.value
  ): PaletteStyleScheme {
    return new this.schemeConstructor(sourceColorHct, isDark, contrastLevel);
  }

  /** Minimalist grayscale palette */
  public static readonly Monochrome = new PaletteStyle(
    'Monochrome',
    0,
    SchemeMonochrome
  );

  /** Subtle, low-chroma colors with a natural feel */
  public static readonly Neutral = new PaletteStyle(
    'Neutral',
    1,
    SchemeNeutral
  );

  /** Classic Material Design style with tonal variations */
  public static readonly TonalSpot = new PaletteStyle(
    'TonalSpot',
    2,
    SchemeTonalSpot
  );

  /** Bold, high-chroma colors with maximum vibrancy */
  public static readonly Vibrant = new PaletteStyle(
    'Vibrant',
    3,
    SchemeVibrant
  );

  /** Expressive blends with artistic color transitions */
  public static readonly Expressive = new PaletteStyle(
    'Expressive',
    4,
    SchemeExpressive
  );

  /** Color-accurate palettes maintaining source hue */
  public static readonly Fidelity = new PaletteStyle(
    'Fidelity',
    5,
    SchemeFidelity
  );

  /** Optimized for readability in text-heavy interfaces */
  public static readonly Content = new PaletteStyle(
    'Content',
    6,
    SchemeContent
  );

  /** Full spectrum color progression */
  public static readonly Rainbow = new PaletteStyle(
    'Rainbow',
    7,
    SchemeRainbow
  );

  /** Complementary color pairs with natural harmony */
  public static readonly FruitSalad = new PaletteStyle(
    'FruitSalad',
    8,
    SchemeFruitSalad
  );

  /** Complete list of available palette styles in value order */
  public static readonly Values: readonly PaletteStyle[] = [
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
   * Resolves a PaletteStyle by name or returns existing instance
   * @param name Case-sensitive style name or existing instance
   * @throws When name doesn't match any registered style
   * @example
   * PaletteStyle.from("Vibrant") // Returns Vibrant instance
   * PaletteStyle.from(PaletteStyle.Neutral) // Returns Neutral
   */
  static from(name: PaletteStyle | PaletteStyleName): PaletteStyle {
    if (name instanceof PaletteStyle) return name;
    const style = PaletteStyle.Values.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (!style) throw new Error(`No PaletteStyle with name '${name}' found.`)
    return style;
  }
}
