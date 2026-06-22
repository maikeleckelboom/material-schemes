# Verdict — 22 June 2026

**Do not publish the current API. Do preserve most of the engineering underneath it.**

My blunt assessment:

| Dimension                 | Assessment |
| ------------------------- | ---------: |
| Engineering artifact      |   **8/10** |
| Packaging discipline      |   **9/10** |
| Current API coherence     |   **5/10** |
| Differentiation today     |   **6/10** |
| Publish readiness         |   **5/10** |
| Potential after reduction |   **9/10** |

The repository is clearly competent. It contains more release discipline than most libraries in this niche. But the public API is trying to be a theme model, scheme wrapper, palette library, color utility library, contrast utility library, CSS serializer, compatibility layer, and forward-compatibility experiment simultaneously.

That breadth does not make it more useful. It makes it harder to trust.

The package can become the strongest option in one defensible category:

> **A minimal, runtime-neutral TypeScript boundary that converts one Material source color into current, fully typed, serializable light and dark role maps—and standards-named CSS custom properties—without DOM, framework, image-processing, or upstream implementation leakage.**

I did not execute the repository locally, so this is a static source, API, packaging, and ecosystem audit. I am crediting the quality of the included verification machinery, not claiming that every command currently passes.

## Where it sits in the ecosystem

### Official Material Color Utilities

The official package is the algorithmic authority. It exposes HCT, blending, quantization, palettes, scoring, dynamic colors, schemes, contrast utilities, image utilities, and more. That is appropriate for an algorithm toolkit, but it is not an intentionally small application-facing API. Its older `themeFromSourceColor` utility constructs legacy static schemes and its `applyTheme` helper mutates an `HTMLElement`, making it a poor generic serialization boundary.

The official GitHub project remains the dominant source repository, but it does not use GitHub releases and its npm publication cadence has historically lagged source development. ([GitHub][1])

**Use it directly when:** you need the color science, quantization, image extraction, or low-level dynamic-color machinery.

**Your opportunity:** provide the small, stable application boundary that it intentionally does not.

### `@poupe/material-color-utilities`

This is currently the strongest low-level provider alternative. It exists specifically to publish current TypeScript builds and repair strict ESM import paths. Its May 2026 releases include the 2026 color spec, CMF, and multi-source colors; the signed `0.4.1` release was published with npm provenance. ([GitHub][2])

Its repository explicitly says that it does not alter functional behavior: it handles packaging, import repairs, and CI. The current source exposes `2021`, `2025`, and `2026` specifications, supports HCT arrays in scheme constructors, and includes the CMF variant.

**This package invalidates one possible positioning for `material-schemes`:** you cannot sell it merely as “Material Color Utilities, but packaged correctly.” Poupe already does that more directly.

**Your opportunity:** use it as an exact-pinned, internal algorithm provider and expose a dramatically better consumer API.

### `mcu-extra`

This is the closest conceptual wrapper I found. It adds theme generation and DOM application, but its package remains tied to `@material/material-color-utilities ^0.2.7`, is ESM-only, and exposes browser-oriented `applyTheme` behavior that writes into an element’s style.

Its GitHub repository has modest activity and adoption signals, but it is not a current Material Dynamic Color reference implementation. ([GitHub][3])

Your implementation already beats it on:

- Current DynamicScheme usage.
- Runtime neutrality.
- Node consumption.
- ESM and CommonJS packaging.
- Packed-consumer verification.
- Deterministic CSS text rather than DOM mutation.

It beats your current package only by having a smaller conceptual surface.

### `use-material-you`

This is a current React-oriented package. It exposes a hook and generator, depends on React 19, accepts URLs and images, accesses browser capabilities such as `window`, `document`, `fetch`, `createImageBitmap`, and workers, and returns a simplified hex scheme.

It is useful for a different job. Do not compete with it by adding React hooks, dominant-color extraction, image loaders, or workers.

Your package should beat it on:

