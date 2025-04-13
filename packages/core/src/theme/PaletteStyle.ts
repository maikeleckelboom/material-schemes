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
import {Contrast} from './Contrast';
import {z} from 'zod';

type SchemeConstructor = new (
  sourceColor: Hct,
  isDark: boolean,
  contrastLevel: number
) => SchemeContent;

export type PaletteStyleIdentifier =
  | 'Monochrome'
  | 'Neutral'
  | 'TonalSpot'
  | 'Vibrant'
  | 'Expressive'
  | 'Fidelity'
  | 'Content'
  | 'Rainbow'
  | 'FruitSalad';

/**
 * Material Design palette styling system for dynamic color scheme generation.
 */
export class PaletteStyle {
  private static readonly STYLE_CACHE = new Map<string, PaletteStyle>();
  private static readonly VARIANT_CACHE = new Map<number, PaletteStyle>();
  private static readonly NORMALIZATION_REGEX = {
    NON_ALPHA_NUM: /[^a-zA-Z0-9]/g,
    CAMEL_CASE: /([a-z])([A-Z])/g,
  };

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

  // Predefined instances
  static readonly Monochrome = new PaletteStyle('Monochrome', 0);
  static readonly Neutral = new PaletteStyle('Neutral', 1);
  static readonly TonalSpot = new PaletteStyle('TonalSpot', 2);
  static readonly Vibrant = new PaletteStyle('Vibrant', 3);
  static readonly Expressive = new PaletteStyle('Expressive', 4);
  static readonly Fidelity = new PaletteStyle('Fidelity', 5);
  static readonly Content = new PaletteStyle('Content', 6);
  static readonly Rainbow = new PaletteStyle('Rainbow', 7);
  static readonly FruitSalad = new PaletteStyle('FruitSalad', 8);

  public constructor(
    public readonly id: PaletteStyleIdentifier,
    public readonly variant: number
  ) {
    if (new.target !== PaletteStyle) {
      throw new Error('PaletteStyle cannot be subclassed');
    }
  }

  /**
   * Retrieve all available palette styles
   */
  public static all(): ReadonlyArray<PaletteStyle> {
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
   */
  public static from(style: unknown): PaletteStyle {
    const result = PaletteStyleValidator.safeParse(style);

    if (!result.success) {
      throw this.handleError('Invalid style input', result.error);
    }

    if (result.data instanceof PaletteStyle) {
      return result.data;
    }

    if (typeof result.data === 'string') {
      return this.fromName(result.data);
    }

    return this.fromVariant(result.data);
  }

  /**
   * Get style by normalized name
   */
  public static fromName(name: string): PaletteStyle {
    const normalized = this.normalizeName(name);

    if (this.STYLE_CACHE.has(normalized)) {
      return this.STYLE_CACHE.get(normalized)!;
    }

    const style = this.all().find(s => s.id === normalized);

    if (!style) {
      throw this.handleError(`Invalid style name: ${name}`);
    }

    this.STYLE_CACHE.set(normalized, style);
    return style;
  }

  /**
   * Get style by variant number (0-8)
   */
  public static fromVariant(variant: number): PaletteStyle {
    if (!Number.isInteger(variant)) {
      throw this.handleError(`Invalid variant type: ${typeof variant}`);
    }

    if (variant < 0 || variant > 8) {
      throw this.handleError(`Variant out of range: ${variant}`);
    }

    if (this.VARIANT_CACHE.has(variant)) {
      return this.VARIANT_CACHE.get(variant)!;
    }

    const style = this.all().find(s => s.variant === variant);

    if (!style) {
      throw this.handleError(`Invalid variant: ${variant}`);
    }

    this.VARIANT_CACHE.set(variant, style);
    return style;
  }

  /**
   * Create DynamicScheme with current style
   */
  public toScheme(
    sourceColor: number,
    isDark: boolean = false,
    contrastLevel: number = Contrast.Default.value,
  ) {
    if (sourceColor < 0x00000000 || sourceColor > 0xFFFFFFFF) {
      throw PaletteStyle.handleError(`Invalid ARGB value: ${sourceColor}`);
    }

    const SchemeConstructor = this.getSchemeConstructor();
    return new SchemeConstructor(
      Hct.fromInt(sourceColor),
      isDark,
      contrastLevel
    );
  }

  /**
   * Normalize style names to PascalCase
   */
  public static normalizeName(name: string): string {
    return name
      .replace(this.NORMALIZATION_REGEX.NON_ALPHA_NUM, ' ')
      .replace(this.NORMALIZATION_REGEX.CAMEL_CASE, '$1 $2')
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0]!.toUpperCase() + word.slice(1))
      .join('');
  }

  private getSchemeConstructor(): SchemeConstructor {
    const constructor = PaletteStyle.SCHEME_MAP[this.id];
    if (!constructor) {
      throw PaletteStyle.handleError(
        `Missing scheme constructor for style: ${this.id}`
      );
    }
    return constructor;
  }

  private static handleError(message: string, cause?: unknown): never {
    const error = new Error(`[PaletteStyle] ${message}`, {cause});
    console.error(error);
    throw error;
  }
}

const PaletteStyleValidator = z.union([
  z.instanceof(PaletteStyle),
  z.string().transform(val => PaletteStyle.normalizeName(val)),
  z.number().int().min(0).max(8),
]);
