import {argbFromHex, Hct, hexFromArgb} from "@material/material-color-utilities";
import type {Color} from "../types";

export function toArgb(color: Color) {
  if (typeof color === 'number') return color;
  if (color instanceof Hct) return color.toInt()
  return argbFromHex(color);
}

export function toHex(color: Color) {
  return hexFromArgb(toArgb(color));
}

export function toHct(color: Color): Hct {
  if (color instanceof Hct) {
    return color;
  }
  const argb = toArgb(color);
  return Hct.fromInt(argb);
}