- Synchronous determinism.
- Framework independence.
- Server and build-tool use.
- Exact input validation.
- Exact output typing.
- Stable CSS serialization.

### Ecosystem conclusion

I did not find a dominant, current, generic wrapper whose contract is simply:

```text
source color → paired plain role maps → CSS
```

That niche is small, but real. Your code can own it.

The present implementation is already more rigorous than most adjacent wrappers, but **it is not yet more useful** because too much of the underlying machinery has escaped into the public contract.

# What is already genuinely good

## 1. The packaging problem you solved is real

Your README explains that MCU is bundled because its published ESM contains extensionless relative imports that are unsafe in strict Node ESM consumption.

The Poupe fork independently documents and fixes precisely those import problems across the upstream source.

So this is not invented complexity. It is a legitimate interoperability problem.

## 2. Packed-consumer testing is excellent

The repository contains a smoke flow that packs the actual tarball, installs it into a temporary consumer, and exercises ESM, CommonJS, and strict TypeScript consumption. That is considerably more valuable than another hundred unit tests against source modules.

The release-verification script also operates from a clean copied worktree with a frozen install rather than assuming the maintainer’s current checkout is representative.

Preserve this.

## 3. The non-goals are correct

The README correctly rejects becoming a UI library, semantic application-token system, Tailwind integration, or image-extraction workflow.

That boundary is good. The API simply has not yet followed it far enough.

## 4. Explicit role extraction is preferable to uncontrolled re-exporting

The manual role manifest and structural types are defensible. They let you choose an application-facing contract instead of exporting every upstream class.

The mistake is not that you built an abstraction. The mistake is that your abstraction still exposes too much upstream-shaped state.

# Publish-blocking findings

## 1. `primary` has two incompatible meanings

This is the most serious API flaw.

`SchemeOptions` allows `primary` to act as the required source color, while `SchemeOptionsBase.primary` simultaneously represents a primary-palette override. ([GitHub][4])

The constructor:

1. Reads `primary` as an override.
2. Resolves the source as `sourceColor ?? primary`.
3. Generates the selected variant from that source.
4. Replaces the generated primary palette using that same `primary` value.

([GitHub][5]) ([GitHub][5])

Therefore:

```ts
createScheme({
  primary: '#6750a4',
  variant: 'neutral',
});
```

does not merely mean “use this seed because `sourceColor` was omitted.” It also overrides the neutral variant’s generated primary palette with a new palette constructed directly from the seed.

That is a semantic correctness defect, not merely imperfect naming.

**Required change:** `sourceColor` must be required. Palette overrides, should they survive at all, must be nested and unambiguous:

```ts
{
  sourceColor: '#6750a4',
  paletteOverrides: {
    primary: '#ff0000',
  },
}
```

My stronger recommendation is to remove palette overrides from the first public release.

## 2. Custom-color collisions silently overwrite Material roles

The theme conversion first spreads standard roles and then spreads generated custom-color roles. ([GitHub][5])

A custom color named `primary` generates keys such as:

```text
primary
onPrimary
primaryContainer
onPrimaryContainer
```

Those overwrite the actual Material roles without an error. Other normalization-equivalent names—such as `Foo Bar`, `foo-bar`, and `foo_bar`—can also converge onto the same key. Palette-tone insertion uses further unguarded `Object.assign` operations. ([GitHub][5])

That is silent data corruption.

**Required change:** remove custom colors from the flattened namespace. If they return later, they need an isolated structure:

```ts
{
  schemes: { light, dark },
  custom: {
    success: {
      light: { color, onColor, container, onContainer },
      dark: { color, onColor, container, onContainer },
    },
  },
}
```

No user-controlled name should ever be flattened into the standard Material role namespace.

## 3. Custom colors do not participate in the dynamic contrast contract

Built-in roles are generated through DynamicScheme using the requested contrast level, specification version, platform, and variant.

Custom colors are generated using fixed legacy tones:

- Light: `40 / 100 / 90 / 10`
- Dark: `80 / 20 / 30 / 90`

