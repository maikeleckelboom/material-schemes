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
  SchemeVibrant,
} from '@material/material-color-utilities';


export type SchemeOfPaletteStyle =
  | typeof SchemeMonochrome
  | typeof SchemeNeutral
  | typeof SchemeTonalSpot
  | typeof SchemeVibrant
  | typeof SchemeExpressive
  | typeof SchemeFidelity
  | typeof SchemeContent
  | typeof SchemeRainbow
  | typeof SchemeFruitSalad;

const PALETTE_ENTRIES = [
  'Monochrome',
  'Neutral',
  'TonalSpot',
  'Vibrant',
  'Expressive',
  'Fidelity',
  'Content',
  'Rainbow',
  'FruitSalad',
] as const;

const paletteStyleSchemes: Record<PaletteStyleName, SchemeOfPaletteStyle> = {
  Monochrome: SchemeMonochrome,
  Neutral: SchemeNeutral,
  TonalSpot: SchemeTonalSpot,
  Vibrant: SchemeVibrant,
  Expressive: SchemeExpressive,
  Fidelity: SchemeFidelity,
  Content: SchemeContent,
  Rainbow: SchemeRainbow,
  FruitSalad: SchemeFruitSalad,
} as const;

export type PaletteStyleName = (typeof PALETTE_ENTRIES)[number];

/**
 * Represents different palette styling options based on Material Design variants.
 *
 * Each style corresponds to a specific color scheme generation strategy:
 *
 * - `Monochrome`: Black/white/gray theme without chromatic colors
 * - `Neutral`: Subtle chromatic colors with low saturation
 * - `TonalSpot`: Muted colors with tonal variations
 * - `Vibrant`: High-contrast, maximum colorfulness
 * - `Expressive`: Artistic interpretation with shifted hues
 * - `Fidelity`: Focus on color accuracy in containers
 * - `Content`: Content-focused color placement
 * - `Rainbow`: Playful multicolor theme
 * - `FruitSalad`: Bold, high-contrast color combinations
 *
 * These maps to Material Design's "Variant" system for dynamic color theming.
 */
export class PaletteStyle {
  /**
   * Purely achromatic theme using black, white, and gray tones
   */
  static readonly Monochrome = new PaletteStyle('Monochrome', 0);

  /**
   * Subtly chromatic theme with minimal color saturation
   */
  static readonly Neutral = new PaletteStyle('Neutral', 1);

  /**
   * Calm theme with tonal variations and muted colors
   */
  static readonly TonalSpot = new PaletteStyle('TonalSpot', 2);

  /**
   * High-contrast theme with maximum color saturation
   */
  static readonly Vibrant = new PaletteStyle('Vibrant', 3);

  /**
   * Artistic theme with hue shifts from source color
   */
  static readonly Expressive = new PaletteStyle('Expressive', 4);

  /**
   * Color-accurate theme emphasizing container colors
   */
  static readonly Fidelity = new PaletteStyle('Fidelity', 5);

  /**
   * Content-focused theme with primary container emphasis
   */
  static readonly Content = new PaletteStyle('Content', 6);

  /**
   * Playful theme with diverse hue distribution
   */
  static readonly Rainbow = new PaletteStyle('Rainbow', 7);

  /**
   * Bold theme with contrasting color combinations
   */
  static readonly FruitSalad = new PaletteStyle('FruitSalad', 8);

  private constructor(
    public readonly name: PaletteStyleName,
    public readonly variant: number
  ) {
  }

  static getAll(): PaletteStyle[] {
    return [
      this.Monochrome,
      this.Neutral,
      this.TonalSpot,
      this.Vibrant,
      this.Expressive,
      this.Fidelity,
      this.Content,
      this.Rainbow,
      this.FruitSalad,
    ];
  }

  /**
   * Retrieves all available palette styles in declaration order.
   *
   * @returns An array of all `PaletteStyle` instances.
   */
  static fromName(name: string): PaletteStyle {
    const style = this.getAll().find((s) => s.name === this.normalize(name));
    if (!style) throw new Error(`Invalid PaletteStyle: ${name}`);
    return style;
  }

  /**
   * Normalizes a given name to PascalCase.
   *
   * @param name - A string in PascalCase, kebab-case, snake_case, or camelCase.
   * @returns The normalized string in PascalCase.
   */
  static normalize(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, ' ') // Replace non-alphanumerics with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase into words
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Creates a `DynamicScheme` based on the palette style.
   *
   * @param sourceColor - The source color in ARGB format.
   * @param isDark - Indicates if the scheme is for a dark theme. Defaults to `false`.
   * @param contrastLevel - The contrast level for the scheme.
   * @returns An instance of the corresponding color scheme.
   */
  public createScheme(
    sourceColor: number,
    isDark: boolean = false,
    contrastLevel: number = 0.0,
  ) {
    const SchemeConstructor = paletteStyleSchemes[this.name];
    return new SchemeConstructor(Hct.fromInt(sourceColor), isDark, contrastLevel);
  }
}
