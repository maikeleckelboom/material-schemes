import camelCase from 'camelcase';
import camelcase from 'camelcase';
import kebabCase from 'kebab-case';
import type {KebabCase} from 'type-fest';
import type {ColorGroup, CustomColor, CustomColorGroup} from "@material/material-color-utilities";

/**
 * An interface for formatting options, allowing for optional prefix and suffix.
 */
export interface TokenFormatterOptions {
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
export function formatTokenName(name: string, options: TokenFormatterOptions = {}): string {
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
 *
 * @example
 * formatCssVarName('primaryColor'); // '--primary-color'
 */
export function formatCssVarName<T extends string>(key: T) {
  return `--${kebabCase(key)}` as KebabCase<`--${T}`>;
}


export function formatColorGroup(colorGroup: ColorGroup, colorName: string): Record<string, number> {
  return Object.keys(colorGroup).reduce((acc, key) => {
    const colorKey = formatColorToken(key, colorName);
    acc[colorKey] = colorGroup[key as keyof ColorGroup];
    return acc;
  }, {} as Record<string, number>);
}
  

export function formatCustomColor(customColor: CustomColorGroup) {
  return {
    name: formatTokenName(customColor.color.name),
    color: customColor.color,
    light: formatColorGroup(customColor.light, customColor.color.name),
    dark: formatColorGroup(customColor.dark, customColor.color.name),
  };
}
