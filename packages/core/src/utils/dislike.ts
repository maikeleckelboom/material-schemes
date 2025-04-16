import { DislikeAnalyzer, Hct } from '@material/material-color-utilities';
import { toArgb } from './index.ts';
import type { Color } from '../types';

/**
 * Returns true if a color is disliked.
 *
 * @param color A color to be judged.
 * @return Whether the color is disliked.
 *
 * Disliked is defined as a dark yellow-green that is not neutral.
 */
export function isDisliked(color: Color): boolean {
  const argb = toArgb(color);
  const hct = Hct.fromInt(argb);
  return DislikeAnalyzer.isDisliked(hct);
}

/**
 * If a color is disliked, lighten it to make it likable.
 *
 * @param color A color to be judged.
 * @return A new color if the original color is disliked, or the original
 *   color if it is acceptable.
 */
export function fixIfDisliked(color: Color): number {
  const argb = toArgb(color);
  const hct = Hct.fromInt(argb);
  return DislikeAnalyzer.fixIfDisliked(hct).toInt();
}
