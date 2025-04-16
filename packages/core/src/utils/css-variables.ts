import {formatCssVarName, toHex} from '../utils';
import type {Color, ColorScheme} from "../types";

/**
 * Creates a mapping of CSS variable names to hex color entries from a color scheme.
 *
 * @param colorScheme - An object mapping keys to color entries
 * @returns A record of `--kebab-case-name` to hex value
 *
 * @example
 * createCssVarMap({ Primary: 0xFF0000 })
 * // → { '--primary': '#ff0000' }
 */
export function createCssVarMap<T extends Record<string, Color>>(
  colorScheme: T,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(colorScheme).map(([key, value]) => [
      formatCssVarName(key),
      toHex(value),
    ]),
  );
}

/**
 * Converts a mapping of CSS variables to a CSS string.
 *
 * @param mapping - A record of CSS variable names to entries
 * @param selector - Optional selector to wrap the vars in
 * @returns A CSS string (with or without selector)
 *
 * @example
 * serializeCssVarMap({ '--primary': '#ff0000' })
 * // → "--primary: #ff0000;"
 *
 * @example
 * serializeCssVarMap({ '--primary': '#ff0000' }, ':root')
 * // → ":root { --primary: #ff0000; }"
 */
export function serializeCssVarMap(
  mapping: Record<string, string>,
  selector?: string,
): string {
  const cssVars = Object.entries(mapping)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ');
  return selector ? `${selector} { ${cssVars} }` : cssVars;
}

/**
 * Generates a CSS string defining CSS variables based on the provided color scheme.
 *
 * @param colorScheme - An object representing the color scheme.
 * @param selector - The CSS selector to which the variables should be applied (default is ':root').
 * @returns A string containing the CSS variable definitions.
 */
export function toCssVariables(colorScheme: ColorScheme, selector?: string): string {
  const cssVarMapping = createCssVarMap(colorScheme);
  return serializeCssVarMap(cssVarMapping, selector);
}
