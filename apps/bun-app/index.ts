import {DynamicColorScheme, getColorsFromPalette} from "@chromavert/material";


function main() {
  const lightScheme = new DynamicColorScheme(0xFF0000)
  const darkScheme = new DynamicColorScheme(0xFF0000, {isDark: true})

  const theme = {
    source: lightScheme.sourceColorArgb,
    variant: lightScheme.variant,
    contrastLevel: lightScheme.contrastLevel,
    schemes: {
      light: lightScheme.toJSON(),
      dark: darkScheme.toJSON(),
    },
    palettes: {
      primary: getColorsFromPalette(lightScheme.primaryPalette),
      secondary: getColorsFromPalette(lightScheme.secondaryPalette),
      tertiary: getColorsFromPalette(lightScheme.tertiaryPalette),
      neutral: getColorsFromPalette(lightScheme.neutralPalette),
      neutralVariant: getColorsFromPalette(lightScheme.neutralVariantPalette),
      error: getColorsFromPalette(lightScheme.errorPalette),
    }
  }

  console.log(theme);
}


main();
