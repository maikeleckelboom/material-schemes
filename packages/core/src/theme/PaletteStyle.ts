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
 * Represents palette styles mapped to Material Design schemes with
 * integrated scheme construction capabilities.
 */
export class PaletteStyle {
  public readonly name: string;
  public readonly ordinal: number;
  public readonly schemeConstructor: SchemeConstructor;

  private constructor(
    name: string,
    ordinal: number,
    schemeConstructor: SchemeConstructor
  ) {
    this.name = name;
    this.ordinal = ordinal;
    this.schemeConstructor = schemeConstructor;
  }

  /**
   * Creates a color scheme instance using this palette style.
   * @param sourceColor Base color in HCT color space
   * @param isDark Whether to generate dark mode scheme
   * @param contrastLevel Contrast level (0-1)
   */
  createScheme(
    sourceColor: Hct,
    isDark: boolean,
    contrastLevel: number
  ): SchemeVariant {
    return new this.schemeConstructor(sourceColor, isDark, contrastLevel);
  }

  public static readonly Monochrome = new PaletteStyle(
    "Monochrome",
    0,
    SchemeMonochrome
  );

  public static readonly Neutral = new PaletteStyle(
    "Neutral",
    1,
    SchemeNeutral
  );

  public static readonly TonalSpot = new PaletteStyle(
    "TonalSpot",
    2,
    SchemeTonalSpot
  );

  public static readonly Vibrant = new PaletteStyle(
    "Vibrant",
    3,
    SchemeVibrant
  );

  public static readonly Expressive = new PaletteStyle(
    "Expressive",
    4,
    SchemeExpressive
  );

  public static readonly Fidelity = new PaletteStyle(
    "Fidelity",
    5,
    SchemeFidelity
  );

  public static readonly Content = new PaletteStyle(
    "Content",
    6,
    SchemeContent
  );

  public static readonly Rainbow = new PaletteStyle(
    "Rainbow",
    7,
    SchemeRainbow
  );

  public static readonly FruitSalad = new PaletteStyle(
    "FruitSalad",
    8,
    SchemeFruitSalad
  );

  /* List of all available palette styles */
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
   * Gets a palette style by name
   * @throws Error if no style with given name exists
   */
  static valueOf(name: string): PaletteStyle {
    const style = PaletteStyle.entries.find(s => s.name === name);
    if (!style) throw new Error(`No PaletteStyle with name '${name}' found.`)
    return style;
  }
}
