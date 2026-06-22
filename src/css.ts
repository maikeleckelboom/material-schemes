import { normalizeHexColor } from './hex';
import { MATERIAL_COLOR_ROLES, MATERIAL_REQUIRED_COLOR_ROLES } from './roles';
import type { MaterialColorRole, MaterialScheme, ToCssOptions } from './types';

const ROLE_SET = new Set<string>(MATERIAL_COLOR_ROLES);

export function toCss(scheme: MaterialScheme, options: ToCssOptions): string {
  const selector = resolveSelector(options);
  assertExactMaterialScheme(scheme);

  const declarations = MATERIAL_COLOR_ROLES.flatMap((role) => {
    const value = scheme[role];
    if (value === undefined) return [];
    return `  ${toMaterialCssVariableName(role)}: ${normalizeHexColor(value, role)};`;
  });

  return `${selector} {\n${declarations.join('\n')}\n}`;
}

function resolveSelector(options: ToCssOptions): string {
  if (typeof options.selector === 'string' && options.selector.trim().length > 0) {
    return options.selector;
  }

  throw new Error('toCss requires a non-empty selector.');
}

function assertExactMaterialScheme(scheme: MaterialScheme): void {
  const keys = Object.keys(scheme);

  for (const role of MATERIAL_REQUIRED_COLOR_ROLES) {
    if (scheme[role] === undefined) {
      throw new Error(`Material scheme is missing required role: ${role}`);
    }
  }

  for (const key of keys) {
    if (!ROLE_SET.has(key)) {
      throw new Error(`Material scheme contains an unsupported role: ${key}`);
    }

    normalizeHexColor(scheme[key as MaterialColorRole], key);
  }
}

function toMaterialCssVariableName(role: MaterialColorRole): `--md-sys-color-${string}` {
  return `--md-sys-color-${toKebabCase(role)}`;
}

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