The custom-color function does not receive the theme’s contrast level, specification, platform, or variant.

Consequently, at a non-default contrast level, built-in roles and custom roles do not represent the same accessibility contract.

**Required change:** remove custom colors from v1. Reintroduce them only once their semantics are explicit and tested. “The old MCU helper did this” is not a sufficient contract for a new wrapper.

## 4. The API exposes capabilities that intentionally fail

The README advertises `sourceColors` as a forward-compatible shape while rejecting anything other than exactly one source. It also documents CMF rejection and only the 2021/2025 specifications.

Meanwhile, a publicly released current provider already supports:

- 2026.
- CMF.
- Multiple source colors.

([GitHub][2])

A speculative option that throws is worse than not exposing the option. It increases the API contract without adding a usable capability.

Choose one:

- Support only one source and remove `sourceColors` and CMF entirely.
- Adopt the current provider and implement multi-source behavior completely.

For the minimal library, I recommend the first option. Single-source generation is a coherent product boundary.

## 5. The facade still leaks upstream semantics

`DynamicSchemeLike` publicly contains:

- `sourceColorHct`.
- Palette objects.
- A `colors` factory registry.
- `getArgb`.
- `getHct`.
- Numeric upstream variants.
- Upstream-shaped scheme state.

([GitHub][4])

That is nominal insulation, not semantic insulation. A consumer can still build against the details you intended to hide.

There is also a mutable `sourceColorHct` property on `DynamicColorScheme`, while the internal delegate has already been constructed. Reassigning the public field cannot reconfigure the delegate, leaving the wrapper capable of representing contradictory state. ([GitHub][5])

**Required change:** do not expose the scheme class. Convert provider results immediately into plain role maps.

## 6. The public surface is much too large

The README presents at least:

- Three generation stages.
- Palette helpers.
- Three CSS pathways plus an alias.
- Two variant representations.
- Two contrast classes.
- Role constants.
- Color conversion helpers.
- Contrast helpers.

There are multiple redundant forms:

- `createTheme` and `new MaterialTheme`.
- `createScheme` and `new DynamicColorScheme`.
- `variant` and `style`.
- `PaletteStyle` and numeric `Variant`.
- `toCssVariables` and `toCssVars`.
- `createCssVariables` and `createSchemeCssVariables`.
- PascalCase, camelCase, kebab-case, class instances, and numeric variants.

The accepted variant type alone permits four representations.

This is not ergonomic flexibility. It is a normalization burden that every release must preserve and every maintainer must test.

Because there are no published releases or packages, there is no compatibility justification for keeping any of it. ([GitHub][6])

## 7. `Color = string | number` is too weak for a perfectionist API

`isColor` accepts every string and every number, and `toArgb` forwards numeric values unchanged. That includes `NaN`, infinities, negative values, values above 32 bits, and arbitrary strings until upstream parsing fails.

A wrapper that claims a safer application boundary must validate more strictly than its provider.

For the narrow public API, accept one form:

```ts
type HexColor = `#${string}`;
```

Then validate at runtime against exactly `#RRGGBB`, canonicalize to lowercase, and reject alpha rather than silently inventing alpha semantics.

ARGB numbers and HCT values can remain available from the official low-level provider.

## 8. The CSS API has avoidable ambiguity

`createCssVariables` returns serialized CSS text, not a variable map. `createSchemeCssVariables` is an exact alias. The `minify` option still emits whitespace between declarations, so it is not meaningfully a minifier.

More importantly, the serializer accepts arbitrary records and normalizes arbitrary keys. That recreates the collision problem at the CSS layer.

**Required change:** serialize only your exact `MaterialScheme` type. Remove `minify`; production CSS tooling already solves that problem.

## 9. Bundling requires a deliberate dependency and licensing policy

Bundling is defensible, especially if retaining CommonJS support. But a bundled provider should normally be:

