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
  argbFromHex,
  hexFromArgb,
} from '../vendor/material-color-utilities/dist/index.js';
import type { DynamicColor } from '../vendor/material-color-utilities/dist/index.js';
import { describe, expect, it } from 'vitest';
import { createSchemes } from '../src';
import {
  MATERIAL_COLOR_ROLES,
  MATERIAL_OPTIONAL_COLOR_ROLES,
  MATERIAL_REQUIRED_COLOR_ROLES,
} from '../src/roles';
import type {
  CreateSchemesOptions,
  MaterialColorRole,
  MaterialOptionalColorRole,
  MaterialScheme,
  MaterialVariant,
  Platform,
  SpecVersion,
} from '../src/types';

type SchemeConstructor = new (
  sourceColorHct: Hct,
  isDark: boolean,
  contrastLevel: number,
  specVersion?: SpecVersion,
  platform?: Platform,
) => DynamicScheme;

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

const VARIANTS = Object.keys(SCHEME_CONSTRUCTORS) as MaterialVariant[];
const SPEC_VERSIONS: SpecVersion[] = ['2021', '2025', '2026'];
const PLATFORMS: Platform[] = ['phone', 'watch'];
const SEEDS = ['#6750a4', '#2e7d32'] as const;
const CONTRAST_LEVELS = [-1, 0, 0.5, 1] as const;

