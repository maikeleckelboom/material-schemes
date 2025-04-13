import type {Color} from "../theme/DynamicColorScheme.ts";
import type {StaticColor} from "../theme/Theme.ts";
import {customColor, type CustomColorGroup} from "@material/material-color-utilities";
import {toArgb} from "./conversion.ts";

export function createCustomColor(source: Color, staticColor: StaticColor): CustomColorGroup {
  return customColor(source, {
    name: staticColor.name,
    value: toArgb(staticColor.value),
    blend: !!staticColor.blend,
  })
}
