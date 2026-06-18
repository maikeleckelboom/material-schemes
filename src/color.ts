import {
  argbFromHex,
  Blend,
  DislikeAnalyzer,
  Hct as MaterialHct,
  hexFromArgb,
} from '@material/material-color-utilities';
import type { Color, HctColor } from './types';

export interface RgbaBytesColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function isColor(value: unknown): value is Color {
  return typeof value === 'number' || typeof value === 'string';
}

export function toArgb(color: Color): number {
  return typeof color === 'number' ? color : argbFromHex(color);
}

export function toHex(color: Color): string {
  return hexFromArgb(toArgb(color));
}

export function toRgbaBytes(color: Color): RgbaBytesColor {
  const argb = toArgb(color);
  return {
    a: (argb >>> 24) & 0xff,
    r: (argb >>> 16) & 0xff,
    g: (argb >>> 8) & 0xff,
    b: argb & 0xff,
  };
}

export function toHct(color: Color): HctColor {
  return toMaterialHct(color);
}

export function harmonize(designColor: Color, sourceColor: Color): number {
  return Blend.harmonize(toArgb(designColor), toArgb(sourceColor));
}

export function blendHue(from: Color, to: Color, amount: number): number {
  return Blend.hctHue(toArgb(from), toArgb(to), clampUnit(amount));
}

export function blendCam(from: Color, to: Color, amount: number): number {
  return Blend.cam16Ucs(toArgb(from), toArgb(to), clampUnit(amount));
}

export function isDisliked(color: Color): boolean {
  return DislikeAnalyzer.isDisliked(toMaterialHct(color));
}

export function fixIfDisliked(color: Color): number {
  return DislikeAnalyzer.fixIfDisliked(toMaterialHct(color)).toInt();
}

export function toMaterialHct(color: Color): MaterialHct {
  return MaterialHct.fromInt(toArgb(color));
}

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function splitWords(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function capitalize(value: string): string {
  return value.length === 0 ? value : `${value[0]?.toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function toCamelCase(value: string): string {
  const [first, ...rest] = splitWords(value);
  if (!first) return '';
  return `${first.toLowerCase()}${rest.map(capitalize).join('')}`;
}

function toPascalCase(value: string): string {
  return splitWords(value).map(capitalize).join('');
}

export function formatTokenName(
  name: string,
  options: { prefix?: string; suffix?: string | number } = {},
): string {
  return toCamelCase(
    [options.prefix, name, options.suffix == null ? undefined : String(options.suffix)]
      .filter(Boolean)
      .join(' '),
  );
}

export function formatColorToken(pattern: string, name: string, suffix?: string): string {
  const interpolated = pattern.replace(/color/gi, toPascalCase(name));
  return formatTokenName(interpolated, suffix === undefined ? {} : { suffix });
}

export function formatCssVarName(key: string, options: { prefix?: string } = {}): `--${string}` {
  if (key.startsWith('--')) return key as `--${string}`;
  const formatted = formatTokenName(
    key,
    options.prefix === undefined ? {} : { prefix: options.prefix },
  );
  const kebab = splitWords(formatted).join('-').toLowerCase();
  return `--${kebab}`;
}
