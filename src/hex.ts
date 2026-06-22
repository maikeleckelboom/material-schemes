import { argbFromHex, hexFromArgb } from '../vendor/material-color-utilities/dist/index.js';
import type { HexColor } from './types';

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function normalizeHexColor(value: unknown, label: string): HexColor {
  if (typeof value === 'string' && HEX_COLOR_PATTERN.test(value)) {
    return value.toLowerCase() as HexColor;
  }

  throw new Error(`${label} must be a #RRGGBB hex color.`);
}

export function hexColorToArgb(color: HexColor): number {
  return argbFromHex(color);
}

export function argbToHexColor(argb: number): HexColor {
  return hexFromArgb(argb) as HexColor;
}
