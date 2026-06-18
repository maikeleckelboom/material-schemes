import { formatCssVarName, toHex } from './color';
import type { Color, CssVarMap, CssVarMapOptions, SerializeCssVarMapOptions } from './types';

export type CreateCssVariablesOptions = CssVarMapOptions & SerializeCssVarMapOptions;

export function createCssVarMap<T extends Record<string, Color>>(
  colorScheme: T,
  options: CssVarMapOptions = {},
): CssVarMap {
  return Object.fromEntries(
    Object.entries(colorScheme).map(([key, value]) => [
      formatCssVarName(key, options),
      typeof value === 'string' && value.startsWith('var(') ? value : toHex(value),
    ]),
  ) as CssVarMap;
}

export function serializeCssVarMap(
  mapping: Record<`--${string}`, string>,
  options?: string | SerializeCssVarMapOptions,
): string {
  const { selector, minify = false } = normalizeSerializeOptions(options);
  const declarations = Object.entries(mapping).map(([name, value]) => `${name}: ${value};`);

  if (!selector) return minify ? declarations.join(' ') : declarations.join('\n');

  if (minify) return `${selector}{${declarations.join(' ')}}`;

  return `${selector} {\n${declarations.map((line) => `  ${line}`).join('\n')}\n}`;
}

export function createCssVariables<T extends Record<string, Color>>(
  colorScheme: T,
  options: CreateCssVariablesOptions | string = {},
): string {
  const normalizedOptions = normalizeCreateOptions(options);
  return serializeCssVarMap(createCssVarMap(colorScheme, normalizedOptions), normalizedOptions);
}

export const createSchemeCssVariables = createCssVariables;

function normalizeSerializeOptions(
  options?: string | SerializeCssVarMapOptions,
): SerializeCssVarMapOptions {
  return typeof options === 'string' ? { selector: options } : (options ?? {});
}

function normalizeCreateOptions(
  options: CreateCssVariablesOptions | string,
): CreateCssVariablesOptions {
  return typeof options === 'string' ? { selector: options } : options;
}
