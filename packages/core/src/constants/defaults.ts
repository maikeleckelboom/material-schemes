/**
 * An immutable array containing the valid string names for predefined
 * Material Design 3 dynamic color palette generation styles.
 *
 * These names correspond to the different aesthetic choices available
 * and are used to derive the `PaletteStyleName` type union.
 *
 * @see PaletteStyleName for the derived type.
 * @see PaletteStyle for the corresponding style objects/enums (if they exist).
 */
export const PALETTE_STYLE_NAMES = [
  "Monochrome",
  "Neutral",
  "TonalSpot",
  "Vibrant",
  "Expressive",
  "Fidelity",
  "Content",
  "Rainbow",
  "FruitSalad",
] as const;

/**
 * An immutable array representing the default subset of tones (ranging from 0 to 100)
 * recommended for inclusion in generated tonal palettes when not explicitly specified otherwise.
 *
 * Using this subset can reduce the size of generated themes or stylesheets
 * while retaining the most commonly used tones for Material Design components.
 * This might be used when `SharedColorSchemeConfig.paletteTones` is set to `true`.
 *
 * @see SharedColorSchemeConfig.paletteTones where this default might be triggered.
 */
export const DEFAULT_PALETTE_TONES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100] as const;

/**
 * An immutable object containing default options for the color scoring process.
 * Scoring is typically used when selecting the most prominent or suitable colors
 * from an image source (like wallpaper or content) for dynamic theme generation.
 */
export const DEFAULT_SCORE_OPTIONS = {
  /**
   * The desired number of prominent colors to extract during the scoring process.
   * (Interpretation based on common color scoring library patterns).
   */
  desired: 5,
  /**
   * Specifies whether to filter out colors that are near-grayscale or otherwise
   * considered unsuitable for generating a vibrant theme during scoring.
   */
  filter: true,
  /**
   * The default fallback color (in 32-bit ARGB integer format) to be used
   * if the scoring process fails to identify any suitable color from the source.
   * Defaults to opaque black (0xff000000).
   */
  fallbackColorARGB: 0xff000000,
} as const;

/**
 * The default maximum number of distinct colors to consider during the
 * color quantization phase when analyzing an image for dynamic theme generation.
 * Quantization is a process that reduces the number of colors in an image
 * to simplify analysis and color extraction.
 */
export const DEFAULT_QUANTIZE_MAX_COLORS = 128;
