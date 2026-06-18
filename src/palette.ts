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
  TonalPalette,
  Variant,
} from '@material/material-color-utilities';
import { toArgb } from './color';
import { ContrastLevel } from './contrast';
import { CMF_SUPPORTED, DEFAULT_PALETTE_TONES, PALETTE_STYLE_NAMES } from './roles';
import type { Color, PaletteStyleInput, PaletteStyleName, Platform, SpecVersion } from './types';

type PaletteStyleScheme =
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
  sourceColorHct: Hct,
  isDark: boolean,
  contrastLevel: number,
  specVersion?: SpecVersion,
  platform?: Platform,
) => PaletteStyleScheme;

export class PaletteStyle {
  public readonly name: PaletteStyleName;
  public readonly value: Variant;
  private readonly schemeConstructor: SchemeConstructor;

  private constructor(
    name: PaletteStyleName,
    value: Variant,
    schemeConstructor: SchemeConstructor,
  ) {
    this.name = name;
    this.value = value;
    this.schemeConstructor = schemeConstructor;
  }

  public dynamicScheme(
    sourceColorHct: Hct,
    isDark: boolean = false,
    contrastLevel: number = ContrastLevel.Default.value,
    specVersion?: SpecVersion,
    platform?: Platform,
  ): PaletteStyleScheme {
    return new this.schemeConstructor(sourceColorHct, isDark, contrastLevel, specVersion, platform);
  }

  public static readonly Monochrome = new PaletteStyle(
    'Monochrome',
    Variant.MONOCHROME,
    SchemeMonochrome,
  );
  public static readonly Neutral = new PaletteStyle('Neutral', Variant.NEUTRAL, SchemeNeutral);
  public static readonly TonalSpot = new PaletteStyle(
    'TonalSpot',
    Variant.TONAL_SPOT,
    SchemeTonalSpot,
  );
  public static readonly Vibrant = new PaletteStyle('Vibrant', Variant.VIBRANT, SchemeVibrant);
  public static readonly Expressive = new PaletteStyle(
    'Expressive',
    Variant.EXPRESSIVE,
    SchemeExpressive,
  );
  public static readonly Fidelity = new PaletteStyle('Fidelity', Variant.FIDELITY, SchemeFidelity);
  public static readonly Content = new PaletteStyle('Content', Variant.CONTENT, SchemeContent);
  public static readonly Rainbow = new PaletteStyle('Rainbow', Variant.RAINBOW, SchemeRainbow);
  public static readonly FruitSalad = new PaletteStyle(
    'FruitSalad',
    Variant.FRUIT_SALAD,
    SchemeFruitSalad,
  );

  public static readonly Values = [
    PaletteStyle.Monochrome,
    PaletteStyle.Neutral,
    PaletteStyle.TonalSpot,
    PaletteStyle.Vibrant,
    PaletteStyle.Expressive,
    PaletteStyle.Fidelity,
    PaletteStyle.Content,
    PaletteStyle.Rainbow,
    PaletteStyle.FruitSalad,
  ] as const;

  public static from(input: PaletteStyleInput | undefined): PaletteStyle {
    if (input instanceof PaletteStyle) return input;
    if (input == null) return PaletteStyle.TonalSpot;
    if (typeof input === 'number') {
      const style = PaletteStyle.Values.find((candidate) => candidate.value === input);
      if (style) return style;
      throw new Error(`Invalid Material variant: ${input}`);
    }

    const normalized = normalizeStyleName(input);
    if (normalized === 'cmf') {
      throw new Error(
        CMF_SUPPORTED
          ? 'CMF is not wired in this build.'
          : 'CMF is not available in @material/material-color-utilities@0.4.0; SchemeCmf and Variant.CMF are not published.',
      );
    }

    const style = PaletteStyle.Values.find(
      (candidate) => normalizeStyleName(candidate.name) === normalized,
    );
    if (!style) throw new Error(`Invalid palette style: ${input}`);
    return style;
  }
}

export function createPalette(color: Color): TonalPalette {
  return TonalPalette.fromInt(toArgb(color));
}

export function getPaletteColors(
  palette: TonalPalette,
  tones: readonly number[] = DEFAULT_PALETTE_TONES,
): Record<number, number> {
  return Object.fromEntries(tones.map((tone) => [tone, palette.tone(tone)]));
}

function normalizeStyleName(style: string): string {
  return style.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export { PALETTE_STYLE_NAMES };