describe('createSchemes', () => {
  it('returns paired lowercase hex role maps', () => {
    const schemes = createSchemes({
      sourceColor: '#6750A4',
      variant: 'tonal-spot',
      contrastLevel: 0,
      specVersion: '2026',
      platform: 'phone',
    });

    expect(schemes.light.primary).toMatch(/^#[0-9a-f]{6}$/);
    expect(schemes.dark.onSurface).toMatch(/^#[0-9a-f]{6}$/);
    expect(schemes.light.primary).not.toBe(schemes.dark.primary);
  });

  it('emits the exact Material role key set for the selected spec', () => {
    const schemes2021 = createSchemes({ sourceColor: '#6750a4', specVersion: '2021' });
    const schemes2026 = createSchemes({ sourceColor: '#6750a4', specVersion: '2026' });

    expectRequiredRoles(schemes2021.light);
    expectRequiredRoles(schemes2026.light);
    expectNoUnexpectedRoles(schemes2021.light);
    expectNoUnexpectedRoles(schemes2026.light);

    for (const role of MATERIAL_OPTIONAL_COLOR_ROLES) {
      expectOptionalHexRole(schemes2021.light, role);
      expectOptionalHexRole(schemes2026.light, role);
    }
  });

  it('matches the pinned provider across variants, specs, platforms, modes, seeds, and contrast levels', () => {
    for (const sourceColor of SEEDS) {
      for (const variant of VARIANTS) {
        for (const specVersion of SPEC_VERSIONS) {
          for (const platform of PLATFORMS) {
            for (const contrastLevel of CONTRAST_LEVELS) {
              const actual = createSchemes({
                sourceColor,
                variant,
                contrastLevel,
                specVersion,
                platform,
              });

              expect(actual.light).toEqual(
                createProviderScheme({
                  sourceColor,
                  variant,
                  contrastLevel,
                  specVersion,
                  platform,
                  isDark: false,
                }),
              );
              expect(actual.dark).toEqual(
                createProviderScheme({
                  sourceColor,
                  variant,
                  contrastLevel,
                  specVersion,
                  platform,
                  isDark: true,
                }),
              );
            }
          }
        }
      }
    }
  }, 30_000);

  it('keeps a small golden fixture for deliberate provider upgrades', () => {
    const schemes = createSchemes({
      sourceColor: '#6750a4',
      variant: 'tonal-spot',
      contrastLevel: 0,
      specVersion: '2026',
      platform: 'phone',
    });

    expect({
      lightPrimary: schemes.light.primary,
      lightOnPrimary: schemes.light.onPrimary,
      lightSurface: schemes.light.surface,
      darkPrimary: schemes.dark.primary,
      darkOnPrimary: schemes.dark.onPrimary,
      darkSurface: schemes.dark.surface,
    }).toEqual({
      lightPrimary: '#655789',
      lightOnPrimary: '#fdf7ff',
      lightSurface: '#fdf7fe',
      darkPrimary: '#cdc0ec',
      darkOnPrimary: '#443a5f',
      darkSurface: '#0f0d12',
    });
  });

  it('rejects inputs outside the narrow public boundary', () => {
    expect(() => createSchemes({ sourceColor: '6750a4' as never })).toThrow(
      /sourceColor must be a #RRGGBB hex color/,
    );
    expect(() => createSchemes({ sourceColor: '#6750a4ff' as never })).toThrow(
      /sourceColor must be a #RRGGBB hex color/,
    );
    expect(() => createSchemes({ sourceColor: 0xff6750a4 as never })).toThrow(
      /sourceColor must be a #RRGGBB hex color/,
    );
    expect(() => createSchemes({ sourceColor: '#6750a4', variant: 'TonalSpot' as never })).toThrow(
      /Invalid variant "TonalSpot". Expected "monochrome"/,
    );
    expect(() => createSchemes({ sourceColor: '#6750a4', variant: 'cmf' as never })).toThrow(
      /Invalid variant "cmf"/,
    );
    expect(() => createSchemes({ sourceColor: '#6750a4', contrastLevel: 1.1 })).toThrow(
      /contrastLevel must be a finite number between -1 and 1/,
    );
    expect(() => createSchemes({ sourceColor: '#6750a4', specVersion: '2027' as never })).toThrow(
      /Invalid specVersion "2027"/,
    );
    expect(() => createSchemes({ sourceColor: '#6750a4', platform: 'tablet' as never })).toThrow(
      /Invalid platform "tablet"/,
    );
  });
});

function createProviderScheme(
  options: CreateSchemesOptions & { readonly isDark: boolean },
): MaterialScheme {
  const Scheme = SCHEME_CONSTRUCTORS[options.variant ?? 'tonal-spot'];
  const scheme = new Scheme(
    Hct.fromInt(argbFromHex(options.sourceColor)),
    options.isDark,
    options.contrastLevel ?? 0,
    options.specVersion ?? '2026',
    options.platform ?? 'phone',
  );
  const colors = scheme.colors as unknown as Record<string, () => DynamicColor | undefined>;
  const output: Partial<Record<MaterialColorRole, string>> = {};

  for (const role of MATERIAL_COLOR_ROLES) {
    const colorFactory = colors[role];
    const dynamicColor = colorFactory?.call(scheme.colors);
    if (dynamicColor === undefined) {
      if (isOptionalRole(role)) continue;
      throw new Error(`Provider did not return required role: ${role}`);
    }
    output[role] = hexFromArgb(scheme.getArgb(dynamicColor));
  }

  return output as MaterialScheme;
}

function expectRequiredRoles(scheme: MaterialScheme): void {
  for (const role of MATERIAL_REQUIRED_COLOR_ROLES) {
    expect(scheme[role]).toEqual(expect.stringMatching(/^#[0-9a-f]{6}$/));
  }
}

function expectNoUnexpectedRoles(scheme: MaterialScheme): void {
  expect(Object.keys(scheme).sort()).toEqual(
    MATERIAL_COLOR_ROLES.filter((role) => scheme[role] !== undefined).sort(),
  );
}

function expectOptionalHexRole(scheme: MaterialScheme, role: MaterialOptionalColorRole): void {
  if (scheme[role] !== undefined) {
    expect(scheme[role]).toEqual(expect.stringMatching(/^#[0-9a-f]{6}$/));
  }
}

function isOptionalRole(role: MaterialColorRole): role is MaterialOptionalColorRole {
  return (MATERIAL_OPTIONAL_COLOR_ROLES as readonly string[]).includes(role);
}
