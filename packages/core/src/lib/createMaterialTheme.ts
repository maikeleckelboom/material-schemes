import type {MaterialThemeOptions} from "../types";
import {MaterialTheme} from "../theme";

export function createMaterialTheme(opts: MaterialThemeOptions) {
  return new MaterialTheme(opts);
}

const t = createMaterialTheme({
  sourceColor: '#88ff85',
  style: 'TonalSpot',
  contrastLevel: 0.5,
  customColors: [
    {name: 'custom1', value: '#FF4081'},
    {name: 'custom2', value: '#FF4081', blend: true}
  ]
})


console.log(
  t.schemes.light.toColorScheme({
    paletteTones: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
    modifyColorScheme: (scheme) => ({
      ...scheme,
      custom1: '#FF4081',
      custom2: '#FF4081'
    }),
  })
)

t.toColorScheme({
  dark: true,
  brightnessVariants: true,
  paletteTones: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
  modifyColorScheme: (scheme) => ({
    ...scheme,
    custom1: 0xFF4081,
    custom2: 0xFF4081
  })
})
