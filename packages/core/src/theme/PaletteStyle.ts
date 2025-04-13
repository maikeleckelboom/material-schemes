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
import {Contrast} from "./Contrast.ts";


// Base scheme configuration with type safety
const PALETTE_SCHEMES = {
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

export type SchemeVariant = typeof PALETTE_SCHEMES[keyof typeof PALETTE_SCHEMES];
export type PaletteStyleIdentifier = keyof typeof PALETTE_SCHEMES;

/**
 * Material Design palette styling system for dynamic color scheme generation.
 *
 * Provides 9 predefined styling strategies that map to Material Design's theming system.
 * Each style produces different visual characteristics while maintaining
 * proper contrastLevel and accessibility standards.
 */
export class PaletteStyle {
  /**
   * Achromatic theme using only black, white, and gray tones
   * @example
   * Ideal for minimalist interfaces or secondary themes
   */
  static readonly Monochrome = new PaletteStyle('Monochrome', 0);

  /**
   * Subtle chromatic palette with desaturated colors
   * @example
   * Suitable for professional or conservative applications
   */
  static readonly Neutral = new PaletteStyle('Neutral', 1);

  /**
   * Muted colors with tonal variations from a single hue
   * @example
   * Creates calm, harmonious interfaces
   */
  static readonly TonalSpot = new PaletteStyle('TonalSpot', 2);

  /**
   * Maximum color saturation with high contrastLevel
   * @example
   * Best for bold, attention-grabbing designs
   */
  static readonly Vibrant = new PaletteStyle('Vibrant', 3);

  /**
   * Artistic interpretation with hue-shifted accents
   * @example
   * Useful for creative or emotional interfaces
   */
  static readonly Expressive = new PaletteStyle('Expressive', 4);

  /**
   * Color-accurate scheme prioritizing container fidelity
   * @example
   * Maintains color relationships from source material
   */
  static readonly Fidelity = new PaletteStyle('Fidelity', 5);

  /**
   * Content-focused scheme with primary container emphasis
   * @example
   * Optimized for text-heavy interfaces
   */
  static readonly Content = new PaletteStyle('Content', 6);

  /**
   * Multi-hue playful theme with wide color distribution
   * @example
   * Creates energetic, dynamic interfaces
   */
  static readonly Rainbow = new PaletteStyle('Rainbow', 7);

  /**
   * High-contrastLevel complementary color combinations
   * @example
   * Ideal for data visualization and charts
   */
  static readonly FruitSalad = new PaletteStyle('FruitSalad', 8);

  /**
   * Map of palette styles to their respective scheme constructors
   * @internal
   */
  private static readonly SCHEME_MAP = {
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

  private constructor(
    /** Unique identifier in PascalCase */
    public readonly id: PaletteStyleIdentifier,
    /** A one-to-one mapping to the corresponding scheme variant */
    public readonly variant: number
  ) {
  }

  /**
   * Retrieve all available palette styles in declaration order
   * @returns Readonly array of all PaletteStyle instances
   */
  public static all(): PaletteStyle[] {
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
   * Resolve a palette style from various input types
   * @param style - Can be a PaletteStyle instance, style ID string, or variant number
   * @returns Corresponding PaletteStyle instance
   * @throws {Error} When input cannot be resolved to a valid style
   */
  public static from(style: PaletteStyle | PaletteStyleIdentifier | string): PaletteStyle {
    if (typeof style !== 'string') return style;
    const normalizedName = this.paletteStyleFromName(style);
    return this.fromName(normalizedName);
  }

  /**
   * Retrieve style by case-insensitive name with automatic formatting
   * @param name - Style identifier in any casing format
   * @returns Matching PaletteStyle instance
   * @throws {Error} When no matching style exists
   */
  public static fromName(name: string): PaletteStyle {
    const style = this.all().find((s) => s.id === this.normalizeName(name));
    if (!style) throw new Error(`Invalid PaletteStyle: ${name}`);
    return style;
  }

  /**
   * Normalizes a given id to PascalCase.
   *
   * @param name - A string in PascalCase, kebab-case, snake_case, or camelCase.
   * @returns The normalized string in PascalCase.
   */
  public static normalizeName(name: string): string {
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
   * Retrieves a `PaletteStyle` instance based on its variant.
   *
   * @param variant - The variant number of the palette style.
   * @returns The corresponding `PaletteStyle` instance.
   * @throws Error if no matching style is found.
   */
  public static fromVariant(variant: number): PaletteStyle {
    const style = this.all().find((s) => s.variant === variant);
    if (!style) throw new Error(`Invalid PaletteStyle variant: ${variant}`);
    return style;
  }

  /**
   * Creates a `DynamicScheme` using the current palette style and a source color.
   *
   * Key colors (primary, secondary, tertiary, neutral, and neutralVariant) are derived
   * based on the selected style and the provided source color.
   *
   * @param sourceColor - The input color in ARGB format.
   * @param isDark - Whether the scheme should target a dark theme. Defaults to `false`.
   * @param contrastLevel - Adjusts contrastLevel; 0.0 is default, positive/negative values tweak intensity.
   * @returns A `DynamicScheme` instance based on the source color and palette style.
   */
  public toScheme(
    sourceColor: number,
    isDark: boolean = false,
    contrastLevel: number = Contrast.Default.value,
  ) {
    const SchemeConstructor = PaletteStyle.SCHEME_MAP[this.id];
    return new SchemeConstructor(Hct.fromInt(sourceColor), isDark, contrastLevel);
  }

  /**
   * Retrieves the color scheme associated with this palette style.
   *
   * @internal
   */
  private static paletteStyleFromName(name: string): PaletteStyleIdentifier {
    const style = this.all().find((s) => s.id === this.normalizeName(name));
    if (!style) throw new Error(`Invalid PaletteStyle: ${name}`);
    return style.id;
  }
}
