export const MATERIAL_PALETTE_KEY_COLOR_ROLES = [
  'primaryPaletteKeyColor',
  'secondaryPaletteKeyColor',
  'tertiaryPaletteKeyColor',
  'neutralPaletteKeyColor',
  'neutralVariantPaletteKeyColor',
  'errorPaletteKeyColor',
] as const;

export const MATERIAL_REQUIRED_COLOR_ROLES = [
  ...MATERIAL_PALETTE_KEY_COLOR_ROLES,
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

export const MATERIAL_OPTIONAL_COLOR_ROLES = [
  'primaryDim',
  'secondaryDim',
  'tertiaryDim',
  'errorDim',
] as const;

export const MATERIAL_COLOR_ROLES = [
  ...MATERIAL_REQUIRED_COLOR_ROLES,
  ...MATERIAL_OPTIONAL_COLOR_ROLES,
] as const;

export const MATERIAL_VARIANTS = [
  'monochrome',
  'neutral',
  'tonal-spot',
  'vibrant',
  'expressive',
  'fidelity',
  'content',
  'rainbow',
  'fruit-salad',
] as const;

export const SUPPORTED_SPEC_VERSIONS = ['2021', '2025', '2026'] as const;

export const SUPPORTED_PLATFORMS = ['phone', 'watch'] as const;
