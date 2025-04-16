import {clampDouble, Contrast, Hct, lstarFromArgb} from '@material/material-color-utilities';
import type {Color} from '../types';
import {toArgb, toHct} from './index.ts';
import {ContrastThreshold} from "../theme/ContrastThreshold.ts";

/**
 * Get a contrasting tone based on a base tone and a contrast ratio.
 *
 * @param baseTone - The base tone.
 * @param ratio - The contrast ratio.
 * @param preferLighter - Whether to prefer a lighter or darker tone. Default is true (lighter).
 * @returns The contrasting tone.
 */
function getContrastingTone(
  baseTone: number,
  ratio: number,
  preferLighter: boolean,
): number {
  if (preferLighter) return Contrast.lighter(baseTone, ratio);
  else return Contrast.darker(baseTone, ratio);
}

/**
 * Get the best contrasting tone based on a base tone and a contrast ratio.
 *
 * @param tone - The base tone.
 * @param ratio - The contrast ratio.
 * @returns The best contrasting tone.
 */
function getBestContrastingTone(
  tone: number,
  ratio: number = ContrastThreshold.WCAG_AAA_NORMAL_TEXT.value,
): number {
  const contrastWithDark = Contrast.ratioOfTones(tone, 0);
  const contrastWithLight = Contrast.ratioOfTones(tone, 100);
  const preferLighter = contrastWithLight > contrastWithDark;
  if (preferLighter) return Contrast.lighter(tone, ratio);
  else return Contrast.darker(tone, ratio);
}

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
  const argb = toArgb(color);
  const {hue, chroma, tone} = Hct.fromInt(argb);
  const contrastTone = getBestContrastingTone(tone);
  return Hct.from(hue, chroma, contrastTone).toInt();
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
