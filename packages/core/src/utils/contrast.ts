import {argbFromLstar, clampDouble, Contrast, Hct, lstarFromArgb} from '@material/material-color-utilities';
import type {Color} from '../types';
import {toArgb, toHct} from './index.ts';
import {ContrastThreshold} from "../theme";

/**
 * Finds the ARGB color with the best contrast (the highest or lowest tone) against a given color,
 * while ensuring a minimum contrast ratio.
 *
 * @param baseColor The base ARGB color to contrast with.
 * @param minContrastRatio The minimum contrast ratio required (default: 4.5).
 * @returns The ARGB color (black or white) with the best contrast, or the original color if no sufficient contrast is found.
 */
export function getBestContrastColorWithMinRatio(baseColor: Color, minContrastRatio: number = 4.5): number {
  const baseTone = lstarFromColor(baseColor);
  const whiteTone = 100;
  const blackTone = 0;

  const whiteContrast = Contrast.ratioOfTones(baseTone, whiteTone);
  const blackContrast = Contrast.ratioOfTones(baseTone, blackTone);

  if (whiteContrast >= minContrastRatio) {
    return argbFromLstar(whiteTone);
  } else if (blackContrast >= minContrastRatio) {
    return argbFromLstar(blackTone);
  }

  // If neither black nor white provides sufficient contrast, find the best tone
  const bestTone = findBestContrastTone(baseTone, minContrastRatio);
  return argbFromLstar(bestTone);
}

/**
 * Finds the best contrast tone for a given base tone and minimum contrast ratio.
 *
 * @param baseTone The base tone to find a contrast for.
 * @param minContrastRatio The minimum contrast ratio required (default: 4.5).
 * @returns The best contrast tone.
 */
function findBestContrastTone(baseTone: number, minContrastRatio: number): number {
  let low = 0;
  let high = 100;
  let bestTone = baseTone;

  while (low <= high) {
    const mid = Math.round((low + high) / 2);
    const contrast = Contrast.ratioOfTones(baseTone, mid);

    if (contrast >= minContrastRatio) {
      bestTone = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return bestTone;
}

// Exposed functions below
/**
 * Returns a contrast ratio, which ranges from 1 to 21.
 *
 * @param color1 The first Color to compare.
 * @param color2 The second Color to compare.
 * @return The contrast ratio of two tones, T in HCT, L* in Lab*.
 */
export function contrastRatio(color1: Color, color2: Color): number {
  return Contrast.ratioOfTones(toArgb(color1), toArgb(color2));
}

/**
 * Returns a tonal contrast ratio, which is a measure of how different two colors are in terms of their tone.
 *
 * The returned value is a non-negative double.
 * It is NOT a ratio in the sense of a:b, but a linear difference in perceptual luminance.
 *
 * @param color1 - The first Color to compare.
 * @param color2 - The second Color to compare.
 * @returns The tonal contrast.
 */
export function tonalContrastRatio(color1: Color, color2: Color): number {
  const hct1 = toHct(color1);
  const hct2 = toHct(color2);
  return Math.abs(hct1.tone - hct2.tone);
}

/**
 * Get a contrasting color based on the tone of the provided color.
 *
 * @param color - The color to get a contrasting color for.
 * @returns The contrasting color with the same hue and chroma, but a different tone.
 */
export function contrastColor(color: Color): number {
  const hct = toHct(color);
  const tone = hct.tone;
  const contrastTone = tone < 50 ? 100 : 0;
  return Hct.from(hct.hue, hct.chroma, contrastTone).toInt();
}

/**
 * Check if two colors have a contrast ratio greater than or equal to a specified minimum.
 *
 * @param color1 - The first color.
 * @param color2 - The second color.
 * @param minRatio - The minimum contrast ratio to check against. Default is 4.5.
 */
export function hasEnoughContrast(
  color1: Color,
  color2: Color,
  minRatio: number = ContrastThreshold.WCAG_AAA_NORMAL_TEXT.value,
): boolean {
  return contrastRatio(color1, color2) >= minRatio;
}

/**
 * Get the L* value from a color.
 * This is a measure of lightness in the CIE L*a*b* color space.
 *
 * @param color - The color to get the L* value from.
 */
export function lstarFromColor(color: Color): number {
  return lstarFromArgb(toArgb(color));
}

/**
 * Lighten a color by a specified ratio.
 *
 * @param color - The color to lighten.
 * @param ratio - The ratio to lighten the color by (default is 1.0).
 */
export function lighten(color: Color, ratio: number = 1.0): number {
  const argb = toArgb(color);
  const {hue, chroma, tone} = Hct.fromInt(argb);
  const newTone = clampDouble(tone + ratio * (100 - tone), 0, 100);
  return Hct.from(hue, chroma, newTone).toInt();
}

/**
 * Darken a color by a specified ratio.
 *
 * @param color - The color to darken.
 * @param ratio - The ratio to darken the color by (default is 1.0).
 */
export function darken(color: Color, ratio: number = 1.0): number {
  const argb = toArgb(color);
  const {hue, chroma, tone} = Hct.fromInt(argb);
  const newTone = clampDouble(tone - ratio * tone, 0, 100);
  return Hct.from(hue, chroma, newTone).toInt();
}
