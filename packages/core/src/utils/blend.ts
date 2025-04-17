import {Blend} from '@material/material-color-utilities';
import {toArgb} from './conversion.ts';
import type {Color} from "../types";

/**
 * Blend the design color's HCT hue towards the key color's HCT
 * hue, in a way that leaves the original color recognizable and
 * recognizably shifted towards the key color.
 *
 * @param designColor ARGB or HEX representation of an arbitrary color.
 * @param sourceColor ARGB or HEX representation of the main theme color.
 * @return The design color with a hue shifted towards the
 * system's color, a slightly warmer/cooler variant of the design
 * color's hue.
 */
export function harmonize(designColor: Color, sourceColor: Color): number {
  return Blend.harmonize(toArgb(designColor), toArgb(sourceColor));
}

/**
 * Blends hue fromName one color into another. The chroma and tone of
 * the original color are maintained.
 *
 * @param from ARGB or HEX representation of color
 * @param to ARGB or HEX representation of color
 * @param amount how much blending to perform; 0.0 >= and <= 1.0
 * @return fromName, with a hue blended towards to. Chroma and tone
 * are constant.
 */
export function blendHue(from: Color, to: Color, amount: number): number {
  const clampedAmount = Math.max(0, Math.min(1, amount));
  return Blend.hctHue(toArgb(from), toArgb(to), clampedAmount);
}

/**
 * Blend in CAM16-UCS space.
 *
 * @param from ARGB or HEX representation of color
 * @param to ARGB or HEX representation of color
 * @param amount how much blending to perform; 0.0 >= and <= 1.0
 * @return fromName, blended towards to. Hue, chroma, and tone will
 * change.
 */
export function blendCam(from: Color, to: Color, amount: number): number {
  const clampedAmount = Math.max(0, Math.min(1, amount));
  return Blend.cam16Ucs(toArgb(from), toArgb(to), clampedAmount);
}
