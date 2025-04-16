import camelCase from 'camelcase';
import camelcase from 'camelcase';
import kebabCase from 'kebab-case';
import type {KebabCase} from 'type-fest';

/**
 * An interface for formatting options, allowing for optional prefix and suffix.
 */
export interface FormatOptions {
  prefix?: string;
  suffix?: string;
}

/**
 * Formats a token name with optional prefix and suffix, ensuring camelCase output.
 *
 * @param name - The base name of the token.
 * @param options - Optional prefix and suffix to prepend/append to the name.
 * @returns The combined name formatted in camelCase.
 *
 * @example
 * formatTokenName('button', { prefix: 'ui', suffix: 'large' }); // 'uiButtonLarge'
 */
export function formatTokenName(name: string, options: FormatOptions = {}): string {
  const {prefix, suffix} = options;
  return camelCase(`${prefix ? `${prefix}-` : ''}${name}${suffix ? `-${suffix}` : ''}`);
}

/**
 * Interpolates a color name into a pattern string, replacing 'color' (case-insensitive)
 * optionally appending a suffix, and returning the result in camelCase.
 *
 * @param pattern - A template string containing 'color' (case-insensitive) as a placeholder.
 * @param name - The color name to interpolate into the pattern.
 * @param suffix - Optional suffix to append after the replacement.
 * @returns The resulting string formatted in camelCase.
 *
 * @example
 * formatColorToken('onColorContainer', 'primary'); // 'onPrimaryContainer'
 * formatColorToken('colorVariant', 'secondary', 'dark'); // 'secondaryVariantDark'
 */
export function formatColorToken(pattern: string, name: string, suffix?: string): string {
  const formattedName = formatTokenName(name);
  let result = pattern.replace(/color/gi, camelcase(formattedName, {pascalCase: true}));
  if (suffix) {
    result += `-${suffix}`;
  }
  return camelCase(result);
}

/**
 * Formats a string as a CSS custom property name (kebab-case with -- prefix).
 *
 * @param key - The name to convert to CSS variable format.
 * @returns The formatted CSS variable name.
 *
 * @example
 * formatCssVarName('primaryColor'); // '--primary-color'
 */
export function formatCssVarName<T extends string>(key: T) {
  return `--${kebabCase(key)}` as KebabCase<`--${T}`>;
}
