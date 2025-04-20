import type {Color} from "../types";
import {Hct} from "@material/material-color-utilities";

export function isColor(value: any): value is Color {
  return typeof value === 'number' || typeof value === 'string';
}