- Exact-pinned.
- A build dependency rather than an unused installed runtime dependency.
- Covered by explicit third-party license attribution.
- Verified in the packed artifact.
- Upgraded only through a reviewed release that regenerates conformance fixtures.

The wrapper is MIT-licensed while the bundled MCU implementation is Apache-2.0. That combination is possible, but the distributed package must retain the applicable Apache license and notices. Do not assume the bundler has done this correctly.

# The minimal public API I recommend

```ts
import { createSchemes, toCss } from '@scope/material-schemes';

const schemes = createSchemes({
  sourceColor: '#6750a4',
  variant: 'tonal-spot',
  contrastLevel: 0,
  specVersion: '2026',
  platform: 'phone',
});

schemes.light.primary; // HexColor
schemes.dark.onSurface; // HexColor

const css = toCss(schemes.light, {
  selector: ':root',
});
```

Conceptually:

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

## Deliberate API decisions

### One object argument

No positional overload plus object overload. One form means one documentation path, one validation path, and one contract.

### Always return light and dark

Generating both is cheap, and paired output eliminates:

- `createTheme` versus `createScheme`.
- `dark` versus `isDark`.
- `brightnessVariants`.
- Flattened `primaryLight` and `primaryDark` keys.
- Runtime type branching based on source shape.

### Return canonical hex values

The package’s unique value is application-ready serialization, not ARGB arithmetic. Return lowercase `#rrggbb` values.

Anyone performing HCT, CAM16, blending, quantization, or tonal manipulation should use MCU directly.

### One canonical variant spelling

Use kebab-case only. No classes, enum numbers, case-insensitive normalization, or aliases.

Invalid input should fail clearly:

```text
Invalid variant "TonalSpot". Expected "tonal-spot".
```

That is better than accepting everything indefinitely.

### Use Material’s domain terminology

Keep:

- `sourceColor`
- `variant`
- `contrastLevel`
- `specVersion`
- `platform`

Do not shorten `contrastLevel` to `contrast` merely to save characters. It is the upstream and Material domain term.

### Fixed Material CSS naming

`toCss` should emit:

```css
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
}
```

Do not add a configurable prefix until a real user demonstrates the need. The package emits Material system roles; the Material system prefix is the correct default contract.

Application semantic aliases remain the consumer’s responsibility, exactly as the current README already states.

# What to delete from the public root

| Current                                | Decision                                 |
| -------------------------------------- | ---------------------------------------- |
| `createTheme`                          | Replace with `createSchemes`             |
| `createScheme`                         | Delete                                   |
| `createColorScheme`                    | Delete                                   |
| `MaterialTheme`                        | Delete from public API                   |
| `DynamicColorScheme`                   | Delete from public API                   |
| `PaletteStyle`                         | Delete                                   |
| numeric `Variant`                      | Delete                                   |
| `style` option                         | Delete                                   |
| `primary` source fallback              | Delete                                   |
| `sourceColors`                         | Delete until implemented                 |
| palette overrides                      | Delete from v1                           |
| custom colors                          | Delete from v1                           |
| `brightnessVariants`                   | Delete; output is already nested         |
| `paletteTones`                         | Delete                                   |
| `modifyColorScheme`                    | Delete; callers can transform plain data |
| `createPalette` and `getPaletteColors` | Use MCU directly                         |
| color helpers                          | Use MCU directly                         |
| contrast helpers/classes               | Use MCU directly                         |
| CSS aliases and `minify`               | Delete                                   |
| `DynamicSchemeLike`                    | Internal only                            |
| arbitrary scheme index signature       | Delete                                   |

This is not throwing away the project. It is exposing the small part of the project that deserves to become a public commitment.

# Provider recommendation

Use the current signed `@poupe/material-color-utilities` release as an **exact-pinned internal build dependency**, at least until the official npm package catches up.

Why:

- It is sourced from the official implementation.
- It fixes the strict ESM paths you currently solve through bundling.
- It exposes the 2026 algorithm and associated corrections.
- It publishes with provenance.
- Its release notes clearly enumerate upstream and fork changes. ([GitHub][2])

