import {
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


export type PaletteStyleScheme =
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

const schemeMap: Record<PaletteStyleName, PaletteStyleScheme> = {
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

type PaletteStyleName = (typeof PALETTE_ENTRIES)[number];

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
   * @default new PaletteStyle('Monochrome', 0)
   */
  static readonly Monochrome = new PaletteStyle('Monochrome', 0);

  /**
   * Subtly chromatic theme with minimal color saturation
   * @default new PaletteStyle('Neutral', 1)
   */
  static readonly Neutral = new PaletteStyle('Neutral', 1);

  /**
   * Calm theme with tonal variations and muted colors
   * @default new PaletteStyle('TonalSpot', 2)
   */
  static readonly TonalSpot = new PaletteStyle('TonalSpot', 2);

  /**
   * High-contrast theme with maximum color saturation
   * @default new PaletteStyle('Vibrant', 3)
   */
  static readonly Vibrant = new PaletteStyle('Vibrant', 3);

  /**
   * Artistic theme with hue shifts from source color
   * @default new PaletteStyle('Expressive', 4)
   */
  static readonly Expressive = new PaletteStyle('Expressive', 4);

  /**
   * Color-accurate theme emphasizing container colors
   * @default new PaletteStyle('Fidelity', 5)
   */
  static readonly Fidelity = new PaletteStyle('Fidelity', 5);

  /**
   * Content-focused theme with primary container emphasis
   * @default new PaletteStyle('Content', 6)
   */
  static readonly Content = new PaletteStyle('Content', 6);

  /**
   * Playful theme with diverse hue distribution
   * @default new PaletteStyle('Rainbow', 7)
   */
  static readonly Rainbow = new PaletteStyle('Rainbow', 7);

  /**
   * Bold theme with contrasting color combinations
   * @default new PaletteStyle('FruitSalad', 8)
   */
  static readonly FruitSalad = new PaletteStyle('FruitSalad', 8);

  private constructor(
    public readonly name: PaletteStyleName,
    public readonly variant: number,
  ) {
  }

  /**
   * Retrieve all available palette styles in declaration order
   * @returns Array of PaletteStyle instances
   */
  static values(): PaletteStyle[] {
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
   * Get PaletteStyle by name
   * @param name - Case-sensitive style name
   * @returns Matching PaletteStyle instance
   * @throws Error if no matching style found
   */
  static valueOf(name: PaletteStyleName | string): PaletteStyle {
    const style = this.values().find((s) => s.name === name);
    if (!style) {
      throw new Error(`PaletteStyle not found: ${name}`);
    }
    return style;
  }
}
