import type {
  MATERIAL_COLOR_ROLES,
  MATERIAL_OPTIONAL_COLOR_ROLES,
  MATERIAL_REQUIRED_COLOR_ROLES,
  MATERIAL_VARIANTS,
  SUPPORTED_PLATFORMS,
  SUPPORTED_SPEC_VERSIONS,
} from './roles';

export type HexColor = `#${string}`;

export type MaterialVariant = (typeof MATERIAL_VARIANTS)[number];

export type SpecVersion = (typeof SUPPORTED_SPEC_VERSIONS)[number];

export type Platform = (typeof SUPPORTED_PLATFORMS)[number];

export type MaterialColorRole = (typeof MATERIAL_COLOR_ROLES)[number];

export type MaterialRequiredColorRole = (typeof MATERIAL_REQUIRED_COLOR_ROLES)[number];

export type MaterialOptionalColorRole = (typeof MATERIAL_OPTIONAL_COLOR_ROLES)[number];

export type MaterialScheme = {
  readonly [Role in MaterialRequiredColorRole]: HexColor;
} & {
  readonly [Role in MaterialOptionalColorRole]?: HexColor;
};

export interface MaterialSchemes {
  readonly light: MaterialScheme;
  readonly dark: MaterialScheme;
}

export interface CreateSchemesOptions {
  readonly sourceColor: HexColor;
  readonly variant?: MaterialVariant;
  readonly contrastLevel?: number;
  readonly specVersion?: SpecVersion;
  readonly platform?: Platform;
}

export interface ToCssOptions {
  readonly selector: string;
}
