import { Score } from '@material/material-color-utilities';
import {DEFAULT_SCORE_OPTIONS} from "../constants";

/**
 * Default options for ranking colors based on usage counts.
 * desired: is the max count of the colors returned.
 * fallbackColorARGB: Is the default color that should be used if no
 *                    other colors are suitable.
 * filter: controls if the resulting colors should be filtered to not include
 *         hues that are not used often enough, and colors that are effectively
 *         grayscale.
 */
export interface ScoreOptions {
  desired?: number;
  filter?: boolean;
  fallbackColorARGB?: number;
}

/**
 * Returns ranked color suggestions.
 *
 * @param colorToCount - A map of colors to their frequencies.
 * @param options - ScoreOptions (official naming) for computing rankings.
 * @returns A tuple with the best score followed by additional ranked values.
 */
export function score(
  colorToCount: Map<number, number>,
  options: ScoreOptions = DEFAULT_SCORE_OPTIONS,
): [number, ...number[]] {
  return Score.score(colorToCount, options) as [number, ...number[]];
}