Continue bundling if you retain CommonJS support. Then publish a zero-runtime-dependency package and include third-party notices.

The rendered npm page I retrieved showed stale metadata compared with the signed `0.4.1` GitHub release, so verify the registry directly with `npm view` before pinning. ([npm][7])

# Tests that make the narrow package genuinely best-in-class

Do not add features. Add guarantees.

1. **Provider conformance matrix:** every supported variant × spec version × platform × light/dark mode, across several seeds and contrast levels. Compare every exported role directly with the pinned provider.

2. **Exact key-set tests:** assert required and optional role names. No missing roles, unexpected roles, or arbitrary index signature.

3. **Golden fixtures:** retain a small set of canonical outputs. An upstream upgrade that changes colors must produce a deliberate fixture diff and package release.

4. **Boundary tests:** invalid hex, alpha input, non-finite contrast, out-of-range contrast, unknown variant/spec/platform.

5. **Package tests:** retain the existing packed ESM, CommonJS, and strict-TypeScript consumer flow.

6. **Publication checks:** add `publint`, `@arethetypeswrong/cli`, packed-file assertions, provenance, and a check that third-party notices are present.

This testing strategy would be more valuable than exposing twenty additional helpers.

# README and portfolio presentation

The current README reads partly as public documentation and partly as a maintainer notebook. Move bundler rationale, TypeScript deprecation workarounds, release mechanics, and provider-upgrade policy into `CONTRIBUTING.md` or a short architecture decision record.

The public README should contain:

1. One sentence describing the narrow problem.
2. One complete example.
3. The supported variants/specifications/platforms.
4. The exact runtime/package-format guarantees.
5. A short “Why not use MCU directly?” section.
6. Explicit non-goals.
7. The provider and update policy.

The GitHub repository currently has no About description, website, topics, release, or package entry. Correct that before placing it prominently in a portfolio. ([GitHub][6])

A strong portfolio description would be:

> Designed a stable, runtime-neutral TypeScript boundary over Material Dynamic Color. Reduced a provider-shaped facade to two public operations, exact-pinned and bundled the algorithm implementation, generated canonical role maps and CSS custom properties, and verified the packed package in ESM, CommonJS, and strict TypeScript consumers.

Do not lead with “written before useful AI.” That is biographical context, not product value. The compelling evidence is the judgment demonstrated by auditing your own earlier design and deliberately removing most of it.

## Final recommendation

Preserve the repository, release engineering, package smoke tests, role extraction, and CSS serialization.

Replace the public contract before the first release.

The worthy product is not:

> “A friendlier collection of Material Color Utilities helpers.”

It is:

> **“The smallest trustworthy way to obtain current Material light/dark role maps and CSS in any JavaScript runtime.”**

That version would be narrow enough to defend, technically useful, visibly principal-level, and plausibly better than the available generic wrappers at exactly that job.

[1]: https://github.com/material-foundation/material-color-utilities/releases 'https://github.com/material-foundation/material-color-utilities/releases'
[2]: https://github.com/poupe-ui/material-color-utilities/releases 'https://github.com/poupe-ui/material-color-utilities/releases'
[3]: https://github.com/importantimport/mcu-extra 'https://github.com/importantimport/mcu-extra'
[4]: https://github.com/maikeleckelboom/material-schemes/blob/main/src/types.ts 'https://github.com/maikeleckelboom/material-schemes/blob/main/src/types.ts'
[5]: https://github.com/maikeleckelboom/material-schemes/blob/main/src/scheme.ts 'https://github.com/maikeleckelboom/material-schemes/blob/main/src/scheme.ts'
[6]: https://github.com/maikeleckelboom/material-schemes 'https://github.com/maikeleckelboom/material-schemes'
[7]: https://www.npmjs.com/package/%40poupe/material-color-utilities 'https://www.npmjs.com/package/%40poupe/material-color-utilities'
