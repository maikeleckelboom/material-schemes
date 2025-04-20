import {QuantizerCelebi} from '@material/material-color-utilities';
import {DEFAULT_QUANTIZE_MAX_COLORS} from '../constants';

/**
 * Quantize an image into a set of colors.
 *
 * @param pixelArray Colors in ARGB format.
 * @param maxColors The number of colors to divide the image into.
 * A lower number of colors may be returned.
 * @return Map with keys of colors in ARGB format, and values of number of
 *     pixels in the original image that correspond to the color in the
 *     quantized image.
 */
export function quantize(
  pixelArray: number[],
  maxColors: number = DEFAULT_QUANTIZE_MAX_COLORS,
): Map<number, number> {
  return QuantizerCelebi.quantize(pixelArray, maxColors);
}
