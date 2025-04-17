import {customColor, type CustomColorGroup} from "@material/material-color-utilities";
import {toArgb} from "./conversion.ts";
import type {Color, StaticColor} from "../types";

export function createCustomColorGroup(source: Color, staticColor: StaticColor): CustomColorGroup {
  return customColor(toArgb(source), {
    name: staticColor.name,
    value: toArgb(staticColor.value),
    blend: !!staticColor.blend,
  })
}
