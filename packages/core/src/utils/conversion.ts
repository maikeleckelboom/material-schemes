import {argbFromHex, Hct, hexFromArgb} from "@material/material-color-utilities";
import type {Color} from "../types";

export function toArgb(color: Color) {
  if (typeof color === 'number') {
    return color;
  }
  return argbFromHex(color);
}

export function toHex(color: Color) {
  if (typeof color === 'number') {
    return hexFromArgb(color);
  }
  return color;
}

export function toHct(color: Color): Hct {
  const argb = toArgb(color);
  return Hct.fromInt(argb);
}
