import { TonalPalette } from '@material/material-color-utilities';
import { toArgb } from '../utils';
import { DEFAULT_PALETTE_TONES } from '../constants';
import type { Color } from '../types';

/**
 * Creates a TonalPalette, which is a convenience class for retrieving colors
 * that are constant in hue and chroma, but vary in tone.
 * @param color - The base color.
 * @returns A TonalPalette instance.
 */
export function createPalette(color: Color): TonalPalette {
  return TonalPalette.fromInt(toArgb(color));
}

