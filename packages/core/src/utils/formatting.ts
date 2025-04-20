import camelCase from 'camelcase';
import camelcase from 'camelcase';
import kebabCase from 'kebab-case';
import type {ColorGroup, CustomColorGroup} from "@material/material-color-utilities";

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
export function formatTokenName(name: string, options?: { prefix?: string; suffix?: string; }): string {
  const {prefix, suffix} = options || {};
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
 * Formats a CSS variable name, ensuring it starts with '--' and is in kebab-case.
 *
 * @param key - The base name of the CSS variable.
 * @returns The formatted CSS variable name in kebab-case.
 *
 * @example
 * formatCssVarName('myVariable'); // '--my-variable'
 * formatCssVarName('--myVariable'); // '--myVariable'
 */
export function formatCssVarName<T extends string>(key: T) {
  return key.startsWith('--') ? key : `--${kebabCase(key)}`;
}


/**
 * Formats a given color group by modifying its keys using the provided color name.
 *
 * @param {ColorGroup} colorGroup - The input object containing color-related key-value pairs.
 * @param {string} colorName - The name of the color used to modify the keys in the color group.
 * @return {Record<string, number>} A new object where the keys are formatted based on the color name, and the values remain unchanged.
 */
export function formatColorGroup(colorGroup: ColorGroup, colorName: string): Record<string, number> {
  return Object.keys(colorGroup).reduce((acc, key) => {
    const colorKey = formatColorToken(key, colorName);
    acc[colorKey] = colorGroup[key as keyof ColorGroup];
    return acc;
  }, {} as Record<string, number>);
}


/**
 * Formats a custom color object containing name, light, and dark color groups.
 *
 * @param {CustomColorGroup} customColor - The custom color group object including color, light, and dark properties.
 * @return {Object} An object containing the formatted name, color, light, and dark color groups.
 */
export function formatCustomColorGroup(customColor: CustomColorGroup) {
  return {
    name: formatTokenName(customColor.color.name),
    color: customColor.color,
    light: formatColorGroup(customColor.light, customColor.color.name),
    dark: formatColorGroup(customColor.dark, customColor.color.name),
  };
}
