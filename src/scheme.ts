import {
  DynamicScheme,
  Hct,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
} from '../vendor/material-color-utilities/dist/index.js';
import type { DynamicColor } from '../vendor/material-color-utilities/dist/index.js';
import { argbToHexColor, hexColorToArgb, normalizeHexColor } from './hex';
import {
  MATERIAL_COLOR_ROLES,
  MATERIAL_OPTIONAL_COLOR_ROLES,
  MATERIAL_VARIANTS,
  SUPPORTED_PLATFORMS,
  SUPPORTED_SPEC_VERSIONS,
} from './roles';
import type {
  CreateSchemesOptions,
  MaterialColorRole,
  MaterialOptionalColorRole,
  MaterialScheme,
  MaterialSchemes,
  MaterialVariant,
  Platform,
  SpecVersion,
} from './types';

type SchemeConstructor = new (
  sourceColorHct: Hct,
  isDark: boolean,
  contrastLevel: number,
  specVersion?: SpecVersion,
  platform?: Platform,
) => DynamicScheme;

const DEFAULT_VARIANT: MaterialVariant = 'tonal-spot';
const DEFAULT_SPEC_VERSION: SpecVersion = '2026';
const DEFAULT_PLATFORM: Platform = 'phone';

const SCHEME_CONSTRUCTORS: Record<MaterialVariant, SchemeConstructor> = {
  monochrome: SchemeMonochrome,
  neutral: SchemeNeutral,
  'tonal-spot': SchemeTonalSpot,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  fidelity: SchemeFidelity,
  content: SchemeContent,
  rainbow: SchemeRainbow,
  'fruit-salad': SchemeFruitSalad,
};

export function createSchemes(options: CreateSchemesOptions): MaterialSchemes {
  const sourceColor = normalizeHexColor(options.sourceColor, 'sourceColor');
  const sourceArgb = hexColorToArgb(sourceColor);
  const variant = resolveVariant(options.variant);
  const contrastLevel = resolveContrastLevel(options.contrastLevel);
  const specVersion = resolveSpecVersion(options.specVersion);
  const platform = resolvePlatform(options.platform);
  const Scheme = SCHEME_CONSTRUCTORS[variant];

  return {
    light: createMaterialScheme(Scheme, sourceArgb, false, contrastLevel, specVersion, platform),
    dark: createMaterialScheme(Scheme, sourceArgb, true, contrastLevel, specVersion, platform),
  };
}

function createMaterialScheme(
  Scheme: SchemeConstructor,
  sourceArgb: number,
  isDark: boolean,
  contrastLevel: number,
  specVersion: SpecVersion,
  platform: Platform,
): MaterialScheme {
  const dynamicScheme = new Scheme(
    Hct.fromInt(sourceArgb),
    isDark,
    contrastLevel,
    specVersion,
    platform,
  );

  return rolesToScheme(dynamicScheme);
}

function rolesToScheme(dynamicScheme: DynamicScheme): MaterialScheme {
  const colors = dynamicScheme.colors as unknown as Record<string, () => DynamicColor | undefined>;
  const output: Partial<Record<MaterialColorRole, string>> = {};

  for (const role of MATERIAL_COLOR_ROLES) {
    const colorFactory = colors[role];
    if (typeof colorFactory !== 'function') {
      if (isOptionalRole(role)) continue;
      throw new Error(`Material dynamic color is unavailable: ${role}`);
    }

    const dynamicColor = colorFactory.call(dynamicScheme.colors);
    if (dynamicColor === undefined) {
      if (isOptionalRole(role)) continue;
      throw new Error(`Material dynamic color is unavailable: ${role}`);
    }

    output[role] = argbToHexColor(dynamicScheme.getArgb(dynamicColor));
  }

  return output as MaterialScheme;
}

function resolveVariant(variant: unknown): MaterialVariant {
  if (variant === undefined) return DEFAULT_VARIANT;
  if ((MATERIAL_VARIANTS as readonly unknown[]).includes(variant))
    return variant as MaterialVariant;
  throw new Error(
    `Invalid variant "${String(variant)}". Expected ${formatExpected(MATERIAL_VARIANTS)}.`,
  );
}

function resolveContrastLevel(contrastLevel: unknown): number {
  if (contrastLevel === undefined) return 0;
  if (
    typeof contrastLevel === 'number' &&
    Number.isFinite(contrastLevel) &&
    contrastLevel >= -1 &&
    contrastLevel <= 1
  ) {
    return contrastLevel;
  }

  throw new Error('contrastLevel must be a finite number between -1 and 1.');
}

function resolveSpecVersion(specVersion: unknown): SpecVersion {
  if (specVersion === undefined) return DEFAULT_SPEC_VERSION;
  if ((SUPPORTED_SPEC_VERSIONS as readonly unknown[]).includes(specVersion)) {
    return specVersion as SpecVersion;
  }
  throw new Error(
    `Invalid specVersion "${String(specVersion)}". Expected ${formatExpected(SUPPORTED_SPEC_VERSIONS)}.`,
  );
}

function resolvePlatform(platform: unknown): Platform {
  if (platform === undefined) return DEFAULT_PLATFORM;
  if ((SUPPORTED_PLATFORMS as readonly unknown[]).includes(platform)) return platform as Platform;
  throw new Error(
    `Invalid platform "${String(platform)}". Expected ${formatExpected(SUPPORTED_PLATFORMS)}.`,
  );
}

function isOptionalRole(role: MaterialColorRole): role is MaterialOptionalColorRole {
  return (MATERIAL_OPTIONAL_COLOR_ROLES as readonly string[]).includes(role);
}

function formatExpected(values: readonly string[]): string {
  return values.map((value) => `"${value}"`).join(', ');
}
