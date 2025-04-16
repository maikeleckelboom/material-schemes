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
export function createTonalPalette(color: Color): TonalPalette {
  return TonalPalette.fromInt(toArgb(color));
}

/**
 * Extracts color values for specified tones from a TonalPalette.
 * @param palette - A TonalPalette instance.
 * @param tones - An array of tone values.
 * @returns An object mapping tone values to color values.
 */
export function getColorsFromPalette(
  palette: TonalPalette,
  tones: number[] = [...DEFAULT_PALETTE_TONES],
): Record<number, Color> {
  return Object.fromEntries(tones.map((tone) => [tone, palette.tone(tone)]));
}
