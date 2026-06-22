# material-schemes

A runtime-neutral TypeScript boundary for converting one Material source color into paired light and dark role maps and Material system CSS custom properties.

This package is not a UI component library, semantic token system, Tailwind integration, React hook, DOM mutator, image extraction workflow, or low-level color-science toolkit. Consuming apps should map Material roles such as `primary`, `surface`, and `onSurface` to their own semantic aliases when they need names like `canvas`, `text`, `border`, or `action`.

## Install

```bash
pnpm add material-schemes
```

## Usage

```ts
import { createSchemes, toCss } from 'material-schemes';

const schemes = createSchemes({
  sourceColor: '#6750a4',
  variant: 'tonal-spot',
  contrastLevel: 0,
  specVersion: '2026',
  platform: 'phone',
});

schemes.light.primary; // "#6750a4"
schemes.dark.onSurface; // "#e6e0e9"

const css = toCss(schemes.light, {
  selector: ':root',
});
```

`toCss` emits Material system color variables:

```css
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
}
```

## API

```ts
export type HexColor = `#${string}`;

export type MaterialVariant =
  | 'monochrome'
  | 'neutral'
  | 'tonal-spot'
  | 'vibrant'
  | 'expressive'
  | 'fidelity'
  | 'content'
  | 'rainbow'
  | 'fruit-salad';

export interface CreateSchemesOptions {
  readonly sourceColor: HexColor;
  readonly variant?: MaterialVariant;
  readonly contrastLevel?: number;
  readonly specVersion?: '2021' | '2025' | '2026';
  readonly platform?: 'phone' | 'watch';
}

export interface MaterialSchemes {
  readonly light: MaterialScheme;
  readonly dark: MaterialScheme;
}

export function createSchemes(options: CreateSchemesOptions): MaterialSchemes;

export function toCss(scheme: MaterialScheme, options: { readonly selector: string }): string;
```

## Supported Options

`sourceColor` is required and must be exactly `#RRGGBB`. Values are canonicalized to lowercase `#rrggbb`. Alpha colors, ARGB numbers, HCT objects, arbitrary strings, `sourceColors`, palette overrides, custom colors, and CMF are intentionally outside this first public contract.

`variant` accepts only kebab-case Material variant names. Aliases such as `TonalSpot`, `tonalSpot`, numeric variants, classes, and CMF are rejected.

`contrastLevel` must be a finite number from `-1` through `1`.

`specVersion` supports `2021`, `2025`, and `2026`. `platform` supports `phone` and `watch`.

## Package Guarantees

- Runtime-neutral output: no DOM, framework, browser image APIs, workers, or global side effects.
- ESM and CommonJS entry points.
- Lowercase hex role values.
- Fixed Material CSS names using `--md-sys-color-*`.
- Packed-consumer verification for ESM, CommonJS, and strict TypeScript consumers.
- Zero runtime dependencies in the published package.

## Why Not Use Material Color Utilities Directly?

Use Material Color Utilities directly when you need HCT, CAM16, blending, quantization, image extraction, tonal palette manipulation, custom color algorithms, or low-level dynamic-color machinery.

Use this package when you want the small application boundary: one source color in, paired Material role maps and CSS out.

## Provider Policy

The package currently bundles generated local vendor sources from the official `material-foundation/material-color-utilities` repository. The vendor folder is created by `pnpm vendor:mcu`, lives at `vendor/material-color-utilities/`, and is excluded from git.

Provider updates are release decisions. Regenerate conformance fixtures, review role output diffs, keep third-party notices current, and run the packed-consumer release gate after refreshing the official vendor source.

## Verification

Run release verification from a Node version that supports the maintainer scripts:

```bash
pnpm check
pnpm pack --dry-run
pnpm package:check
pnpm smoke:consumer
pnpm release:check
```

`pnpm verify:release` runs the stronger clean-copy release check and is the preferred reproducibility proof before publishing.

## Release Policy

Keep the package at `0.0.0` during development and consolidation. Do not treat `0.1.0` as automatic; choose the first public version only when the public API, package name, README examples, generated declarations, bundled output, third-party notices, and consumer behavior are ready to be accepted as a public contract.

Publishing is not just the next checklist step after the commands pass. It is the point where consumers can reasonably start depending on the exported API, package shape, runtime behavior, and documented usage. Make the first public release only when that contract is intentional.
