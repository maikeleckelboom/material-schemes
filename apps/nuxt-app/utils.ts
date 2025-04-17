import {type ColorScheme, toHex} from "@chromavert/material";

function colorSchemeModifier(colorScheme: ColorScheme): ColorScheme {
  const result: ColorScheme = {};
  for (const key in colorScheme) {
    if (colorScheme.hasOwnProperty(key)) {
      result[key] = toHex(colorScheme[key]);
    }
  }
  return result;
}
