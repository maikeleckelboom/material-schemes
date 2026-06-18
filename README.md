# material-schemes

TypeScript utilities for generating Material 3 color schemes, tonal palettes, and CSS variables from source colors.

This package is a library. It is not a UI component library, a portfolio theme system, a Tailwind plugin, or a browser image extraction workflow. Consuming apps should map Material roles such as `primary`, `surface`, and `onSurface` to their own semantic aliases when they need names like `canvas`, `text`, `border`, or `action`.

## Install

```bash
pnpm add material-schemes
```

## Create A Theme

`createTheme` creates paired light and dark DynamicScheme-backed schemes plus core tonal palettes.

```ts
import { ContrastLevel, PaletteStyle, createColorScheme, createTheme } from 'material-schemes';

const theme = createTheme('#6750a4', {
  variant: PaletteStyle.TonalSpot,
  contrastLevel: ContrastLevel.Default,
  specVersion: '2025',
  platform: 'phone',
});

const light = createColorScheme(theme);
const dark = createColorScheme(theme, { dark: true });
```

## Create A Single Scheme

Use `createScheme` when you only need one light or dark scheme.

```ts
import { createColorScheme, createScheme } from 'material-schemes';

const darkScheme = createScheme('#6750a4', {
  isDark: true,
  variant: 'Vibrant',
  specVersion: '2025',
});

const colors = createColorScheme(darkScheme);
```

## CSS Variables

Generate a CSS variable map or serialize it directly.

```ts
import {
  createColorScheme,
  createCssVarMap,
  createCssVariables,
  createTheme,
  serializeCssVarMap,
} from 'material-schemes';

const theme = createTheme('#6750a4');
const colorScheme = createColorScheme(theme);

const vars = createCssVarMap(colorScheme);
const css = serializeCssVarMap(vars, { selector: ':root' });

const sameCss = createCssVariables(colorScheme, ':root');
```

## Palette Tones

Tonal palette helpers expose Material tone values without inventing app-specific tokens.

```ts
import { createPalette, getPaletteColors } from 'material-schemes';

const palette = createPalette('#6750a4');
const tone40 = palette.tone(40);
const selectedTones = getPaletteColors(palette, [0, 40, 100]);
```

`createColorScheme` can include palette tones in its output:

```ts
const schemeWithTones = createColorScheme(theme, {
  paletteTones: [0, 40, 100],
});
```

## Contrast And Variants

The package uses the current DynamicScheme-based API from `@material/material-color-utilities`.

```ts
import { ContrastLevel, PaletteStyle, createTheme } from 'material-schemes';

const expressive = createTheme('#6750a4', {
  variant: PaletteStyle.Expressive,
  contrastLevel: ContrastLevel.High,
  specVersion: '2025',
  platform: 'watch',
});
```

Published `@material/material-color-utilities@0.4.0` supports the 2021 and 2025 spec versions and `phone` or `watch` platforms. It does not publish `SchemeCmf` or a CMF variant, so `material-schemes` rejects `variant: 'cmf'` instead of pretending to support it.

Numeric `contrastLevel` values must be finite numbers from `-1` through `1`, matching the range expected by Material DynamicScheme constructors.

`ContrastLevel.from(value)` is different from raw numeric validation. It maps a number to the closest named helper level: `Reduced`, `Default`, `Medium`, or `High`. Use it for UI presets or config normalization, not when you need to preserve an exact arbitrary numeric contrast value for `createScheme` or `createTheme`.

## Custom Colors

Custom colors are generated as Material-style color groups and can be included in the scheme output.

```ts
const theme = createTheme({
  sourceColor: '#6750a4',
  customColors: [
    {
      name: 'Success Green',
      value: '#2e7d32',
      blend: true,
    },
  ],
});

const colors = createColorScheme(theme, {
  brightnessVariants: true,
});
```

`brightnessVariants` requires a `MaterialTheme` from `createTheme` because it needs both paired light and dark schemes. A single `DynamicColorScheme` from `createScheme` only represents one brightness mode.

## Source Colors

The installed Material package only supports one source color for the published DynamicScheme constructors. `sourceColors` is accepted for forward-compatible API shape, but v0 requires exactly one color and rejects extra source colors.

```ts
const theme = createTheme({
  sourceColors: ['#6750a4'],
});
```

## Public API

Primary exports:

- `createScheme`
- `createTheme`
- `createColorScheme`
- `createPalette`
- `getPaletteColors`
- `createCssVarMap`
- `serializeCssVarMap`
- `createCssVariables`
- `createSchemeCssVariables`
- `MATERIAL_COLOR_ROLES`, `MATERIAL_REQUIRED_COLOR_ROLES`, `MATERIAL_OPTIONAL_COLOR_ROLES`
- `PaletteStyle`, `Variant`, `ContrastLevel`, `ContrastThreshold`
- color and contrast helpers such as `toArgb`, `toHex`, `toHct`, `toRgbaBytes`, `getContrastRatio`, `getTonalContrastDelta`, and `isContrasting`

`toRgbaBytes` returns red, green, blue, and alpha channels as `0..255` byte values. `getTonalContrastDelta` returns the absolute HCT tone difference, not a WCAG contrast ratio.

The package intentionally avoids broad internal re-exports.

## Maintainer Notes

Library runtime support is Node >=18. Maintainer and release checks may require a newer Node runtime with stable direct TypeScript execution, because the consumer smoke runner intentionally stays in TypeScript. Do not add `tsx`, `ts-node`, or another TypeScript runtime dependency for that script; it should remain executable by Node itself.

`tsup.config.ts` intentionally bundles `@material/material-color-utilities` into `dist`. The upstream package is still the implementation source, but its currently published ESM output contains extensionless relative imports that are unsafe for real Node ESM consumers when left external. Keep the bundling workaround until a packed consumer smoke test proves the package works without it.

Public declarations intentionally use local structural types such as `Variant`, `HctColor`, `TonalPalette`, and `DynamicSchemeLike`. That keeps strict consumers from depending on fragile upstream declaration shapes.

`tsconfig.json` keeps `ignoreDeprecations: "6.0"` because tsup declaration generation currently surfaces the deprecated `baseUrl` option during DTS output. This repo does not set `baseUrl`; remove the suppression only after tsup or its declaration-generation dependencies stop surfacing that option.

## Verification

Run release verification from a Node version that supports the maintainer scripts:

```bash
pnpm check
pnpm pack --dry-run
pnpm smoke:consumer
pnpm release:check
```

Before a first npm publish, check package-name availability with npm itself:

```bash
npm view material-schemes name version --json
npm view @chromavert/material-schemes name version --json
```

Treat an npm 404 as a moment-in-time result only. Package availability can change, so repeat the check immediately before publishing and choose the final package name based on that current result.

## Release Policy

Keep the package at `0.0.0` during development and consolidation. Do not treat `0.1.0` as automatic; choose the first public version only when the public API, package name, README examples, generated declarations, bundled output, and consumer behavior are ready to be accepted as a public contract.

Publishing is not just the next checklist step after the commands pass. It is the point where consumers can reasonably start depending on the exported API, package shape, runtime behavior, and documented usage. Make the first public release only when that contract is intentional.
