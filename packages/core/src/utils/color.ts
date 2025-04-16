import type {Color} from "../types";

export function isColor(value: any): value is Color {
  return typeof value === 'number' || typeof value === 'string';
}
