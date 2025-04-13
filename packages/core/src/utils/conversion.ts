import {argbFromHex, hexFromArgb} from "@material/material-color-utilities";

export function toArgb(color: string | number) {
  if (typeof color === 'number') {
    return color;
  }
  return argbFromHex(color);
}

export function toHex(color: string | number) {
  if (typeof color === 'number') {
    return hexFromArgb(color);
  }
  return color;
}
