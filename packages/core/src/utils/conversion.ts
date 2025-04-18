import {argbFromHex, Hct, hexFromArgb} from "@material/material-color-utilities";
import type {Color} from "../types";

export function toArgb(color: Color) {
  if (typeof color === 'number') return color;
  return argbFromHex(color);
}

export function toHex(color: Color) {
  return hexFromArgb(toArgb(color));
}

export function toHct(color: Color): Hct {
  return Hct.fromInt(toArgb(color));
}
