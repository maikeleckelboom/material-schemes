/**
 *
 *   /// Custom Color 1
 *   static const customColor1 = ExtendedColor(
 *     seed: Color(0xffd4b08f),
 *     value: Color(0xffd9ae96),
 *     light: ColorFamily(
 *       color: Color(0xff8c4f27),
 *       onColor: Color(0xffffffff),
 *       colorContainer: Color(0xffffdbc8),
 *       onColorContainer: Color(0xff6f3811),
 *     ),
 *     lightMediumContrast: ColorFamily(
 *       color: Color(0xff8c4f27),
 *       onColor: Color(0xffffffff),
 *       colorContainer: Color(0xffffdbc8),
 *       onColorContainer: Color(0xff6f3811),
 *     ),
 *     lightHighContrast: ColorFamily(
 *       color: Color(0xff8c4f27),
 *       onColor: Color(0xffffffff),
 *       colorContainer: Color(0xffffdbc8),
 *       onColorContainer: Color(0xff6f3811),
 *     ),
 *     dark: ColorFamily(
 *       color: Color(0xffffb68b),
 *       onColor: Color(0xff522300),
 *       colorContainer: Color(0xff6f3811),
 *       onColorContainer: Color(0xffffdbc8),
 *     ),
 *     darkMediumContrast: ColorFamily(
 *       color: Color(0xffffb68b),
 *       onColor: Color(0xff522300),
 *       colorContainer: Color(0xff6f3811),
 *       onColorContainer: Color(0xffffdbc8),
 *     ),
 *     darkHighContrast: ColorFamily(
 *       color: Color(0xffffb68b),
 *       onColor: Color(0xff522300),
 *       colorContainer: Color(0xff6f3811),
 *       onColorContainer: Color(0xffffdbc8),
 *     ),
 *   );
 *
 *
 *   List<ExtendedColor> get extendedColors => [
 *     customColor1,
 *   ];
 * }
 *
 * class ExtendedColor {
 *   final Color seed, value;
 *   final ColorFamily light;
 *   final ColorFamily lightHighContrast;
 *   final ColorFamily lightMediumContrast;
 *   final ColorFamily dark;
 *   final ColorFamily darkHighContrast;
 *   final ColorFamily darkMediumContrast;
 *
 *   const ExtendedColor({
 *     required this.seed,
 *     required this.value,
 *     required this.light,
 *     required this.lightHighContrast,
 *     required this.lightMediumContrast,
 *     required this.dark,
 *     required this.darkHighContrast,
 *     required this.darkMediumContrast,
 *   });
 * }
 *
 * class ColorFamily {
 *   const ColorFamily({
 *     required this.color,
 *     required this.onColor,
 *     required this.colorContainer,
 *     required this.onColorContainer,
 *   });
 *
 *   final Color color;
 *   final Color onColor;
 *   final Color colorContainer;
 *   final Color onColorContainer;
 * }
 */


// src/themes/extended-color.ts

// Use ARGB integers for colors
export type Color = number;

/** A family of related color roles for a theme variant. */
export interface ColorFamily {
  readonly color: Color;
  readonly onColor: Color;
  readonly colorContainer: Color;
  readonly onColorContainer: Color;
}

// Define all your variants in one place for autocomplete and iteration
type Variant =
  | 'light'
  | 'lightMediumContrast'
  | 'lightHighContrast'
  | 'dark'
  | 'darkMediumContrast'
  | 'darkHighContrast';

export const variants = [
  'light',
  'lightMediumContrast',
  'lightHighContrast',
  'dark',
  'darkMediumContrast',
  'darkHighContrast',
] as const;
export type VariantKey = typeof variants[number];

/**
 * Helper to create a ColorFamily with readonly literals
 */
export function makeFamily(
  color: Color,
  onColor: Color,
  colorContainer: Color,
  onColorContainer: Color
): Readonly<ColorFamily> {
  return {color, onColor, colorContainer, onColorContainer} as const;
}

/**
 * ExtendedColor bundles seed/value plus themed families.
 */
export class ExtendedColor {
  public readonly seed: Color;
  public readonly value: Color;
  public readonly families: Readonly<Record<VariantKey, ColorFamily>>;

  constructor(
    seed: Color,
    value: Color,
    families: Record<VariantKey, ColorFamily>
  ) {
    this.seed = seed;
    this.value = value;
    // Freeze to prevent runtime mutation
    this.families = Object.freeze({...families});
  }

  /** Retrieve a specific family by variant */
  public get(variant: VariantKey): ColorFamily {
    return this.families[variant];
  }
}

// === Instantiate your custom color ===
export const customColor1 = new ExtendedColor(
  0xffd4b08f, // seed
  0xffd9ae96, // value
  {
    light: makeFamily(0xff8c4f27, 0xffffffff, 0xffffdbc8, 0xff6f3811),
    lightMediumContrast: makeFamily(0xff8c4f27, 0xffffffff, 0xffffdbc8, 0xff6f3811),
    lightHighContrast: makeFamily(0xff8c4f27, 0xffffffff, 0xffffdbc8, 0xff6f3811),
    dark: makeFamily(0xffffb68b, 0xff522300, 0xff6f3811, 0xffffdbc8),
    darkMediumContrast: makeFamily(0xffffb68b, 0xff522300, 0xff6f3811, 0xffffdbc8),
    darkHighContrast: makeFamily(0xffffb68b, 0xff522300, 0xff6f3811, 0xffffdbc8),
  }
);

// Export your palette as an immutable tuple
export const extendedColors = [customColor1] as const;

// === Usage example ===
// const primaryOnLight = customColor1.get('light').color;

