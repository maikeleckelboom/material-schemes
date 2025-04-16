/**
 * Material Design 3 color role tokens for creating consistent, theme-aware interfaces.
 *
 * @constant {ReadonlyArray<string>} COLOR_ROLES
 * @see {@link https://m3.material.io/styles/color/overview Material Design 3 Color-system}
 * @example
 * // Iterate through entries Material Design 3 color roles.
 * COLOR_ROLES.forEach(role => {
 *   console.log('Supported color role:', role);
 * });
 *
 * @description
 * A comprehensive list of color role tokens defined by Material Design 3.
 * These tokens serve as the foundational building blocks for establishing
 * consistent color relationships across different UI components and states,
 * supporting seamless transitions between light/dark themes and various elevations.
 * The array is frozen to ensure the integrity of the design system by preventing any modifications.
 */
export const COLOR_ROLES = [
  'primaryPaletteKeyColor',
  'secondaryPaletteKeyColor',
  'tertiaryPaletteKeyColor',
  'neutralPaletteKeyColor',
  'neutralVariantPaletteKeyColor',
  'background',
  'onBackground',
  'surface',
  'surfaceDim',
  'surfaceBright',
  'surfaceContainerLowest',
  'surfaceContainerLow',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'inverseSurface',
  'inverseOnSurface',
  'outline',
  'outlineVariant',
  'shadow',
  'scrim',
  'surfaceTint',
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'inversePrimary',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'primaryFixed',
  'primaryFixedDim',
  'onPrimaryFixed',
  'onPrimaryFixedVariant',
  'secondaryFixed',
  'secondaryFixedDim',
  'onSecondaryFixed',
  'onSecondaryFixedVariant',
  'tertiaryFixed',
  'tertiaryFixedDim',
  'onTertiaryFixed',
  'onTertiaryFixedVariant',
] as const;
