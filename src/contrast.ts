import {
  argbFromLstar,
  clampDouble,
  Contrast,
  Hct,
  lstarFromArgb,
} from '@material/material-color-utilities';
import { toArgb, toHct } from './color';
import type { Color, ContrastLevelInput } from './types';

export class ContrastLevel {
  public readonly name: string;
  public readonly value: number;

  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public static readonly Reduced = new ContrastLevel('Reduced', -1);
  public static readonly Default = new ContrastLevel('Default', 0);
  public static readonly Medium = new ContrastLevel('Medium', 0.5);
  public static readonly High = new ContrastLevel('High', 1);

  public static readonly Values = [
    ContrastLevel.Reduced,
    ContrastLevel.Default,
    ContrastLevel.Medium,
    ContrastLevel.High,
  ] as const;

  public static from(input: ContrastLevelInput | undefined): ContrastLevel {
    if (input instanceof ContrastLevel) return input;
    if (typeof input === 'number') return ContrastLevel.findClosest(input);
    return ContrastLevel.Default;
  }

  public static findClosest(value: number): ContrastLevel {
    if (value < 0) return ContrastLevel.Reduced;

    const candidates = ContrastLevel.Values.filter((level) => level.value >= 0).sort(
      (left, right) => right.value - left.value,
    );

    return candidates.find((level) => value >= level.value) ?? ContrastLevel.Default;
  }
}

export function resolveContrastLevelValue(contrastLevel: ContrastLevelInput | undefined): number {
  if (contrastLevel instanceof ContrastLevel) return contrastLevel.value;
  if (contrastLevel === undefined) return ContrastLevel.Default.value;
  if (Number.isFinite(contrastLevel) && contrastLevel >= -1 && contrastLevel <= 1) {
    return contrastLevel;
  }

  throw new Error('contrastLevel must be a finite number between -1 and 1.');
}

export class ContrastThreshold {
  public readonly name: string;
  public readonly value: number;

  private constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public static readonly WCAG_AA_NORMAL_TEXT = new ContrastThreshold('WCAG_AA_NORMAL_TEXT', 4.5);
  public static readonly WCAG_AA_LARGE_TEXT = new ContrastThreshold('WCAG_AA_LARGE_TEXT', 3);
  public static readonly WCAG_AAA_NORMAL_TEXT = new ContrastThreshold('WCAG_AAA_NORMAL_TEXT', 7);
  public static readonly WCAG_AAA_LARGE_TEXT = new ContrastThreshold('WCAG_AAA_LARGE_TEXT', 4.5);

  public static readonly Values = [
    ContrastThreshold.WCAG_AA_NORMAL_TEXT,
    ContrastThreshold.WCAG_AA_LARGE_TEXT,
    ContrastThreshold.WCAG_AAA_NORMAL_TEXT,
    ContrastThreshold.WCAG_AAA_LARGE_TEXT,
  ] as const;

  public static fromName(name: string): ContrastThreshold {
    const threshold = ContrastThreshold.Values.find((candidate) => candidate.name === name);
    if (!threshold) throw new Error(`Invalid contrast threshold: ${name}`);
    return threshold;
  }

  public static findClosest(value: number): ContrastThreshold {
    let currentValue = -Infinity;
    let currentThreshold: ContrastThreshold | undefined;

    for (const threshold of ContrastThreshold.Values) {
      if (threshold.value <= value && threshold.value >= currentValue) {
        currentValue = threshold.value;
        currentThreshold = threshold;
      }
    }

    return currentThreshold ?? ContrastThreshold.WCAG_AA_LARGE_TEXT;
  }
}

export function getLstarFromColor(color: Color): number {
  return lstarFromArgb(toArgb(color));
}

export function getContrastRatio(foreground: Color, background: Color): number {
  return Contrast.ratioOfTones(getLstarFromColor(foreground), getLstarFromColor(background));
}

export function getTonalContrastDelta(color1: Color, color2: Color): number {
  const hct1 = toHct(color1);
  const hct2 = toHct(color2);
  return Math.abs(hct1.tone - hct2.tone);
}

export function isContrasting(
  foreground: Color,
  background: Color,
  minimumRatio: number = ContrastThreshold.WCAG_AA_NORMAL_TEXT.value,
): boolean {
  return getContrastRatio(foreground, background) >= minimumRatio;
}

export function getContrastColor(
  color: Color,
  minimumRatio: number = ContrastThreshold.WCAG_AA_NORMAL_TEXT.value,
): number {
  const tone = getLstarFromColor(color);
  const whiteContrast = Contrast.ratioOfTones(tone, 100);
  const blackContrast = Contrast.ratioOfTones(tone, 0);

  if (whiteContrast >= minimumRatio && whiteContrast >= blackContrast) return argbFromLstar(100);
  if (blackContrast >= minimumRatio) return argbFromLstar(0);

  return argbFromLstar(findBestContrastTone(tone, minimumRatio));
}

export function lightenColor(color: Color, amount: number = 1): number {
  const hct = toHct(color);
  const tone = clampDouble(hct.tone + amount * (100 - hct.tone), 0, 100);
  return Hct.from(hct.hue, hct.chroma, tone).toInt();
}

export function darkenColor(color: Color, amount: number = 1): number {
  const hct = toHct(color);
  const tone = clampDouble(hct.tone - amount * hct.tone, 0, 100);
  return Hct.from(hct.hue, hct.chroma, tone).toInt();
}

function findBestContrastTone(baseTone: number, minimumRatio: number): number {
  let low = 0;
  let high = 100;
  let bestTone = baseTone;

  while (low <= high) {
    const mid = Math.round((low + high) / 2);
    const ratio = Contrast.ratioOfTones(baseTone, mid);

    if (ratio >= minimumRatio) {
      bestTone = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return bestTone;
}
