# Migration dossier

**Audit basis:** current connected GitHub `main`, including the package manifest, README, public entry point, all source
modules, six test files, build/test configuration, consumer smoke tooling, release verification, and CI. This was a
static repository audit; the verification commands below are recommendations and were not executed in this session.

## 1. Verdict

### Recommendation: hard pre-release pivot inside the current repository

Treat this as:

> **A hard pre-release pivot to a graph-first package, using the existing dynamic-color implementation as an internal
> source adapter.**

The repository remains `material-schemes` for now. The version remains `0.0.0`. Nothing is published. The eventual
package identity is `color-scheme-tokens` or a scoped equivalent chosen at the release gate.

The resulting dependency direction should be:

```text
public graph/compiler API
  -> dynamicSchemeSource
    -> private upstream adapter
      -> @material/material-color-utilities
```

It must not become:

```text
public graph/compiler API
  -> public legacy material-schemes API
```

The distinction matters. Reusing `createScheme`, role extraction, contrast normalization, and palette-style mapping
during implementation is reasonable. Keeping those wrappers publicly visible is not.

This matches the attached architecture’s declaration that the graph is the canonical intermediate artifact and the
extraction plan’s instruction not to publish the old wrapper path.

### Option assessment

| Option                                             | Verdict             | Reason                                                                                                                                                                                                   |
| -------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hard pre-release pivot inside the current repo** | **Accept**          | There is no published compatibility burden. Existing code and release infrastructure can be reused without freezing the wrapper API.                                                                     |
| **Compatibility facade over a new graph engine**   | **Reject**          | A facade solves an installed-base problem that does not exist. It would make `MaterialTheme`, `DynamicColorScheme`, `createTheme`, and the raw CSS helpers part of the package’s doctrine unnecessarily. |
| **Defer and release the current wrapper**          | **Reject strongly** | It would freeze the wrong architectural center, force a migration story immediately afterward, and present the graph as an add-on instead of the package substrate.                                      |

### Scope interpretation

The first serious implementation tranche should stop at:

```text
validated graph model
validation
compiler
dynamic scheme source
profile application
CSS export
deterministic serialization and golden proof
```

I would **not include `exportJsonTokens` in the first implementation tranche**, even though the attached canonical
architecture contains one. Your more specific current constraint names CSS export plus deterministic serialization.
`serializeTokenSet()` already provides a deterministic JSON artifact suitable for snapshots. Adding a separate public
JSON document schema now would create another contract before the graph contract is proven.

The lab also remains outside this repository migration. Its document describes separate proof tooling that consumes the
package; it is not justification for adding a playground or lab here.

---

# 2. Current-state inventory

## 2.1 Package and release posture

`package.json` currently declares:

- Package name: `material-schemes`
- Version: `0.0.0`
- Description centered on Material 3 schemes, tonal palettes, and CSS variables
- MIT license
- ESM package with ESM and CommonJS outputs
- One public root entry point plus `./package.json`
- Node consumer support of `>=18`
- pnpm `11.7.0`
- Direct dependency on `@material/material-color-utilities`
- No publish script and no publish automation.

The dependency range is `^0.4.0`; the lockfile currently resolves exactly `0.4.0`.

`pnpm-workspace.yaml` does not define multiple packages. It is currently being used for pnpm build-policy approval,
allowing only the exact `esbuild@0.27.7` build. It should not be expanded into a monorepo as part of this migration.

## 2.2 Current package layout

```text
.github/
  workflows/
    release-check.yml

scripts/
  smokeConsumer.ts
  verifyRelease.ts

src/
  color.ts
  contrast.ts
  css.ts
  index.ts
  palette.ts
  roles.ts
  scheme.ts
  theme.ts
  types.ts
  variant.ts

tests/
  contrast.test.ts
  css.test.ts
  public-api.test.ts
  scheme.test.ts
  source-policy.test.ts
  theme.test.ts

package.json
pnpm-lock.yaml
pnpm-workspace.yaml
README.md
tsconfig.json
tsup.config.ts
vitest.config.ts
.prettierrc
```

The implementation is flat under `src/`; no graph, source, profile, compiler, or exporter directories exist yet. The
repository search and current imports expose the relevant source, test, script, and config set.

## 2.3 Current public exports

`src/index.ts` is explicit rather than wildcard-based, which is a good pattern to preserve. Its current runtime exports
are:

```text
Color conversion/manipulation:
  blendCam
  blendHue
  fixIfDisliked
  harmonize
  isDisliked
  toArgb
  toHct
  toHex
  toRgbaBytes

Contrast:
  ContrastLevel
  ContrastThreshold
  darkenColor
  getContrastColor
  getContrastRatio
  getLstarFromColor
  getTonalContrastDelta
  isContrasting
  lightenColor

CSS:
  createCssVarMap
  createCssVariables
  createSchemeCssVariables
  serializeCssVarMap

Palettes:
  createPalette
  getPaletteColors
  PaletteStyle

Schemes:
  createColorScheme
  createScheme
  DynamicColorScheme

Themes:
  createCustomColorGroup
  createTheme
  MaterialTheme

Variants:
  Variant

Constants:
  CMF_SUPPORTED
  DEFAULT_PALETTE_TONES
  MATERIAL_COLOR_ROLES
  MATERIAL_OPTIONAL_COLOR_ROLES
  MATERIAL_PALETTE_KEY_COLORS
  MATERIAL_REQUIRED_COLOR_ROLES
  PALETTE_STYLE_NAMES
  SUPPORTED_PLATFORMS
  SUPPORTED_SPEC_VERSIONS
```

It additionally exports the following root-level types:

```text
Color
ColorScheme
ColorSchemeOptions
ColorSchemeSource
ContrastLevelInput
CssVarMap
CssVarMapOptions
CustomColor
CustomColorGroup
DynamicSchemeLike
DynamicSchemeRoleValues
HctColor
MaterialColorRole
MaterialColorScheme
MaterialCustomColorGroup
MaterialOptionalColorRole
MaterialPaletteKeyColorRole
MaterialRequiredColorRole
MaterialThemeShape
MaterialVariantName
ModifyColorSchemeFn
PaletteStyleInput
PaletteStyleName
Platform
SchemeOptions
SchemeOptionsBase
SchemeSource
SerializeCssVarMapOptions
SpecVersion
StructuredColorScheme
SuffixedMaterialColorScheme
ThemeOptions
ThemeSource
TonalPalette
```

That surface is explicit but not small. It exposes the implementation vocabulary directly and protects wrapper concepts
as package concepts.

## 2.4 Current source responsibilities

| Path              | Current responsibility                                                                                  | Migration disposition                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/color.ts`    | ARGB/hex/HCT conversion, blend and dislike helpers, token-name and CSS-name formatting                  | Mine ARGB channel conversion and naming logic; delete most public helpers from v0               |
| `src/contrast.ts` | Named contrast levels, numeric validation, WCAG helpers, tone manipulation                              | Retain numeric contrast validation internally; remove public contrast utility surface           |
| `src/css.ts`      | Converts arbitrary color records to CSS maps and serializes them                                        | Replace with exporter accepting `CompiledTokenSet` only                                         |
| `src/palette.ts`  | Maps nine palette styles to upstream dynamic scheme constructors and exposes tonal palettes             | Use variant mapping internally; remove tonal-palette API from first graph release               |
| `src/roles.ts`    | Enumerates current role coverage and supported upstream capabilities                                    | Mine as the role-conformance source; rename and re-key publicly                                 |
| `src/scheme.ts`   | Wraps the upstream dynamic scheme, extracts flat role maps, adds palette tones and CSS instance methods | Demote to private dynamic-source implementation; remove public class/factory identity           |
| `src/theme.ts`    | Pairs light/dark schemes, exposes shared palettes/custom colors and CSS instance methods                | Delete from public API; retain only any generation logic genuinely needed by the source adapter |
| `src/types.ts`    | Defines the broad wrapper-oriented structural type surface                                              | Replace with focused graph/source/profile/compiler types                                        |
| `src/variant.ts`  | Local numeric copy of the upstream variant enum                                                         | Keep internal only if still needed                                                              |
| `src/index.ts`    | Deliberate root export list                                                                             | Replace atomically with an exact graph-first allowlist                                          |

`src/color.ts` currently treats public colors as either strings or numbers and exposes raw 0–255 RGBA bytes, while
target graph colors need normalized channels. Its formatter is useful prior art but not a valid graph color boundary.

`src/contrast.ts` contains reusable `-1..1` contrast-level validation, but it also exposes a broad group of unrelated
contrast and tone utilities that are outside the proposed graph/compiler center.

`src/palette.ts` currently supports nine styles: Monochrome, Neutral, Tonal Spot, Vibrant, Expressive, Fidelity,
Content, Rainbow, and Fruit Salad. The graph-first source API should not automatically expose all nine merely because
the internal adapter can produce them.

`src/scheme.ts` is the central wrapper. It constructs a `DynamicColorScheme`, mirrors upstream properties, defines role
getters, and owns `toColorScheme()`, `toCssVarMap()`, `toCssVariables()`, and `toCssVars()`. It also imports the CSS
layer directly. That coupling is exactly what the new boundaries should eliminate.

`src/theme.ts` similarly exposes a `MaterialTheme` class with paired light/dark schemes, shared palettes, custom colors,
and CSS convenience methods.

`src/css.ts` accepts any record of `string | number | undefined`, converts keys heuristically, and permits raw
`var(...)` strings. It does not consume a validated or compiled artifact.

## 2.5 Existing role coverage

The current repository already has more extensive role coverage than the abbreviated role-set example in the
architecture document:

- 55 entries in `MATERIAL_REQUIRED_COLOR_ROLES`
- 4 optional 2025 dim roles
- 59 total enumerated roles

The required list includes six palette-key-color roles, surface-container roles, fixed roles, inverse roles, and the
conventional primary/secondary/tertiary/error roles.

The existing scheme test iterates every required role and verifies that it resolves to a number. It separately proves
that the four optional dim roles exist for the 2025 spec. This test intent must be retained rather than reduced to the
28-role illustrative list in the architecture document.

## 2.6 Existing defaults and capability behavior

Current defaults are:

```text
specVersion: 2021
platform: phone
contrastLevel: 0
palette style: TonalSpot
```

The code also supports `2025` and `watch`, validates numeric contrast from `-1` through `1`, accepts one source color,
rejects multiple source colors, and explicitly rejects unsupported CMF.

For the first graph implementation, preserve these default generation semantics. Do not combine the architectural pivot
with an unreviewed change from 2021 to 2025 output. A spec-default change should later be an isolated, snapshot-visible
decision.

## 2.7 Tests

The six current test files cover:

| Path                          | Current coverage                                                                         | Migration treatment                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `tests/public-api.test.ts`    | Representative wrapper factories and utility imports                                     | Replace with an exact graph-first runtime export allowlist and negative legacy type imports |
| `tests/scheme.test.ts`        | Role coverage, light/dark distinction, spec/platform, contrast bounds, source count, CMF | Preserve role, mode, and input-boundary intent in dynamic-source tests                      |
| `tests/theme.test.ts`         | Paired schemes, custom colors, palette tones, CSS map creation                           | Replace; custom colors and palette tones are out of first-slice scope                       |
| `tests/css.test.ts`           | Flat object-to-hex CSS map and serializer behavior                                       | Replace with compiled-token CSS exporter tests                                              |
| `tests/contrast.test.ts`      | Public `ContrastLevel` helper behavior                                                   | Reduce to internal dynamic-source option validation tests                                   |
| `tests/source-policy.test.ts` | Prevents deprecated upstream static scheme APIs                                          | Preserve and strengthen                                                                     |

The current public API test checks only that several expected exports work; it does not assert an exact export set or
prove that unwanted names are absent.

The source-policy test is valuable. It prevents deprecated static `Scheme` APIs, direct `MaterialDynamicColors.*` usage,
`themeFromSourceColor`, and `applyTheme`. It should continue to protect the dynamic-source adapter and gain
graph-specific naming rules.

There are currently no committed token-set or CSS snapshots.

## 2.8 TypeScript and testing constraints

The TypeScript configuration is appropriately strict:

- `strict`
- `exactOptionalPropertyTypes`
- `noUncheckedIndexedAccess`
- `isolatedModules`
- `verbatimModuleSyntax`
- ES2022
- bundler resolution

`skipLibCheck` is enabled for the library build, but the packed consumer’s generated TypeScript project deliberately
sets `skipLibCheck: false`, which gives the package declarations a stricter external check.

Vitest runs in Node and explicitly inlines/optimizes `@material/material-color-utilities`, another indication that
upstream module layout requires special handling.

## 2.9 Bundling constraints

`tsup.config.ts`:

- Builds only `src/index.ts`
- Emits ESM and CommonJS
- Emits declarations and source maps
- Cleans and tree-shakes
- Bundles `@material/material-color-utilities` through `noExternal`

This bundling workaround must remain until packed-consumer verification proves that externalizing the upstream package
is safe.

The README documents why: the current upstream ESM output has extensionless relative imports that are unsafe for real
Node ESM consumers when left external. It also explains why upstream declaration types are structurally wrapped instead
of being allowed to leak into public declarations.

## 2.10 Smoke and release verification

`scripts/smokeConsumer.ts` performs an actual package pack, installs the tarball into an isolated temporary consumer,
and runs:

```text
Node ESM runtime import
Node CommonJS require
strict NodeNext TypeScript compilation
```

That discipline is excellent and must survive the migration.

It is currently tightly coupled to the old package and API:

- Hardcoded dependency name `material-schemes`
- Hardcoded ESM/CJS imports
- Assertions against `createTheme`, `createColorScheme`, and `createCssVariables`
- Environment variables and temporary directory prefixes named `MATERIAL_SCHEMES_*` and `material-schemes-smoke-*`.

`scripts/verifyRelease.ts` checks working-tree whitespace, copies tracked and untracked files into a clean temporary
workspace, performs a frozen install, and runs `release:check`. This is stronger than merely testing the developer’s
current `node_modules`.

Current script chain:

```text
check
  -> typecheck
  -> test
  -> build
  -> formatting check

release:check
  -> check
  -> pack --dry-run
  -> packed consumer smoke

verify:release
  -> diff checks
  -> clean copied workspace
  -> frozen install
  -> release:check
```

`prepack` runs the build. There is no publish command.

CI runs `verify:release` on Ubuntu, Windows, and macOS using pnpm `11.7.0` and Node `24.12.0`. It uploads the retained
verification directory on failure. It does not publish.

## 2.11 README positioning

The current README is unequivocally wrapper-oriented:

- Opening: Material 3 color schemes, tonal palettes, and CSS variables
- Install: `pnpm add material-schemes`
- Primary examples: `createTheme`, `createScheme`, `createColorScheme`
- CSS examples: `createCssVarMap`, `serializeCssVarMap`, `createCssVariables`
- Tonal palette and custom-color sections
- A long Material-branded public export list.

Its release policy is sound: remain at `0.0.0`, do not treat `0.1.0` as automatic, and publish only after the contract
is intentional.

## 2.12 Fragile or stale areas

1. **The package’s description, keywords, README, smoke consumer, and entire root export surface all tell the old story.
   **

2. **The README’s package-name checks cover `material-schemes` and `@chromavert/material-schemes`, not the target graph
   package names.**

3. **The README labels its commands “release verification” but omits `pnpm verify:release`, even though CI uses that
   stronger command.**

4. **The role-list example in the new architecture is less complete than the current implementation.** Blindly
   implementing the document’s illustrative 28 roles would be a regression from the current 55 required plus four
   optional roles.

5. **The current public API has several convenience aliases with no compatibility justification:** `toCssVariables`/
   `toCssVars` and `createCssVariables`/`createSchemeCssVariables`.

6. **`sourceColors` advertises a forward-compatible multi-source shape while rejecting multiple values.** That
   speculative surface should not be carried into the graph API.

7. **`modifyColorScheme` permits arbitrary post-generation mutation without provenance.** Profiles are the deliberate
   replacement.

8. **Current public colors are weakly validated strings or numbers.** A caller can supply arbitrary numeric values that
   do not represent a valid normalized color.

9. **The manifest’s `^0.4.0` dependency range and the generated-output contract are in tension.** The lockfile protects
   repository builds, but an exact manifest pin would make the intended algorithm version clearer.

10. **Maintainer and consumer runtimes differ.** Consumers support Node 18, while direct execution of TypeScript
    maintenance scripts is exercised in CI on Node 24.12. This is intentional but must remain documented, and Codex must
    not “solve” it by adding `tsx` or `ts-node`.

---

# 3. Target architecture

## 3.1 Repository layout

Use the architecture’s layer model but retain this repository’s existing `tests/` convention rather than introducing
`src/__tests__`:

```text
src/
  core/
    result.ts
    keys.ts
    modes.ts
    colorValue.ts
    provenance.ts
    graph.ts
    graphBuilder.ts
    validateGraph.ts
    compileGraph.ts
    serializeTokenSet.ts
    schemeSource.ts
    createSchemeGraph.ts

  sources/
    dynamicScheme/
      dynamicColorRoleSet.ts
      createDynamicSchemeValues.ts
      dynamicSchemeSource.ts
      index.ts
      internal/
        upstreamAdapter.ts
        argbConversion.ts
        roleMapping.ts
        variantMapping.ts

  profiles/
    profile.ts
    applyProfile.ts
    appSurfaceProfile.ts
    index.ts

  exporters/
    formatCssColor.ts
    cssVariableName.ts
    exportCssVariables.ts
    index.ts

  recipes/
    createSchemeTokens.ts
    index.ts

  index.ts

tests/
  core/
    keys.test.ts
    modes.test.ts
    colorValue.test.ts
    validateGraph.test.ts
    compileGraph.test.ts

  sources/
    dynamicSchemeSource.test.ts
    roleSetCoverage.test.ts

  profiles/
    applyProfile.test.ts

  exporters/
    exportCssVariables.test.ts

  recipes/
    createSchemeTokens.test.ts

  snapshots/
    deterministicOutput.test.ts

  fixtures/
    dynamic-purple.compiled.json
    dynamic-purple.css

  public-api.test.ts
  source-policy.test.ts
```

No workspace package, CLI, framework binding, plugin, site, lab, or exporter ecosystem is added.

## 3.2 Public API direction

The primary public flow should be:

```ts
import {
  appSurfaceProfile,
  createSchemeTokens,
  dynamicSchemeSource,
  hex,
} from 'color-scheme-tokens';

const result = createSchemeTokens({
  graphId: 'brand-purple',
  source: dynamicSchemeSource({
    sourceColor: hex('#6750A4'),
  }),
  profile: appSurfaceProfile,
  css: {
    variablePrefix: 'theme',
  },
});

if (!result.ok) {
  throw new Error(JSON.stringify(result.problems));
}

console.log(result.cssVariables);
```

The lower-level API remains available for inspection and advanced composition:

```ts
const graphResult = createSchemeGraph({
  graphId: 'brand-purple',
  source: dynamicSchemeSource({
    sourceColor: hex('#6750A4'),
  }),
});

if (!graphResult.ok) {
  // Handle construction problems.
} else {
  const graph = applyProfile(graphResult.graph, appSurfaceProfile);
  const compiled = compileGraph(graph);

  if (compiled.ok) {
    const css = exportCssVariables(compiled.tokenSet);
    const snapshot = serializeTokenSet(compiled.tokenSet);
  }
}
```

### Semantic-only CSS output

The compiler include law (section 3.12) means the CSS exporter emits only the tokens the user explicitly requested.
No Material vocabulary leaks unless the user wants it:

```ts
const compiled = compileGraph(appGraph, {
  include: [
    tokenKey('page.background'),
    tokenKey('page.foreground'),
    tokenKey('button.primary.background'),
    tokenKey('button.primary.foreground'),
  ],
});

if (!compiled.ok) {
  throw new Error(JSON.stringify(compiled.problems, null, 2));
}

const css = exportCssVariables(compiled.value, {
  variablePrefix: 'color',
});
```

Output:

```css
:root {
  --color-page-background: rgb(...);
  --color-page-foreground: rgb(...);
  --color-button-primary-background: rgb(...);
  --color-button-primary-foreground: rgb(...);
}
```

No `--color-scheme-primary` unless explicitly included.

### Debug CSS output

Provenance comments are a follow-up feature (comment law, section 3.12):

```ts
const css = exportCssVariables(compiled.value, {
  variablePrefix: 'color',
  comments: 'resolutionPath',
});
```

Output:

```css
:root {
  /* page.background -> scheme.surface */
  --color-page-background: rgb(...);

  /* button.primary.background -> scheme.primary */
  --color-button-primary-background: rgb(...);
}
```

## 3.3 Data model

### Keys

`TokenKey` is a branded, namespaced, dot-separated lower-camel address. A key requires **at least two segments**;
a bare single segment is not a valid token key because every token must live under a namespace.

```text
scheme.primary
scheme.onPrimaryContainer
chrome.background
semantic.action.background
```

These are rejected:

```text
primary              (single segment, no namespace)
Scheme.primary       (uppercase first letter of segment)
scheme.Primary       (uppercase first letter of segment)
scheme..primary      (empty segment)
scheme.primary-      (invalid trailing character)
```

Grammar:

```text
segment: ^[a-z][a-zA-Z0-9]*$
key:     segment(.segment)+
```

Provide both:

```ts
function parseTokenKey(value): TokenKeyResult;

function tokenKey(value): TokenKey;
```

`tokenKey()` is public and throwing. The architecture document’s comment calls it internal, but its own public export
list and examples use it. That contradiction should be resolved in favor of the ergonomic public constructor.

### Modes

The attached architecture brands `ModeKey` but does not define a parser. Your explicit migration target requires
validated mode keys, so add:

```ts
function parseModeKey(value): ModeKeyResult;

function modeKey(value): ModeKey;
```

Recommended v0 grammar:

```regex
^[a-z][a-zA-Z0-9]*$
```

Modes are identifiers such as `light`, `dark`, or potentially `highContrast`, not token namespaces.

### Colors

Use normalized values internally:

```ts
type SrgbColor = {
  readonly space: 'srgb';
  readonly r: number; // 0..1
  readonly g: number; // 0..1
  readonly b: number; // 0..1
  readonly alpha?: number; // 0..1
};

type OklchColor = {
  readonly space: 'oklch';
  readonly l: number; // 0..1
  readonly c: number; // finite, >= 0
  readonly h: number; // 0..<360
  readonly alpha?: number; // 0..1
};

type DisplayP3Color = {
  readonly space: 'display-p3';
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly alpha?: number;
};
```

Runtime validation must reject:

- NaN and infinities
- Out-of-range normalized channels
- Negative OKLCH chroma
- Invalid hue
- Invalid alpha

Branded TypeScript types are not a runtime validation boundary.

The graph may carry all three spaces, but `dynamicSchemeSource()` should initially accept **opaque `SrgbColor`**, not
arbitrary `ColorValue`. The current upstream implementation is ARGB/sRGB-based; pretending that OKLCH or Display P3
source colors can be passed through safely would be a false capability.

### Color input helpers

Keep v0 color input deliberately narrow. `hex()` is **not** a general CSS color parser. It accepts only:

```text
#RRGGBB
RRGGBB
```

Reject every other form (`rgb()`, `rgba()`, `hsl()`, named colors, `#RGB` shorthand, `#RRGGBBAA`, alpha hex, etc.).
This keeps dynamic source input honest and prevents accidental support for the full CSS color notation surface.

When alpha is needed, use the explicit channel constructor:

```ts
function srgb255(r: number, g: number, b: number, alpha?: number): SrgbColor;
```

`srgb255()` accepts integer or floating channels in the `0..255` range (alpha `0..1`) and normalizes internally. It
validates finite values and ranges at runtime. `parseHexColor()` is the non-throwing counterpart to `hex()` and accepts
the same two forms only.

### Mode values

`ModeValues<T>` is a **readonly array of `{ mode, value }` pairs**, never a string-keyed record. A record would erase
duplicate mode keys before validation can see them, making it impossible to detect duplicate, missing, or unknown mode
entries. The array form preserves order and lets validation prove all three error categories deterministically.

```ts
export type ModeValue<T> = {
  readonly mode: ModeKey;
  readonly value: T;
};

export type ModeValues<T> = readonly ModeValue<T>[];
```

Validation against the graph’s `modes` list must prove:

```text
missing light
duplicate dark
unknown highContrast
mode order preserved
```

Array form also makes deterministic serialization straightforward: order each token’s values by the graph mode index.

### Color intent is deferred from v0

Do not introduce `ColorIntent` in the first slice. It is under-defined: if it is only a concrete color, it adds nothing
over `ColorValue`; if it is meant to model authored intent, transformations, semantic desired contrast, or derived
behavior, it is not first-slice material. Letting it land now creates a vague abstraction that becomes public API
residue.

Color token nodes store concrete `ColorValue` values directly. Add an intent layer later **only when it has behavior**.

### Nodes and graph

Keep the attached graph model, with the array-based `ModeValues` and `ColorValue` (not `ColorIntent`):

```ts
type ColorTokenNode = {
  readonly kind: 'color';
  readonly key: TokenKey;
  readonly values: ModeValues<ColorValue>;
  readonly provenance: TokenProvenance;
  readonly description?: string;
};

type AliasTokenNode = {
  readonly kind: 'alias';
  readonly key: TokenKey;
  readonly target: TokenKey | ModeValues<TokenKey>;
  readonly provenance: TokenProvenance;
  readonly description?: string;
};

type ColorSchemeTokenGraph = {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly modes: readonly ModeKey[];
  readonly nodes: readonly TokenNode[];
  readonly metadata?: {
    readonly name?: string;
    readonly description?: string;
  };
};
```

The public graph contains arrays and plain objects only. No `Map`, functions, class instances, or upstream objects.

### Provenance

For the first slice, keep only provenance variants that have actual behavior:

```text
source
profile
authored
```

Do not expose imported CSS/JSON/DTCG provenance before import behavior exists. In particular, a `dtcg` discriminator
would advertise a capability explicitly excluded from v0.

### Result and problem conventions

Define one house shape for structured failures before any parser-specific result types. Codex must not invent
per-module vocabularies such as `{ success }`, `{ valid }`, `{ error }`, or `{ issues }`.

```ts
export type Result<T, Problem> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly problems: readonly Problem[] };
```

For single parsers that produce at most one problem (`parseTokenKey`, `parseModeKey`, `parseHexColor`), use a shared
single-problem shape:

```ts
export type ParseResult<T, Problem> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly problem: Problem };
```

Both live in `src/core/result.ts` and are the only sanctioned result vocabularies. Module-specific result names
(`GraphValidationResult`, `GraphBuildResult`, `CompileResult`, `TokenKeyResult`, `ModeKeyResult`, etc.) must be type
aliases of `Result` or `ParseResult` with their own `Problem` discriminator, not fresh shapes. Problem discriminators
themselves are string-literal unions defined per module (e.g. `TokenKeyProblem`, `GraphProblem`, `CompileProblem`).

## 3.4 Validation boundary

`validateGraph()` answers whether a graph is structurally safe to compile. It should validate more than the attached
pseudocode currently does:

```text
schemaVersion is supported
graphId is non-empty
at least one mode
mode keys satisfy grammar
graph modes are unique
token keys satisfy grammar (at least two segments)
token keys are unique
color values are finite and normalized
every color node has exactly one value per graph mode
no color node contains duplicate mode values (array form makes this detectable)
no color node contains unknown modes
no color node is missing a value for any graph mode
uniform alias targets exist
mode-specific aliases have exactly one target per graph mode
no mode-specific alias contains duplicate modes
no mode-specific alias contains unknown modes
no mode-specific alias is missing a target for any graph mode
all alias targets exist
alias cycles are detected per mode
```

`alias-cycle` should contain the affected `mode` and a stable cycle path. Mode-specific aliases can be cyclic in one
mode but valid in another; a mode-agnostic cycle detector is insufficient.

Problem ordering should be deterministic so validation tests do not flicker.

All validation and compilation problems use `kind` as the discriminator field (not `type`), consistent with the rest
of the model's discriminated unions (`kind: 'color'`, `kind: 'alias'`). The problem law (section 3.12) governs the
full contract: stable `kind` values and human-readable messages. Example:

```ts
{
  kind: 'unknown-alias-target',
  key: 'button.primary.background',
  target: 'scheme.primsary',
  message:
    "Token 'button.primary.background' targets 'scheme.primsary', but 'scheme.primsary' does not exist in the graph.",
}
```

`compileGraph()` calls `validateGraph()` internally. No caller should be able to accidentally compile a broken graph.

## 3.5 Compiler boundary

`compileGraph()`:

1. Calls `validateGraph()` internally.
2. Builds internal maps.
3. Resolves every included token for every graph mode.
4. Returns concrete colors.
5. Records `sourceKey` and `resolutionPath` per mode.
6. Never mutates the graph.
7. Does not format CSS.

Use memoization by `(TokenKey, ModeKey)`.

An unknown key in `CompileOptions.include` should be an explicit compile problem, not silently ignored. A misspelled
product token must not produce an apparently successful empty export.

The compiler include law (section 3.12) is the authoritative rule: `include` selects **emitted** tokens, not
dependency tokens. The compiler traverses the graph backwards to resolve dependencies, but only emits the explicitly
requested tokens. Dependency tokens are read for resolution but never emitted unless they were themselves included.
Each emitted token records `sourceKey` and `resolutionPath` per mode, so traceability is preserved even when
dependency tokens are suppressed.

I recommend omitting the architecture document's always-empty `diagnostics` property from the first public contract. Add
diagnostics only when a real warning category and handling policy exist.

## 3.6 Exporter boundary

`exportCssVariables()` accepts only `CompiledTokenSet`.

It must not:

- Accept source input
- Accept a graph
- Validate a graph
- Resolve aliases
- Reach into the upstream algorithm
- Mutate tokens
- Rename tokens

The exporter law (section 3.12) is authoritative: the CSS exporter **never renames tokens**. It derives CSS variable
names mechanically from compiled token keys. All semantic naming happens at the graph and profile level. This preserves
the single source of truth and is what makes tree-shaking (`include`), traceable debugging, and mode-specific logic
possible.

Keep formatting helpers private unless there is demonstrated public demand:

```text
formatCssColor
tokenKeyToCssName
validateCssPrefix
```

`cssVariableName()` may be public because it is useful for consumers that need to reference a generated variable
consistently.

Do not carry forward:

```text
createCssVarMap
serializeCssVarMap
createSchemeCssVariables
minify
arbitrary var(...) passthrough
```

Those belong to the old arbitrary-record utility model.

### Mode selector policy

The graph model allows arbitrary mode keys, but the CSS exporter’s default selectors only cover the standard `light` and
`dark` pair. The exporter must **not silently drop** non-standard modes such as `highContrast`.

Rule:

```text
If all compiled modes are exactly { light, dark }, default selectors are permitted:
  light -> :root
  dark  -> [data-theme="dark"] (or equivalent documented default)

If any non-standard mode is present, the exporter must require explicit modeSelectors
  for every mode, and must reject otherwise rather than emit a partial stylesheet.
```

`modeSelectors` is a `Record<ModeKey, string>` mapping each compiled mode to a CSS selector. When provided, it is
authoritative for all modes; when omitted on a standard light/dark set, defaults apply.

### Exact color formatting

“Modern `rgb()` syntax” is the target, but formatting must be deterministic, not a formatter taste choice.

For sRGB, emit **byte channels** (round normalized `0..1` to `0..255`):

```css
rgb(103 80 164)
rgb(103 80 164 / 0.5)
```

Omit the alpha component when alpha is `1`. Include ` / <alpha>` when alpha is present and not `1`, formatted with the
same bounded precision rule below.

For OKLCH and Display P3 authored colors, define precision once: clamp to a fixed number of significant digits (e.g.
six), trim meaningless trailing zeros, and trim a trailing decimal point. Hue is emitted in degrees `0..360` (not
turns). Chroma is emitted as-is within its bounded precision. The same precision and trimming rules apply to all
color spaces so output is byte-for-byte stable across repeated calls and platforms.

Never emit `NaN`, infinities, or negative zero. The compiler’s normalized-color invariant makes this a defensive check,
not a formatting branch.

### Provenance comments

Provenance comments are a follow-up feature, not part of the first CSS exporter acceptance bar. The comment law
(section 3.12) governs their behavior.

When implemented, the option shape is:

```ts
comments?: false | 'resolutionPath'
```

Default is `false`. The exporter may only use compiler-owned resolution paths; it must not invent or infer provenance
from token names or values. The base exporter must be proven before this option is added.

## 3.7 Profile boundary

A profile:

- Receives no source implementation
- Contains aliases or authored colors
- Extends a graph immutably
- Does not compile
- Does not export CSS
- Records profile provenance

Profile tokens are plain serializable objects. The only acceptable "helper" in v0 is the boundary constructor for
validated scalar values (`tokenKey()`, `modeKey()`, `hex()`, `srgb255()`). Do not introduce `defineProfile()`,
`alias()`, or `color()` builder functions. Plain objects keep profiles trivially serializable, inspectable, testable,
and future JSON-compatible.

```ts
export type ProfileAliasToken = {
  readonly kind: 'alias';
  readonly key: TokenKey;
  readonly target: TokenKey | ModeValues<TokenKey>;
  readonly description?: string;
};

export type ProfileColorToken = {
  readonly kind: 'color';
  readonly key: TokenKey;
  readonly values: ModeValues<ColorValue>;
  readonly description?: string;
};

export type ProfileToken = ProfileAliasToken | ProfileColorToken;

export type ColorSchemeProfile = {
  readonly profileId: string;
  readonly tokens: readonly ProfileToken[];
};
```

Profile composition in v0 is **chainable**, not array-based (collision law, section 3.12):

```ts
const graphWithOrg = applyProfile(sourceGraph, orgProfile);
const graphWithApp = applyProfile(graphWithOrg, appProfile);

const validation = validateGraph(graphWithApp);
```

If both profiles define the same `tokenKey`, `validateGraph()` rejects the final graph. No implicit overwrite. No
order-based override. An `applyProfiles()` utility may be added later as a thin wrapper with the same law.

`appSurfaceProfile` is the only built-in profile required now. Product-specific profiles remain in product repositories.

`appSurfaceProfile` adds exactly these aliases, targeting concrete `scheme.*` roles. These targets are fixed by this
plan, not left to the implementer:

```text
chrome.background           -> scheme.surface
chrome.foreground           -> scheme.onSurface
chrome.border               -> scheme.outlineVariant
semantic.action.background  -> scheme.primary
semantic.action.foreground  -> scheme.onPrimary
semantic.danger.background  -> scheme.error
semantic.danger.foreground  -> scheme.onError
```

All seven are uniform aliases (same target in every mode). `scheme.surface` is chosen over `scheme.background` and
`scheme.surfaceContainerLowest` because it is the conventional Material 3 app surface role and matches current wrapper
behavior. If a later review prefers `scheme.surfaceContainerLowest` or `scheme.background`, that is a separate,
snapshot-visible decision—not an implementation-time choice.

Required tests include:

- Uniform alias
- Mode-specific alias
- Authored color node
- Correct profile provenance
- Duplicate profile key rejected later by validation
- Original graph remains unchanged

## 3.8 Dynamic scheme source boundary

`dynamicSchemeSource()` captures options and exposes a source object:

```ts
type DynamicSchemeSourceOptions = {
  readonly sourceColor: SrgbColor;
  readonly variant?: 'tonal' | 'vibrant' | 'expressive' | 'neutral';
  readonly contrastLevel?: number;
};
```

Recommended mapping:

```text
tonal      -> existing TonalSpot
vibrant    -> existing Vibrant
expressive -> existing Expressive
neutral    -> existing Neutral
```

Do not expose `PaletteStyle`, numeric `Variant`, `specVersion`, `platform`, palette overrides, custom colors, multiple
source colors, or tonal palette extraction in the first graph source.

For the first graph snapshot, preserve current internal defaults:

```text
specVersion = 2021
platform = phone
contrastLevel = 0
variant = tonal/TonalSpot
```

That keeps the migration architectural rather than mixing it with an algorithm-default change.

## 3.9 Role coverage

Do not copy only the 28-role excerpt from the architecture document.

Build `dynamicColorRoleSet` from the actual current role inventory:

- 55 required definitions
- 4 optional definitions
- All re-keyed as `scheme.*`
- No public `MATERIAL_*` names

Examples:

```text
primary                 -> scheme.primary
onPrimaryContainer      -> scheme.onPrimaryContainer
surfaceContainerHighest -> scheme.surfaceContainerHighest
primaryPaletteKeyColor  -> scheme.primaryPaletteKeyColor
primaryDim              -> scheme.primaryDim
```

Recommended conformance policy:

- Every required role must exist in both light and dark mode.
- Optional roles may be absent, but if present must exist in both modes.
- No generated role may fall outside the role set.
- The graph source emits only color nodes.
- All colors are normalized sRGB.
- All keys begin with `scheme.`.

## 3.10 Snapshot strategy

Use both deterministic serialization and committed golden fixtures:

```text
tests/fixtures/dynamic-purple.compiled.json
tests/fixtures/dynamic-purple.css
```

Canonical fixture input:

```text
source: #6750A4
variant: tonal
contrast: 0
internal spec: 2021
internal platform: phone
profile: appSurfaceProfile where relevant
```

`serializeTokenSet()` should:

- Preserve the graph-declared mode order
- Sort tokens by key
- Order each token’s mode values by the graph mode index
- Preserve resolution-path order
- Canonicalize nested objects consistently
- Never emit NaN, infinities, or negative zero
- End with a newline if used as a file fixture

The architecture example sorts top-level modes but does not sort each token’s values, which can produce an internally
inconsistent canonical document. Do not copy that bug.

Snapshot updates must never be bundled casually with unrelated refactors or dependency upgrades.

## 3.11 Dependency strategy

Preserve:

- `@material/material-color-utilities` as a direct dependency
- `tsup.noExternal` bundling
- Vitest upstream inlining
- Structural public declarations that do not leak upstream types
- Packed ESM, CommonJS, and declaration verification
- No `tsx`, `ts-node`, or equivalent dependency

After golden snapshots exist, consider changing the manifest dependency from `^0.4.0` to exact `0.4.0`. That should be a
visible dependency-policy change, not mixed into graph-core implementation. Concretely:

- Do **not** change the `^0.4.0` range during any core graph, source, profile, exporter, serialization, or cutover
  batch. The lockfile already resolves exactly `0.4.0` for repository builds, so generated output is stable in CI.
- After golden fixtures are committed, the pin is a separate commit:

  ```text
  chore(deps): pin material color utilities for deterministic output
  ```

- That commit must show a fixture diff of **zero** (the pin only makes the intended algorithm version explicit; it
  does not move the resolved version). If the pin changes output, the range was already drifting and the diff must be
  reviewed as an algorithm-policy change, not a mechanical pin.
- Keeping algorithm-policy drift separate from architecture work is the point of the separation.

## 3.12 Invariant laws

These laws are non-negotiable invariants that cut across multiple sections. They are consolidated here so that no
implementation batch, Codex prompt, or future review can contradict them without an explicit amendment.

### Compiler include law

`include` selects emitted tokens, not dependency tokens. Dependencies may be read for resolution but are not emitted
unless explicitly included.

```ts
const compiled = compileGraph(appGraph, {
  include: [tokenKey('page.background'), tokenKey('button.primary.background')],
});
```

This emits exactly:

```text
page.background
button.primary.background
```

Not:

```text
page.background
button.primary.background
scheme.surface
scheme.primary
```

Each emitted token still records lineage:

```ts
{
  key: 'button.primary.background',
  values: [
    {
      mode: 'light',
      value: { space: 'srgb', r: 0.4, g: 0.31, b: 0.64 },
      sourceKey: 'scheme.primary',
      resolutionPath: [
        'button.primary.background',
        'scheme.primary',
      ],
    },
  ],
}
```

No Material vocabulary leaks into CSS unless the user explicitly includes it, but full traceability is preserved in
compiled output.

### Alias target law

Alias targets may be uniform or mode-specific. Mode-specific targets use `ModeValues<TokenKey>`.

Uniform:

```ts
{ kind: 'alias', key: tokenKey('border.subtle'), target: tokenKey('scheme.outlineVariant') }
```

Mode-specific:

```ts
{
  kind: 'alias',
  key: tokenKey('border.subtle'),
  target: [
    { mode: lightMode, value: tokenKey('scheme.outlineVariant') },
    { mode: darkMode, value: tokenKey('scheme.surfaceContainerLowest') },
  ],
}
```

This applies equally to graph-level alias nodes and profile alias tokens.

### Collision law

Duplicate token keys are invalid. Profiles never overwrite existing graph nodes. No implicit overwrite. No order-based
override. If two profiles define the same `tokenKey`, `validateGraph()` rejects the resulting graph.

Profile composition in v0 is **chainable**, not array-based:

```ts
const graphWithOrg = applyProfile(sourceGraph, orgProfile);
const graphWithApp = applyProfile(graphWithOrg, appProfile);

const validation = validateGraph(graphWithApp);
```

If both profiles define `button.primary.background`, `validateGraph()` rejects the final graph. An `applyProfiles()`
utility accepting arrays may be added later as a thin wrapper with the same "no overwrites" law, but only after the
chainable primitive is proven.

### Exporter law

The CSS exporter never renames tokens. It derives CSS variable names mechanically from compiled token keys. All
semantic naming happens at the graph and profile level, not at the CSS layer. This preserves the single source of
truth: the graph.

### Comment law

CSS provenance comments are optional, off by default, and may only use compiler-owned resolution paths.

```ts
exportCssVariables(compiled.value, {
  variablePrefix: 'color',
  comments: 'resolutionPath',
});
```

Output:

```css
:root {
  /* page.background -> scheme.surface */
  --color-page-background: rgb(...);

  /* button.primary.background -> scheme.primary */
  --color-button-primary-background: rgb(...);
}
```

The option shape is:

```ts
comments?: false | 'resolutionPath'
```

Default is `false`. Production CSS stays clean unless the user opts in. This is not part of the first CSS exporter
acceptance bar; it is a follow-up feature that depends on the base exporter being proven first.

### Problem law

All public validation and compilation failures return structured problem objects with stable `kind` values and
human-readable messages. The discriminator field is `kind` (not `type`), consistent with the rest of the model's
discriminated unions.

```ts
{
  kind: 'unknown-alias-target',
  key: 'button.primary.background',
  target: 'scheme.primsary',
  message:
    "Token 'button.primary.background' targets 'scheme.primsary', but 'scheme.primsary' does not exist in the graph.",
}
```

`compileGraph()` calls `validateGraph()` internally. No caller should be able to accidentally compile a broken graph.

---

# 4. Delta map

## 4.1 Current API to target API

| Current API/concept                          | Target API/concept                                                        | Disposition                          |
| -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| `createTheme()`                              | `dynamicSchemeSource()` + `createSchemeGraph()` or `createSchemeTokens()` | Replace                              |
| `createScheme()`                             | Private dynamic-source adapter                                            | Internalize                          |
| `createColorScheme()`                        | Source graph generation and `compileGraph()`                              | Replace                              |
| `MaterialTheme`                              | No public equivalent                                                      | Delete from public API               |
| `DynamicColorScheme`                         | Private upstream adapter                                                  | Internalize                          |
| `ColorScheme` record                         | `ColorSchemeTokenGraph` and `CompiledTokenSet`                            | Replace                              |
| Raw `primary`, `onPrimary` keys              | `scheme.primary`, `scheme.onPrimary`                                      | Rename and namespace                 |
| `createCssVarMap()`                          | No equivalent                                                             | Delete                               |
| `serializeCssVarMap()`                       | `exportCssVariables()`                                                    | Replace                              |
| `createCssVariables()`                       | `exportCssVariables()` or recipe output                                   | Replace                              |
| `createSchemeCssVariables`                   | No equivalent alias                                                       | Delete                               |
| Instance `.toCssVariables()`                 | Exporter or recipe                                                        | Delete                               |
| Instance `.toCssVars()`                      | No equivalent alias                                                       | Delete                               |
| `PaletteStyle`                               | `DynamicSchemeVariant` string union                                       | Replace publicly; map internally     |
| `Variant` numeric enum                       | Private implementation detail                                             | Internalize                          |
| `ContrastLevel` class                        | Validated numeric `contrastLevel` option                                  | Replace publicly                     |
| `MATERIAL_*_ROLES`                           | `dynamicColorRoleSet` with `scheme.*` keys                                | Replace                              |
| `createPalette()` / `getPaletteColors()`     | None in first release                                                     | Delete from public API               |
| Palette tones in `createColorScheme()`       | None in first release                                                     | Defer                                |
| Custom color groups                          | Profile-authored colors cover only the simple authored case               | Do not migrate harmonization feature |
| `modifyColorScheme` callback                 | `ColorSchemeProfile`                                                      | Replace                              |
| `sourceColors` speculative multi-input shape | One opaque sRGB source color                                              | Delete                               |
| `specVersion` / `platform` public options    | Fixed private adapter defaults                                            | Internalize                          |
| Color string/ARGB number                     | Normalized `ColorValue`                                                   | Replace                              |
| External manual app aliasing                 | `ColorSchemeProfile` and `applyProfile()`                                 | Add                                  |
| No provenance                                | `TokenProvenance`                                                         | Add                                  |
| No graph validation                          | `validateGraph()`                                                         | Add                                  |
| No alias resolution                          | `compileGraph()`                                                          | Add                                  |
| No stable output fixture                     | `serializeTokenSet()` + golden files                                      | Add                                  |

## 4.2 Current concepts to retain

Retain as implementation assets:

- Dynamic scheme construction
- Current default generation semantics
- Role enumeration
- Light/dark generation
- Variant mapping logic
- Numeric contrast bounds
- ARGB channel extraction
- Direct upstream dependency
- Upstream bundling workaround
- Source-policy test discipline
- Strict TypeScript settings
- ESM/CJS/types package shape
- Packed consumer smoke test
- Cross-platform release CI

## 4.3 Current concepts to delete

Delete from the eventual public contract:

- `MaterialTheme`
- `DynamicColorScheme`
- `createTheme`
- `createScheme`
- `createColorScheme`
- Public tonal palettes
- Public contrast utilities
- Public blend/dislike/HCT utilities
- Raw CSS map helpers
- CSS convenience aliases
- Custom-color group API
- Palette overrides
- Multiple-source placeholder
- Arbitrary color-scheme mutation callback
- Material-branded role/type names

## 4.4 Current concepts to wrap temporarily

Only the following may sit behind a temporary internal bridge:

```text
createScheme()
createColorScheme()
PaletteStyle mapping
resolveContrastLevelValue()
current role arrays
ARGB extraction
```

That bridge must be isolated in:

```text
src/sources/dynamicScheme/createDynamicSchemeValues.ts
```

or its `internal/` dependencies.

It must not be re-exported from `src/index.ts`, documented, or used by profiles/exporters.

## 4.5 Tests to preserve conceptually

- Current required-role coverage
- Optional-role behavior
- Light and dark values are both generated
- Light and dark differ where expected
- Contrast-level bounds
- One source color only
- Unsupported upstream behavior is rejected rather than faked
- Deprecated upstream API source-policy checks
- Packed ESM/CJS/type consumer verification
- Cross-platform release verification

## 4.6 Tests to replace

- `tests/public-api.test.ts` wrapper factory assertions
- `tests/theme.test.ts`
- Flat-object CSS tests
- Public `ContrastLevel` helper tests
- Brightness-variant type test
- Custom-color and palette-tone tests
- Smoke imports of `createTheme`, `createColorScheme`, and `createCssVariables`

## 4.7 New tests required

1. Token-key parser and throwing constructor.
2. Mode-key parser and throwing constructor.
3. Normalized color constructors and runtime rejection.
4. Graph JSON roundtrip.
5. Empty modes.
6. Duplicate modes.
7. Invalid mode keys.
8. Invalid token keys.
9. Duplicate token keys.
10. Missing, duplicate, and unknown mode values.
11. Invalid color values.
12. Unknown alias targets.
13. Missing mode alias targets.
14. Uniform alias cycles.
15. Mode-specific alias cycles.
16. Compile validation gating.
17. Uniform alias resolution paths.
18. Mode-specific source keys and paths.
19. Unknown include key rejection.
20. Dynamic role-set conformance for all current required roles.
21. Optional-role consistency.
22. `scheme.*` namespace enforcement.
23. Profile immutability and provenance.
24. Authored profile color.
25. CSS variable name conversion.
26. Light and dark CSS blocks.
27. Deterministic serialization.
28. Committed generated-output fixture.
29. Exact public runtime export allowlist.
30. Type-level proof that legacy imports are absent.
31. Packed ESM, CommonJS, and strict declaration consumption.

## 4.8 Documentation changes

Eventually replace:

- README opening
- Install command
- Every wrapper example
- Public API list
- Material-specific package positioning
- Old npm-name checks
- Release verification command list

Preserve and adapt:

- Direct dependency and bundling explanation
- Consumer versus maintainer Node runtime distinction
- No TypeScript runtime dependency policy
- `0.0.0` pre-release policy
- Moment-in-time npm availability warning
- Packed consumer verification instructions

Do not add a migration guide for users. There are no published users to migrate.

---

# 5. Sequential migration plan

## Batch 0 — Commit the migration control document

**Goal**

Land this dossier as the canonical control document before any code changes, so fresh Codex sessions do not re-litigate
settled decisions.

**Files likely touched**

```text
docs/migration-plan.md
```

**Implementation notes**

- This document is the single source of truth for package name (unsettled until the release gate), release timing,
  facade compatibility (none), Material naming (internal only), DTCG (out of v0), JSON export (out of v0), and
  playground/lab scope (out of this repository).
- Every later batch references this document’s constraints rather than re-deriving them.
- Do not alter code, tests, package metadata, or README in this batch.

**Explicit non-goals**

- No code changes
- No dependency changes
- No public API changes

**Verification**

```bash
git status   # only docs/migration-plan.md is staged
```

**Acceptance criteria**

- The control document is committed and reachable from the repository root.
- A new contributor reading only this document can answer the settled policy questions without guessing.

**Suggested commit message**

```text
docs: add migration control dossier
```

---

## Batch 1 — Validated graph primitives

**Goal**

Introduce the foundational key, mode, color, provenance, node, and graph types without changing the root public API.

**Files likely touched**

```text
src/core/result.ts
src/core/keys.ts
src/core/modes.ts
src/core/colorValue.ts
src/core/provenance.ts
src/core/graph.ts
tests/core/keys.test.ts
tests/core/modes.test.ts
tests/core/colorValue.test.ts
tests/core/result.test.ts
tests/core/graph.test.ts
```

**Implementation notes**

- Add the shared `Result<T, Problem>` and `ParseResult<T, Problem>` shapes in `src/core/result.ts` first; every later
  module reuses them.
- Add public-intended branded `TokenKey` and `ModeKey`.
- Add non-throwing parsers and throwing constructors.
- Define normalized color types and input helpers.
- Add an internal color validator reusable by graph validation.
- Keep graph values plain and JSON-roundtrippable.
- Do not export anything from the root yet.
- Do not copy old `Color = string | number`.
- Do not introduce `ColorIntent` in this batch; color token nodes store `ColorValue`.

**Explicit non-goals**

- No validation of complete graphs
- No builder
- No compiler
- No dynamic source
- No profiles
- No CSS
- No root-index changes
- No package name/version change

**Verification**

```bash
pnpm exec vitest run \
  tests/core/result.test.ts \
  tests/core/keys.test.ts \
  tests/core/modes.test.ts \
  tests/core/colorValue.test.ts \
  tests/core/graph.test.ts
pnpm typecheck
pnpm format
```

**Acceptance criteria**

- Invalid keys and modes are rejected deterministically.
- Single-segment token keys are rejected (at least two segments required).
- Color helpers produce normalized values.
- `hex()` accepts only `#RRGGBB` and `RRGGBB`; every other form is rejected.
- Invalid channels, alpha, hue, NaN, and infinity are rejected.
- `ModeValues` is an array; duplicate, missing, and unknown mode entries are detectable.
- A representative graph survives `JSON.stringify`/`JSON.parse`.
- Current wrapper tests continue to pass.

**Risks**

- Treating brands as sufficient runtime validation
- Accidentally allowing unnamespaced or single-segment token keys
- Modeling `ModeValues` as a record instead of a readonly array (would erase duplicate modes)
- Introducing a premature `ColorIntent` abstraction
- Letting `hex()` accept CSS color forms beyond `#RRGGBB`/`RRGGBB`
- Introducing classes into the graph shape
- Inventing per-module result vocabularies instead of reusing `Result`/`ParseResult`

**Suggested commit message**

```text
feat(core): add validated token graph primitives
```

---

## Batch 2 — Graph builder and structural validation

**Goal**

Add a safe graph-construction helper and comprehensive structural graph validation.

**Files likely touched**

```text
src/core/graphBuilder.ts
src/core/validateGraph.ts
tests/core/graphBuilder.test.ts
tests/core/validateGraph.test.ts
```

**Implementation notes**

- Keep `createGraphBuilder` internal.
- Return structured problems rather than throwing for graph defects.
- Validate runtime strings and numeric color values even when TypeScript types claim they are branded.
- Detect cycles independently for each mode.
- Return problems in deterministic order.
- Do not stop after the first problem unless later checks would be unsafe.

**Explicit non-goals**

- No alias resolution
- No compiler
- No source generation
- No public root export
- No JSON or CSS exporter

**Verification**

```bash
pnpm exec vitest run \
  tests/core/graphBuilder.test.ts \
  tests/core/validateGraph.test.ts
pnpm typecheck
pnpm format
```

**Acceptance criteria**

Every validation category has at least one focused failure test, including a cycle that exists in only one mode.

**Risks**

- Duplicate or contradictory problem reports
- Mode-specific aliases being checked as if they were uniform
- Non-deterministic cycle paths

**Suggested commit message**

```text
feat(core): add graph builder and structural validation
```

---

## Batch 3 — Compiler and alias tracing

**Goal**

Compile valid graphs into concrete per-mode token values with source keys and resolution paths.

**Files likely touched**

```text
src/core/compileGraph.ts
tests/core/compileGraph.test.ts
```

**Implementation notes**

- Call `validateGraph()` internally.
- Resolve uniform and mode-specific aliases.
- Memoize by token and mode.
- Preserve graph node order in normal compilation.
- Implement include filtering.
- Reject unknown include keys.
- Make source identity per mode.
- Do not add speculative warning diagnostics.

**Explicit non-goals**

- No dynamic source
- No profiles
- No CSS
- No serialization fixture
- No root export change

**Verification**

```bash
pnpm exec vitest run tests/core/compileGraph.test.ts
pnpm typecheck
pnpm format
```

**Acceptance criteria**

- Concrete nodes compile directly.
- Uniform aliases expose the expected path.
- Mode-specific aliases report different source keys where appropriate.
- Cycles and invalid graphs return structured failures.
- Unknown include keys do not succeed silently.
- `include` emits only the requested tokens; dependency tokens are read for resolution but not emitted unless themselves included (compiler include law, section 3.12).
- Each emitted token records `sourceKey` and `resolutionPath` per mode even when dependency tokens are suppressed.

**Risks**

- Path direction being reversed
- Source key being recorded once per token rather than per mode
- Recursive resolution becoming unnecessarily quadratic

**Suggested commit message**

```text
feat(core): compile token graphs with per-mode alias tracing
```

---

## Batch 4 — Dynamic scheme source and role conformance

**Goal**

Create the first real scheme source using the existing implementation internally while emitting graph-native `scheme.*`
nodes.

**Files likely touched**

```text
src/core/schemeSource.ts
src/core/createSchemeGraph.ts
src/sources/dynamicScheme/dynamicColorRoleSet.ts
src/sources/dynamicScheme/createDynamicSchemeValues.ts
src/sources/dynamicScheme/dynamicSchemeSource.ts
src/sources/dynamicScheme/index.ts
src/sources/dynamicScheme/internal/argbConversion.ts
src/sources/dynamicScheme/internal/variantMapping.ts
tests/sources/dynamicSchemeSource.test.ts
tests/sources/roleSetCoverage.test.ts
```

Potentially refactored, but not yet deleted:

```text
src/color.ts
src/contrast.ts
src/palette.ts
src/roles.ts
src/scheme.ts
src/types.ts
src/variant.ts
```

**Implementation notes**

- Search for and reuse current generation, role-reading, variant, contrast, and ARGB helpers.
- Isolate all wrapper reuse behind `createDynamicSchemeValues`.
- Preserve current algorithm defaults for the first snapshot.
- Accept opaque `SrgbColor`.
- Map four public variants to current internals.
- Re-key all 55 required and four optional roles.
- Generate one color node per available role with light and dark values.
- Add source provenance.
- No CSS/profile imports in this folder.

**Explicit non-goals**

- No custom colors
- No palette overrides
- No multiple source colors
- No public spec/platform controls
- No tonal palette API
- No root-index cutover
- No dependency upgrade

**Verification**

```bash
pnpm exec vitest run \
  tests/sources/dynamicSchemeSource.test.ts \
  tests/sources/roleSetCoverage.test.ts \
  tests/scheme.test.ts \
  tests/source-policy.test.ts
pnpm typecheck
pnpm build
pnpm format
```

**Acceptance criteria**

- All required current roles exist as `scheme.*`.
- Every required node has exactly one light and one dark value.
- Optional role presence is consistent across modes.
- Generated colors are normalized.
- The source graph validates and compiles.
- No public Material-branded name is introduced.

**Risks**

- Accidentally truncating role coverage to the architecture example
- Duplicating the upstream algorithm wrapper
- Changing output defaults while changing architecture
- Mishandling unsigned ARGB values

**Suggested commit message**

```text
feat(source): add dynamic scheme graph source
```

---

## Batch 5 — Profiles and app aliases

**Goal**

Add immutable profile application, including the generic `appSurfaceProfile`.

**Files likely touched**

```text
src/profiles/profile.ts
src/profiles/applyProfile.ts
src/profiles/appSurfaceProfile.ts
src/profiles/index.ts
tests/profiles/applyProfile.test.ts
```

**Implementation notes**

- Support alias and authored color profile tokens using the `ProfileAliasToken` and `ProfileColorToken` types from section 3.7.
- Profiles are plain serializable data objects. Do not introduce `defineProfile()`, `alias()`, or `color()` builder functions.
- Preserve the source graph.
- Add profile provenance.
- Preserve mode order in mode-specific targets.
- Alias targets may be uniform (`TokenKey`) or mode-specific (`ModeValues<TokenKey>`).
- Let graph validation reject duplicate keys or bad targets (collision law, section 3.12).
- `applyProfile()` is chainable: `applyProfile(applyProfile(graph, a), b)`. Do not add `applyProfiles()` accepting arrays in v0.
- Compile profile aliases in tests.

**Explicit non-goals**

- No product-specific profiles
- No profile composition language or array-based `applyProfiles()`
- No automatic contrast repair
- No CSS naming inside profiles
- No package dependency on Dekzer
- No `defineProfile()` or other builder helpers

**Verification**

```bash
pnpm exec vitest run tests/profiles/applyProfile.test.ts
pnpm typecheck
pnpm format
```

**Acceptance criteria**

- `appSurfaceProfile` adds exactly the seven documented aliases with the exact targets from section 3.7.
- Alias provenance contains the profile ID and source keys.
- Authored profile colors compile.
- A mode-specific alias resolves differently per mode.
- The input graph is unchanged.
- Duplicate profile keys are rejected by `validateGraph()` (collision law).
- Chained `applyProfile()` calls produce a valid graph when keys do not collide.

**Risks**

- Losing profile identity after compilation
- Mutating the input node array
- Treating an authored profile color as an alias

**Suggested commit message**

```text
feat(profiles): add profile application and app surface aliases
```

---

## Batch 6 — CSS exporter

**Goal**

Export compiled token sets as deterministic CSS variables.

**Files likely touched**

```text
src/exporters/formatCssColor.ts
src/exporters/cssVariableName.ts
src/exporters/exportCssVariables.ts
src/exporters/index.ts
tests/exporters/exportCssVariables.test.ts
```

**Implementation notes**

- Consume `CompiledTokenSet` only.
- Convert token key segments from lower camel case to kebab case.
- Use deterministic color-number formatting.
- Support light/dark selectors and an explicit prefix.
- Validate or tightly normalize the prefix.
- Preserve compiled token order.
- Keep color formatting private.
- The exporter never renames tokens (exporter law, section 3.12). CSS variable names are derived mechanically from compiled token keys.
- Provenance comments (`comments: 'resolutionPath'`) are a follow-up feature and not part of this batch (comment law, section 3.12).

**Explicit non-goals**

- No CSS map API
- No minifier
- No arbitrary `var(...)` values
- No JSON exporter
- No StyleX, Tailwind, or framework integration
- No provenance comments
- No token renaming or semantic-name mapping

**Verification**

```bash
pnpm exec vitest run tests/exporters/exportCssVariables.test.ts
pnpm typecheck
pnpm build
pnpm format
```

**Acceptance criteria**

- `scheme.onPrimaryContainer` maps to `--theme-scheme-on-primary-container`.
- `chrome.background` maps to `--theme-chrome-background`.
- Both light and dark blocks are emitted.
- An alias is already resolved before export.
- Output is byte-for-byte stable across repeated calls.
- CSS variable names are derived mechanically from compiled token keys; the exporter does not rename tokens.
- Only the tokens present in the compiled token set are emitted (no dependency tokens added by the exporter).

**Risks**

- CSS selector collisions
- Inconsistent float formatting
- Exporter accidentally learning graph resolution logic

**Suggested commit message**

```text
feat(css): export compiled token sets as CSS variables
```

---

## Batch 7 — Deterministic serialization and golden proof

**Goal**

Make generated-output drift visible and reviewable.

**Files likely touched**

```text
src/core/serializeTokenSet.ts
tests/snapshots/deterministicOutput.test.ts
tests/fixtures/dynamic-purple.compiled.json
tests/fixtures/dynamic-purple.css
```

**Implementation notes**

- Deeply canonicalize tokens and mode values.
- Preserve declared mode order.
- Sort tokens by key.
- Avoid environment-specific data and package timestamps.
- Compare generated output with committed fixture files.
- Add a test proving that a deliberate value change changes serialized output.
- Do not add a snapshot-update runtime dependency.

**Explicit non-goals**

- No JSON exporter schema
- No CLI fixture generator
- No dependency upgrade
- No broad fixture matrix

**Verification**

```bash
pnpm exec vitest run tests/snapshots/deterministicOutput.test.ts
pnpm check
```

**Acceptance criteria**

- Two independent compilations serialize identically.
- JSON parsing succeeds.
- Golden CSS and compiled-token fixtures match.
- Resolution paths and provenance are represented.
- A changed token value causes a fixture mismatch.

**Risks**

- Canonicalizing only the top level
- Platform-dependent numeric output
- Normal snapshot churn obscuring algorithm drift

**Suggested commit message**

```text
test(snapshots): lock deterministic compiled token output
```

---

## Batch 8a — Recipe only

**Goal**

Add the thin `createSchemeTokens()` orchestration layer without touching the root public API. The recipe remains
internal (not root-exported) until Batch 8b.

**Files likely touched**

```text
src/recipes/createSchemeTokens.ts
src/recipes/index.ts
tests/recipes/createSchemeTokens.test.ts
```

**Implementation notes**

- `createSchemeTokens()` orchestrates `createSchemeGraph`, optional `applyProfile`, `compileGraph`, and
  `exportCssVariables`.
- Return the graph, compiled token set, and CSS on success.
- Return structured problems on failure, using the shared `Result` shape.
- Do not duplicate source, validation, compiler, profile, or exporter logic.
- Do not change `src/index.ts` in this batch.
- Do not rewrite smoke or README in this batch.

**Explicit non-goals**

- No root export changes
- No public API test rewrite
- No smoke consumer changes
- No README changes
- No package name/version change

**Verification**

```bash
pnpm exec vitest run tests/recipes/createSchemeTokens.test.ts
pnpm typecheck
pnpm format
```

**Acceptance criteria**

- Recipe returns `{ ok: true, graph, tokenSet, cssVariables }` on the canonical input.
- Recipe returns structured problems when the source or profile is invalid.
- Root public API is unchanged; current wrapper tests still pass.

**Risks**

- Recipe accidentally duplicating compiler/exporter logic
- Returning partial output on failure

**Suggested commit message**

```text
feat(recipes): add createSchemeTokens orchestration
```

---

## Batch 8b — Root export cutover and public API tests

**Goal**

Replace `src/index.ts` with the deliberate graph-first allowlist and lock it with an exact runtime export-key test and
type-level negative checks. This is the public-contract cutover.

The exact allowlist is defined in section 7.4 of this document. Do not invent exports.

**Files likely touched**

```text
src/index.ts
tests/public-api.test.ts
```

**Implementation notes**

- Replace `src/index.ts` with the explicit graph-first export list from section 7.4.
- Do not use `export *` from internal directories.
- Do not export `createGraphBuilder`, cycle helpers, `formatCssColor`, `tokenKeyToCssName`, upstream adapters, or any
  legacy wrapper API.
- Add an exact runtime export-key test asserting the runtime export set matches section 7.4 byte-for-byte.
- Add type-level `@ts-expect-error` checks proving old root imports (`createTheme`, `createScheme`,
  `createColorScheme`, `MaterialTheme`, `DynamicColorScheme`, `createCssVariables`, etc.) are absent.
- Ensure no runtime export contains `Material` or `material`.
- Keep package name and version unchanged.

**Explicit non-goals**

- No smoke consumer rewrite (Batch 8c)
- No README rewrite (Batch 8d)
- No legacy re-exports, deprecation aliases, or compatibility subpath
- No package rename or version bump
- No publish

**Verification**

```bash
pnpm exec vitest run tests/public-api.test.ts
pnpm typecheck
pnpm build
pnpm format
```

Note: `pnpm smoke:consumer` and `pnpm release:check` are **intentionally red** between 8b and 8c because the smoke
consumer still imports the old wrapper API. Do not run them here. They are restored in 8c.

**Acceptance criteria**

- Root imports expose exactly the approved graph-first API from section 7.4.
- Old wrapper imports fail at type level.
- No runtime export contains `Material` or `material`.
- `dist/index.d.ts` contains no legacy public types.

**Risks**

- The largest public-contract blast radius in the sequence
- A convenience export accidentally preserving the old center
- Allowlist drifting from section 7.4

**Suggested commit message**

```text
feat(api): cut over to the graph-first public contract
```

---

## Batch 8c — Packed consumer smoke rewrite

**Goal**

Rewrite the packed-consumer smoke tooling to exercise only the graph-first API and restore `release:check`/`verify:release`.

**Files likely touched**

```text
scripts/smokeConsumer.ts
```

**Implementation notes**

- Read the package name from `package.json` instead of hardcoding `material-schemes`.
- Generate ESM, CommonJS, and TypeScript consumers using only graph-first APIs (`createSchemeTokens`,
  `dynamicSchemeSource`, `hex`, `appSurfaceProfile`, etc.).
- The smoke consumer should compile/export profile tokens and assert the CSS contains a profile variable such as
  `--theme-chrome-background`.
- Retain strict NodeNext type checking with `skipLibCheck: false`.
- Keep actual tarball installation into an isolated temporary consumer.
- Retain ESM, CommonJS, and declaration consumption checks.
- Update environment variables and temporary-directory prefixes to drop `MATERIAL_SCHEMES_*` / `material-schemes-smoke-*`
  naming in favor of package-name-derived identifiers.

**Explicit non-goals**

- No README rewrite (Batch 8d)
- No public API changes
- No package name/version change

**Verification**

```bash
pnpm smoke:consumer
pnpm release:check
```

**Acceptance criteria**

- Packed ESM, CommonJS, and strict declaration consumption succeed against the new API.
- Smoke asserts a profile-derived CSS variable is present.
- `pnpm release:check` is green again.

**Risks**

- Smoke and the public API getting out of sync
- Hardcoded package-name literals surviving in branches

**Suggested commit message**

```text
test(smoke): rewrite packed consumer for graph-first API
```

---

## Batch 8d — README rewrite

**Goal**

Rewrite README content so it documents only the graph-first API that now exists. Docs come last in this phase because
they must describe code that actually ships.

**Files likely touched**

```text
README.md
```

**Implementation notes**

- Replace the wrapper-oriented opening, install command, examples, and public API list with graph-first equivalents.
- README must state the package remains unpublished and at `0.0.0`.
- Do not claim JSON export, DTCG, lab tooling, or broad color-space source support.
- Use the current package name (`material-schemes`) until Batch 10 changes it; do not pre-rename.
- Preserve and adapt: direct dependency and bundling explanation, consumer versus maintainer Node runtime distinction,
  no TypeScript runtime dependency policy, `0.0.0` pre-release policy, moment-in-time npm availability warning, packed
  consumer verification instructions, and `pnpm verify:release` as the authoritative local release check.

**Explicit non-goals**

- No code changes
- No public API changes
- No package name/version change

**Verification**

```bash
pnpm format
pnpm verify:release
```

**Acceptance criteria**

- README examples compile against the packed tarball.
- No README example references a removed API.
- Package remains `0.0.0`.

**Risks**

- Docs drifting from actual exports
- Pre-renaming the package before Batch 10

**Suggested commit message**

```text
docs(readme): rewrite for graph-first public contract
```

---

## Batch 9 — Internalize and prune the legacy implementation

**Goal**

Move the remaining dynamic-color machinery underneath the source boundary and remove wrapper-only code.

**Files likely touched**

```text
src/sources/dynamicScheme/internal/*
src/color.ts
src/contrast.ts
src/css.ts
src/palette.ts
src/roles.ts
src/scheme.ts
src/theme.ts
src/types.ts
src/variant.ts
tests/source-policy.test.ts
```

Some root files should disappear after their needed logic is extracted.

**Implementation notes**

- Search all references before moving or deleting anything.
- Relocate only the minimum code needed to generate dynamic source values.
- Remove `MaterialTheme`, CSS convenience methods, custom colors, palette tones, and arbitrary mutation hooks.
- Keep upstream structural types private.
- Strengthen source policy:

  - no old wrapper names in `src/index.ts`
  - no public runtime export containing `Material`
  - all generated role keys use `scheme.*`
  - deprecated upstream API rules remain

- Require unchanged compiled and CSS fixtures.

**Explicit non-goals**

- No algorithm behavior change
- No role coverage change
- No dependency upgrade
- No public API expansion
- No new feature

**Verification**

```bash
pnpm check
pnpm release:check
pnpm verify:release
```

**Acceptance criteria**

- Golden outputs are unchanged.
- No public module depends on a legacy wrapper.
- Remaining upstream-specific code is under the dynamic source.
- Dead wrapper modules and tests are removed.
- Packed consumer verification remains green.

**Risks**

- A large file move masking behavior changes
- Deleting a subtle adapter workaround
- Breaking declaration generation or bundling

**Suggested commit message**

```text
refactor(source): internalize legacy dynamic scheme implementation
```

---

## Batch 10 — Conditional release-candidate identity

**Goal**

Only after human acceptance of the public contract, choose the final npm identity and prepare—but do not publish—the
first release.

**Files likely touched**

```text
package.json
pnpm-lock.yaml
README.md
CHANGELOG.md
scripts/smokeConsumer.ts
scripts/verifyRelease.ts
```

**Implementation notes**

- Run npm name checks immediately before this batch.
- Choose unscoped or scoped name based on the live result.
- Update all install/import snippets atomically.
- Change version from `0.0.0` to `0.1.0`.
- Add a `0.1.0` changelog entry.
- Keep the GitHub repository name unchanged.
- Do not add publishing automation.
- Do not run `npm publish`.

**Explicit non-goals**

- No implementation changes
- No output changes
- No repository rename
- No feature additions
- No automated publishing

**Verification**

```bash
pnpm verify:release
pnpm pack --dry-run
pnpm smoke:consumer
```

Also inspect:

```text
packed file list
dist/index.d.ts
ESM entry
CommonJS entry
package exports
README install/import strings
```

**Acceptance criteria**

- Final name is currently available or intentionally scoped.
- All package-name references agree.
- Version is `0.1.0`.
- CI is green on all three operating systems.
- Human reviewer accepts the tarball, declarations, snapshots, README, and public export list.
- No publish has occurred.

**Risks**

- Name availability changing between check and publication
- Mechanical rename omissions
- Treating passing checks as automatic approval

**Suggested commit message**

```text
chore(release): prepare color-scheme-tokens 0.1.0
```

---

# 6. Codex prompt backlog

## Prompt 1 — Core primitives

**Recommended reasoning effort: High**

```text
You are modifying the unpublished TypeScript package in this repository.

Goal:
Add the foundational ColorSchemeTokenGraph primitives: validated token keys,
validated mode keys, normalized color values, provenance, token nodes, and the
serializable graph shape.

Before adding code:
1. Search the repository for existing helpers, functions, types, tests, and
   naming/validation patterns that can be reused.
2. Read the listed files completely.
3. Do not assume the attached architecture pseudocode is production-complete.

Read first:
- docs/migration-plan.md (the control document; its data-model, result-convention,
  key grammar, hex narrowing, and ModeValues decisions are authoritative)
- package.json
- tsconfig.json
- vitest.config.ts
- src/index.ts
- src/types.ts
- src/color.ts
- tests/public-api.test.ts
- tests/source-policy.test.ts
- the attached ColorSchemeTokenGraph architecture document

Current constraints:
- Keep package name unchanged.
- Keep version at 0.0.0.
- Do not rename the repository.
- Do not change src/index.ts yet.
- Do not add runtime or development dependencies.
- Do not add tsx, ts-node, or another TypeScript runtime.
- Do not add a CLI, framework binding, plugin, lab, site, JSON exporter, or
  additional package.
- Preserve all current wrapper behavior and tests during this batch.

Scope:
Create:
- src/core/result.ts
- src/core/keys.ts
- src/core/modes.ts
- src/core/colorValue.ts
- src/core/provenance.ts
- src/core/graph.ts
- focused tests under tests/core/

Implementation requirements:
- Define shared Result<T, Problem> and ParseResult<T, Problem> in result.ts FIRST.
  Result is { ok: true; value: T } | { ok: false; problems: readonly Problem[] }.
  ParseResult is { ok: true; value: T } | { ok: false; problem: Problem }.
  These are the only sanctioned result vocabularies. Do not invent per-module
  { success }, { valid }, { error }, or { issues } shapes. Module-specific result
  names are type aliases of Result or ParseResult, not fresh shapes.
- TokenKey is a branded string.
- Token keys must be namespaced, dot-separated, lower-camel segments with AT LEAST
  TWO segments. A bare single segment is not a valid token key.
- Grammar: segment = ^[a-z][a-zA-Z0-9]*$ ; key = segment(.segment)+ .
- Reject: primary, Scheme.primary, scheme.Primary, scheme..primary, scheme.primary- .
- Add parseTokenKey() (non-throwing, ParseResult) and throwing tokenKey().
- ModeKey is a branded string.
- Add parseModeKey() (non-throwing, ParseResult) and throwing modeKey().
- Add lightMode and darkMode using the validated constructor.
- Mode keys use a documented lower-camel identifier grammar: ^[a-z][a-zA-Z0-9]*$ .
- Add normalized SrgbColor, OklchColor, DisplayP3Color, and ColorValue.
- Add parseHexColor(), hex(), and srgb255().
- hex() and parseHexColor() accept ONLY #RRGGBB and RRGGBB. Reject every other form
  (#RGB shorthand, #RRGGBBAA, rgb(), rgba(), hsl(), named colors, alpha hex).
  hex() is NOT a general CSS color parser.
- Use srgb255(r, g, b, alpha?) for authored alpha. It accepts 0..255 channels and
  0..1 alpha, normalizes to 0..1, and validates finite values and ranges.
- All public color helpers validate finite values and ranges.
- Add an internal reusable ColorValue runtime validator.
- Add ModeValue<T> = { readonly mode: ModeKey; readonly value: T }.
- Add ModeValues<T> = readonly ModeValue<T>[] (a READONLY ARRAY, not a record).
  Rationale: a string-keyed record would erase duplicate mode keys before
  validation can see them, making it impossible to detect duplicate, missing, and
  unknown mode entries. The array form preserves order and enables deterministic
  validation and serialization.
- Do NOT introduce ColorIntent in this batch. Color token nodes store concrete
  ColorValue values. An intent layer may be added later only when it has behavior.
- Add source, profile, and authored provenance variants only.
- Add ColorTokenNode (values: ModeValues<ColorValue>), AliasTokenNode, TokenNode,
  and ColorSchemeTokenGraph.
- The graph must contain only JSON-roundtrippable plain data.
- Do not use Map, Set, class instances, or functions in the public graph shape.
- Do not introduce imported/DTCG provenance.
- Follow exactOptionalPropertyTypes and noUncheckedIndexedAccess cleanly.
- Do not export these new modules from the package root in this batch.

Tests:
- Valid and invalid token keys, including single-segment rejection and the
  documented reject list.
- Valid and invalid mode keys.
- Result/ParseResult shape behavior (ok branch carries value; fail branch carries
  problems/problem).
- Hex parsing of #RRGGBB and RRGGBB only; explicit rejection of #RGB, #RRGGBBAA,
  rgb(), named colors, and malformed input.
- srgb255 channel and alpha validation.
- Runtime rejection of NaN, infinities, and out-of-range normalized values.
- ModeValues array form: a fixture with duplicate, missing, and unknown mode
  entries is representable (validation runs in a later batch, but the shape must
  not erase duplicates).
- JSON roundtrip of a representative graph.

Verification:
- Run the focused new tests.
- Run pnpm typecheck.
- Run pnpm format.
- Run the existing full test suite if feasible.
- Do not update unrelated files merely to satisfy formatting.

Final report:
Return a compact report containing:
- files added or changed
- key invariants implemented
- commands run and their outcomes
- any unresolved design issue
Do not include a proposed commit message in the report.
```

**Suggested commit message**

```text
feat(core): add validated token graph primitives
```

---

## Prompt 2 — Builder and validation

**Recommended reasoning effort: High**

```text
Goal:
Add an internal graph builder and comprehensive structural validation for
ColorSchemeTokenGraph.

Before adding code:
Search for existing helpers, functions, types, tests, and patterns. Reuse the
core validators from the previous batch rather than duplicating key, mode, or
color validation.

Read first:
- docs/migration-plan.md (result convention, ModeValues array rule, key grammar)
- src/core/keys.ts
- src/core/modes.ts
- src/core/colorValue.ts
- src/core/result.ts
- src/core/graph.ts
- all tests under tests/core/
- src/scheme.ts for existing validation style
- tests/source-policy.test.ts
- the validation section of the attached architecture document

Current constraints:
- Package remains unpublished, at version 0.0.0.
- Do not change package name, repository name, README, or src/index.ts.
- Do not add dependencies.
- No compiler, source, profile, exporter, recipe, or JSON exporter in this task.
- Preserve existing package behavior.

Scope:
Create:
- src/core/graphBuilder.ts
- src/core/validateGraph.ts
- tests/core/graphBuilder.test.ts
- tests/core/validateGraph.test.ts

Implementation requirements:
- Reuse the shared Result<T, Problem> shape from src/core/result.ts for both
  GraphBuildResult and GraphValidationResult. Do not invent new result vocabularies.
- createGraphBuilder() is internal and must not be root-exported.
- The builder supports addColor(), addAlias(), and build().
- Duplicate builder keys produce structured GraphBuildProblem values via the shared
  Result shape.
- validateGraph() returns a Result<ColorSchemeTokenGraph, GraphProblem> (or the appropriate
  GraphValidationResult alias) and does not throw for graph defects. Validation does not
  imply compilation; it returns the same graph shape after structural checks pass.
- Validate schema version and a non-empty graphId.
- Validate token and mode key grammar at runtime; do not trust brands.
- Validate at least two-segment token keys per the grammar in docs/migration-plan.md.
- Validate at least one graph mode and unique graph modes.
- Validate unique token keys.
- Validate all concrete ColorValue channels at runtime.
- Color nodes require exactly one value for every graph mode.
- Because ModeValues is a readonly array (not a record), validation can and must
  detect duplicate, missing, and unknown mode entries explicitly.
- Uniform aliases must target existing nodes.
- Mode-specific aliases require exactly one target per graph mode.
- Reject duplicate, missing, and unknown mode-specific targets.
- Detect alias cycles independently for every graph mode.
- Alias-cycle problems include the affected mode and a deterministic key path.
- Problem ordering must be deterministic.
- All problem objects use `kind` as the discriminator field (not `type`), consistent
  with the rest of the model (problem law, section 3.12 of docs/migration-plan.md).
  Each problem includes a stable `kind` value and a human-readable `message`.
- Avoid emitting duplicate reports for the same missing mode condition.
- Keep cycle-detection helpers internal.

Tests:
Cover every problem discriminator with a focused graph fixture.
Include:
- no modes
- duplicate modes
- invalid mode key
- invalid token key
- duplicate token key
- invalid color channel
- missing mode value
- duplicate mode value
- unknown mode value
- unknown alias target
- missing mode-specific target
- mode-specific unknown target
- uniform alias cycle
- a cycle present in dark mode only
- a valid graph with aliases

Verification:
- Run the two new test files.
- Run pnpm typecheck.
- Run pnpm format.
- Run existing tests to prove no regression.

Final report:
List changed files, validation categories covered, commands and outcomes, and any
remaining ambiguity. Do not include a commit message.
```

**Suggested commit message**

```text
feat(core): add graph builder and structural validation
```

---

## Prompt 3 — Compiler

**Recommended reasoning effort: High**

```text
Goal:
Compile valid token graphs into concrete per-mode color tokens with traceable
source keys and alias-resolution paths.

Before adding code:
Search for existing compiler-like, traversal, lookup, include-filter, and error
patterns. Reuse validateGraph() and current core types.

Read first:
- src/core/graph.ts
- src/core/validateGraph.ts
- src/core/graphBuilder.ts
- all tests under tests/core/
- the compiler section of the attached architecture document

Current constraints:
- Keep package name and version unchanged.
- Do not modify src/index.ts.
- Do not add dependencies.
- No source implementation, profile, CSS, JSON exporter, recipe, or README
  changes.
- Preserve existing wrapper API and tests.

Scope:
Create:
- src/core/compileGraph.ts
- tests/core/compileGraph.test.ts

Implementation requirements:
- compileGraph() calls validateGraph() internally.
- Invalid graphs return structured problems without partial output.
- Define CompileOptions with an optional include list.
- Reject unknown include keys explicitly; do not silently omit typos.
- Compile all graph nodes by default.
- Compiler include law (section 3.12 of docs/migration-plan.md): include selects
  EMITTED tokens, not dependency tokens. Dependencies may be read for resolution
  but are NOT emitted unless explicitly included. Each emitted token still records
  sourceKey and resolutionPath per mode for full traceability.
- Resolve both uniform and mode-specific aliases.
- Every CompiledModeColorValue contains:
  - mode
  - concrete ColorValue
  - sourceKey
  - resolutionPath
- sourceKey and resolutionPath are per mode.
- resolutionPath begins with the requested token and ends with the concrete
  color node.
- Preserve graph mode order.
- Preserve graph token order before later serializer canonicalization.
- Use memoization keyed by token and mode.
- Keep defensive invariant checks even after validation.
- Do not add an always-empty diagnostics field or speculative warning API.

Tests:
- concrete color node compilation
- one-hop and multi-hop uniform aliases
- mode-specific alias with different light/dark targets
- sourceKey and path assertions for both modes
- include filtering
- include emits only requested tokens, not dependency tokens
- included alias records sourceKey and resolutionPath even when dependency is not emitted
- unknown include key failure
- invalid graph validation gating
- alias cycle failure
- input graph immutability

Verification:
- Run tests/core/compileGraph.test.ts.
- Run pnpm typecheck.
- Run pnpm format.
- Run all current tests.

Final report:
List changed files, compiler semantics, commands and outcomes, and any unresolved
edge case. Do not include a commit message.
```

**Suggested commit message**

```text
feat(core): compile token graphs with per-mode alias tracing
```

---

## Prompt 4 — Dynamic scheme source

**Recommended reasoning effort: High**

```text
Goal:
Implement SchemeSource, createSchemeGraph(), dynamicColorRoleSet, and
dynamicSchemeSource() using the current dynamic-color implementation as an
internal adapter.

Before adding code:
Search thoroughly for existing role arrays, scheme generation, contrast
validation, variant mapping, ARGB conversion, role-reading logic, and tests.
Reuse or refactor those paths. Do not create a second independent implementation
of the upstream algorithm.

Read first:
- package.json
- tsup.config.ts
- vitest.config.ts
- src/color.ts
- src/contrast.ts
- src/palette.ts
- src/roles.ts
- src/scheme.ts
- src/theme.ts
- src/types.ts
- src/variant.ts
- tests/scheme.test.ts
- tests/theme.test.ts
- tests/source-policy.test.ts
- the source and role-set sections of the attached architecture document
- the attached public extraction plan

Current constraints:
- Preserve @material/material-color-utilities as a direct dependency.
- Preserve tsup noExternal bundling and Vitest inlining.
- Do not upgrade or replace the dependency.
- Keep package name unchanged and version 0.0.0.
- Do not modify the root public API yet.
- No CSS, profile, recipe, JSON exporter, custom colors, multiple-source input,
  palette overrides, tonal palette API, public spec/platform option, or package
  split.
- Do not add dependencies.

Scope:
Create:
- src/core/schemeSource.ts
- src/core/createSchemeGraph.ts
- src/sources/dynamicScheme/dynamicColorRoleSet.ts
- src/sources/dynamicScheme/createDynamicSchemeValues.ts
- src/sources/dynamicScheme/dynamicSchemeSource.ts
- src/sources/dynamicScheme/index.ts
- narrowly scoped internal adapter helpers as needed
- tests/sources/dynamicSchemeSource.test.ts
- tests/sources/roleSetCoverage.test.ts

Implementation requirements:
- SchemeSource exposes sourceId, roleSetId, and createGraph().
- createSchemeGraph() delegates to the supplied source.
- dynamicSchemeSource() accepts an opaque SrgbColor.
- Reject source alpha other than 1.
- Public variants are tonal, vibrant, expressive, and neutral only.
- Map those variants to existing internal palette styles.
- contrastLevel remains a finite number from -1 through 1.
- Preserve the current generation defaults for the first graph proof:
  specVersion 2021 and platform phone.
- Do not blindly copy the architecture document's abbreviated role array.
- Mine the current repository's complete role arrays:
  55 required roles and 4 optional roles.
- Re-key every definition under scheme.*.
- Keep palette-key-color roles because removing them would be an unproven
  regression.
- Generate one color node per available role with both light and dark values.
- Convert upstream ARGB output to normalized sRGB with unsigned-safe bit
  operations.
- Attach source provenance including sourceId and roleSetId.
- The source folder must not import profiles, recipes, or exporters.
- Existing wrapper functions may be used only behind
  createDynamicSchemeValues; they must not become part of the new public model.
- Do not change src/index.ts in this task.

Tests:
- graph creation from hex("#6750A4")
- validation succeeds
- compilation succeeds
- every required role is present
- every required role has light and dark values
- optional role presence is symmetric across modes
- all generated keys start with scheme.
- all generated nodes are color nodes
- all generated values are normalized sRGB
- role count matches the actual role-set policy
- default variant and contrast behavior
- one non-default public variant
- invalid contrast and non-opaque source rejection

Verification:
- Run the new source tests.
- Run existing scheme and source-policy tests.
- Run pnpm typecheck.
- Run pnpm build.
- Run pnpm format.
- Do not update package snapshots yet.

Final report:
List files changed, which current helpers were reused or refactored, exact role
counts, commands and outcomes, and any adapter debt that remains. Do not include
a commit message.
```

**Suggested commit message**

```text
feat(source): add dynamic scheme graph source
```

---

## Prompt 5 — Profiles

**Recommended reasoning effort: Medium**

```text
Goal:
Add immutable profile application and the built-in appSurfaceProfile.

Before adding code:
Search for existing alias-like patterns, mutation hooks, semantic naming, and
tests. In particular, inspect ModifyColorSchemeFn and current README guidance
about consumers mapping raw scheme roles to semantic aliases.

Read first:
- docs/migration-plan.md (appSurfaceProfile exact alias targets are fixed there)
- src/core/graph.ts
- src/core/validateGraph.ts
- src/core/compileGraph.ts
- src/core/result.ts
- src/sources/dynamicScheme/*
- src/types.ts
- README.md
- tests/theme.test.ts
- the profile section of the attached architecture document

Current constraints:
- Keep package name and version unchanged.
- Do not modify src/index.ts.
- Do not add dependencies.
- No product-specific profile, profile DSL, automatic contrast repair, CSS,
  recipe, JSON exporter, or framework binding.
- Do not reintroduce an arbitrary mutation callback.

Scope:
Create:
- src/profiles/profile.ts
- src/profiles/applyProfile.ts
- src/profiles/appSurfaceProfile.ts
- src/profiles/index.ts
- tests/profiles/applyProfile.test.ts

Implementation requirements:
- Reuse the shared Result shape from src/core/result.ts where profile application can
  fail (e.g. duplicate keys surfaced through validation).
- Profiles are plain serializable data objects. Do NOT introduce defineProfile(),
  alias(), or color() builder helpers. The only acceptable v0 helpers are the
  validated scalar constructors: tokenKey(), modeKey(), hex(), srgb255().
- Add ProfileAliasToken and ProfileColorToken as defined in section 3.7 of
  docs/migration-plan.md. ProfileAliasToken.target is TokenKey | ModeValues<TokenKey>.
  ProfileColorToken.values is ModeValues<ColorValue>.
- Add ColorSchemeProfile as { profileId: string; tokens: readonly ProfileToken[] }.
- applyProfile() returns a new graph and does not mutate the input.
- applyProfile() is chainable: applyProfile(applyProfile(graph, a), b). Do NOT add
  applyProfiles() accepting arrays in v0 (collision law, section 3.12).
- Alias targets may be uniform (TokenKey) or mode-specific (ModeValues<TokenKey>).
- Profile color tokens carry concrete ModeValues<ColorValue> (NOT ColorIntent;
  ColorIntent is deferred from v0).
- Profile nodes carry profile provenance.
- Alias provenance sourceKeys reflects actual configured targets.
- appSurfaceProfile uses only scheme.* targets and adds EXACTLY these uniform
  aliases (targets are fixed by docs/migration-plan.md; do not choose different
  ones):
    chrome.background           -> scheme.surface
    chrome.foreground           -> scheme.onSurface
    chrome.border               -> scheme.outlineVariant
    semantic.action.background  -> scheme.primary
    semantic.action.foreground  -> scheme.onPrimary
    semantic.danger.background  -> scheme.error
    semantic.danger.foreground  -> scheme.onError
  All seven are uniform aliases (same target in every mode). Do not pick
  scheme.background or scheme.surfaceContainerLowest instead; that is a separate
  reviewed decision, not an implementation choice.
- Do not compile or export inside profile code.
- Let validateGraph() handle duplicate keys and invalid targets (collision law:
  duplicate token keys are invalid, profiles never overwrite existing graph nodes).

Tests:
- appSurfaceProfile adds exactly the seven documented aliases with the documented
  targets.
- original graph remains unchanged.
- uniform alias provenance.
- mode-specific alias provenance.
- mode-specific alias target using ModeValues<TokenKey>.
- authored profile color.
- compilation of profiled graph.
- duplicate profile key rejected by validation (collision law).
- unknown target rejected by validation.
- chained applyProfile() calls produce a valid graph when keys do not collide.
- profile is a plain data object (no builder helpers).

Verification:
- Run tests/profiles/applyProfile.test.ts.
- Run relevant core and source tests.
- Run pnpm typecheck and pnpm format.

Final report:
List files changed, profile semantics, commands and outcomes, and any deferred
question. Do not include a commit message.
```

**Suggested commit message**

```text
feat(profiles): add profile application and app surface aliases
```

---

## Prompt 6 — CSS exporter

**Recommended reasoning effort: Medium**

```text
Goal:
Export CompiledTokenSet values as deterministic CSS variables without carrying
forward the arbitrary-record CSS helper API.

Before adding code:
Search for existing CSS name formatting, color conversion, serializer tests,
and options. Reuse proven naming behavior where compatible, but do not make the
new exporter accept old ColorScheme records.

Read first:
- docs/migration-plan.md (mode selector policy and exact color formatting rules)
- src/css.ts
- src/color.ts
- src/core/compileGraph.ts
- src/core/colorValue.ts
- src/core/result.ts
- tests/css.test.ts
- the CSS exporter section of the attached architecture document

Current constraints:
- Keep package name/version and src/index.ts unchanged.
- No dependencies.
- No CSS map API, minifier, raw var(...) passthrough, JSON exporter, StyleX,
  Tailwind, framework integration, or CLI.
- Exporter must consume CompiledTokenSet only.

Scope:
Create:
- src/exporters/formatCssColor.ts
- src/exporters/cssVariableName.ts
- src/exporters/exportCssVariables.ts
- src/exporters/index.ts
- tests/exporters/exportCssVariables.test.ts

Implementation requirements:
- formatCssColor() remains internal.
- Format normalized sRGB as modern rgb() syntax using BYTE channels (round 0..1 to
  0..255): rgb(103 80 164). Omit the alpha component when alpha is 1. Include
  " / <alpha>" when alpha is present and not 1: rgb(103 80 164 / 0.5).
- Support deterministic OKLCH and display-p3 formatting for authored graph values.
  Use a fixed significant-digit bound (e.g. six), trim meaningless trailing zeros,
  trim a trailing decimal point, and emit hue in degrees 0..360. The SAME precision
  and trimming rules apply to all color spaces.
- Never emit NaN, infinities, or negative zero (defensive check, not a formatting
  branch).
- Use bounded, stable decimal formatting and trim meaningless trailing zeros.
- Convert dot-separated lower-camel token keys to kebab-case CSS names.
- Add cssVariableName(key, prefix).
- Validate or tightly constrain variablePrefix so malformed CSS identifiers are
  not emitted.
- exportCssVariables() accepts only CompiledTokenSet.
- Exporter law (section 3.12 of docs/migration-plan.md): the exporter NEVER renames
  tokens. CSS variable names are derived mechanically from compiled token keys. All
  semantic naming happens at the graph and profile level, not at the CSS layer.
- Provenance comments (comments: 'resolutionPath') are NOT part of this batch. They
  are a follow-up feature (comment law, section 3.12).
- Mode selector policy (from docs/migration-plan.md):
    If all compiled modes are exactly { light, dark }, default selectors are
    permitted: light -> :root, dark -> [data-theme="dark"].
    If ANY non-standard mode (e.g. highContrast) is present, require explicit
    modeSelectors for EVERY mode and reject otherwise. Never silently drop a mode.
- modeSelectors, when provided, is authoritative for all modes.
- Preserve compiled token order.
- Do not resolve aliases or validate graphs in the exporter.

Tests:
- scheme.onPrimaryContainer naming
- chrome.background naming
- sRGB byte-channel formatting, with and without alpha
- OKLCH and display-p3 deterministic formatting (trailing-zero trimming)
- light and dark blocks via default selectors
- a fixture with a non-standard mode requires modeSelectors and rejects without them
- custom prefix and selector
- invalid prefix
- repeated calls return identical strings
- profiled alias values are concrete before export

Verification:
- Run exporter tests.
- Run core compiler/profile tests.
- Run pnpm typecheck, pnpm build, and pnpm format.

Final report:
List changed files, formatting decisions, commands and outcomes, and any
deliberate difference from the old CSS helper. Do not include a commit message.
```

**Suggested commit message**

```text
feat(css): export compiled token sets as CSS variables
```

---

## Prompt 7 — Deterministic fixtures

**Recommended reasoning effort: High**

```text
Goal:
Add deterministic CompiledTokenSet serialization and committed golden fixtures
that make upstream or compiler output drift visible.

Before adding code:
Search for any existing snapshot helpers, stable sorting utilities, generated
fixtures, or package-version metadata. Reuse core mode/key comparison patterns.

Read first:
- src/core/compileGraph.ts
- src/core/graph.ts
- src/sources/dynamicScheme/*
- src/profiles/*
- src/exporters/*
- all new graph/source/profile/exporter tests
- the serialization section of the attached architecture document

Current constraints:
- Do not add a public JSON exporter.
- Do not add a CLI or fixture-update script dependency.
- Do not upgrade the upstream algorithm.
- Keep package name and version unchanged.
- Do not modify src/index.ts.
- Do not add timestamps, host paths, Node versions, or unstable metadata to
  serialized output.

Scope:
Create:
- src/core/serializeTokenSet.ts
- tests/snapshots/deterministicOutput.test.ts
- tests/fixtures/dynamic-purple.compiled.json
- tests/fixtures/dynamic-purple.css

Implementation requirements:
- serializeTokenSet() returns stable formatted JSON.
- Preserve the graph-declared mode order.
- Sort tokens by TokenKey.
- Sort each token's mode values according to the graph mode order.
- Preserve resolutionPath order.
- Canonicalize nested values and provenance consistently.
- Do not merely sort the top-level modes while leaving nested mode values in a
  different order.
- Ensure invalid numbers cannot reach JSON output through normal compilation.
- Use the canonical source:
  #6750A4, tonal, contrast 0, current preserved internal defaults.
- Include a profiled fixture where useful to prove alias paths.
- Compare generated strings against committed files.
- Add a test proving that changing a concrete token value changes serialized
  output.
- Do not automatically rewrite fixtures during normal tests.

Verification:
- Run the snapshot test repeatedly.
- Run pnpm check.
- Confirm no fixture changes on the second run.
- Review fixture contents manually for sourceKey, resolutionPath, provenance,
  modes, and normalized colors.

Final report:
List changed files, canonicalization policy, fixture input, commands and
outcomes, and whether any current output surprised you. Do not include a commit
message.
```

**Suggested commit message**

```text
test(snapshots): lock deterministic compiled token output
```

---

## Prompt 8a — Recipe only

**Recommended reasoning effort: Medium**

```text
Goal:
Add the thin createSchemeTokens() orchestration layer. Do NOT change the root
public API, smoke consumer, or README in this prompt.

Before adding code:
Search for existing orchestration/helpers and reuse them. Check src/index.ts to
confirm the recipe must NOT be root-exported yet.

Read first:
- docs/migration-plan.md (public API direction and recipe contract)
- src/core/createSchemeGraph.ts
- src/core/compileGraph.ts
- src/core/serializeTokenSet.ts
- src/profiles/applyProfile.ts
- src/profiles/appSurfaceProfile.ts
- src/exporters/exportCssVariables.ts
- src/core/result.ts
- the recipe section of the attached architecture document

Current constraints:
- Keep package name and version unchanged.
- Do not modify src/index.ts.
- Do not modify scripts/smokeConsumer.ts or README.md.
- Do not add dependencies.
- Do not retain legacy exports.

Scope:
Create:
- src/recipes/createSchemeTokens.ts
- src/recipes/index.ts
- tests/recipes/createSchemeTokens.test.ts

Implementation requirements:
- createSchemeTokens() orchestrates: createSchemeGraph, optional applyProfile,
  compileGraph, exportCssVariables.
- Return the graph, compiled token set, and CSS on success.
- Return structured problems on failure using the shared Result shape.
- Do not duplicate source, validation, compiler, profile, or exporter logic.
- Do not root-export the recipe yet (that happens in Prompt 8b).

Tests:
- success path on the canonical #6750A4 + appSurfaceProfile input returns
  { ok: true, graph, tokenSet, cssVariables }.
- failure path on an invalid source returns { ok: false, problems }.
- CSS output contains a profile variable such as --theme-chrome-background.

Verification:
- Run tests/recipes/createSchemeTokens.test.ts.
- Run pnpm typecheck and pnpm format.
- Run existing tests to prove no regression.

Final report:
List files changed, recipe semantics, commands and outcomes. Do not include a
commit message.
```

**Suggested commit message**

```text
feat(recipes): add createSchemeTokens orchestration
```

---

## Prompt 8b — Root export cutover and public API tests

**Recommended reasoning effort: High**

```text
Goal:
Replace src/index.ts with the deliberate graph-first allowlist and lock it with an
exact runtime export-key test and type-level negative checks. This is the
public-contract cutover.

The exact allowlist is section 7.4 of docs/migration-plan.md. Follow it exactly; do
not invent exports and do not omit any listed export.

Before adding code:
Search for all imports from ../src, all current root exports, and every legacy
symbol that must disappear.

Read first:
- docs/migration-plan.md (section 7.4 is the authoritative allowlist)
- package.json
- src/index.ts
- all src/core files
- src/sources/dynamicScheme/index.ts
- src/profiles/index.ts
- src/exporters/index.ts
- src/recipes/index.ts
- tests/public-api.test.ts
- tsup.config.ts
- the public API section of the attached architecture document
- the attached public extraction plan

Current constraints:
- Keep package name as currently declared.
- Keep version 0.0.0.
- Do not rename the repository.
- Do not publish.
- Do not modify scripts/smokeConsumer.ts (Prompt 8c) or README.md (Prompt 8d).
- Do not add publish automation or dependencies.
- Do not retain legacy exports for compatibility.

Scope:
Modify:
- src/index.ts
- tests/public-api.test.ts

Implementation requirements:
- Replace src/index.ts with the EXACT allowlist from docs/migration-plan.md
  section 7.4 (runtime exports and type exports).
- Do not use export * from internal directories.
- Do not export createGraphBuilder, cycle helpers, formatCssColor,
  tokenKeyToCssName, validateColorValue, validateModeValues, upstream adapters,
  or any legacy wrapper API (createTheme, createScheme, createColorScheme,
  MaterialTheme, DynamicColorScheme, createCssVariables, etc.).
- Add an exact runtime export-key test that asserts the runtime export set matches
  section 7.4 byte-for-byte (no extra, no missing).
- Add type-level @ts-expect-error checks proving old root imports are absent.
- Ensure no runtime export contains Material or material.
- cssVariableName is the one deliberate convenience export decision; include it
  only if section 7.4 lists it.

Verification:
- Run tests/public-api.test.ts.
- Run pnpm typecheck and pnpm build.
- Run pnpm format.
- Inspect dist/index.d.ts for legacy exports.
- Do NOT run pnpm smoke:consumer or pnpm release:check here. They are intentionally
  red until Prompt 8c rewrites the smoke consumer.

Final report:
List the exact public runtime export names and type names, commands and outcomes,
and any legacy symbol still reachable. Do not include a commit message.
```

**Suggested commit message**

```text
feat(api): cut over to the graph-first public contract
```

---

## Prompt 8c — Packed consumer smoke rewrite

**Recommended reasoning effort: High**

```text
Goal:
Rewrite the packed-consumer smoke tooling to exercise only the graph-first API and
restore release:check and verify:release to green.

Before adding code:
Search smokeConsumer.ts for hardcoded package-name literals, MATERIAL_SCHEMES_*
environment variables, material-schemes-smoke-* prefixes, and old-API assertions.

Read first:
- docs/migration-plan.md
- package.json
- scripts/smokeConsumer.ts
- scripts/verifyRelease.ts
- src/index.ts (the new allowlist from Prompt 8b)
- tsup.config.ts

Current constraints:
- Keep package name and version unchanged.
- Do not modify src/index.ts or README.md.
- Do not add dependencies or a TypeScript runtime (tsx/ts-node).
- Retain strict NodeNext type checking with skipLibCheck false.
- Retain actual tarball installation into an isolated temporary consumer.

Scope:
Modify:
- scripts/smokeConsumer.ts

Implementation requirements:
- Read the package name from package.json instead of hardcoding material-schemes.
- Generate ESM, CommonJS, and TypeScript consumers using ONLY graph-first APIs
  (createSchemeTokens, dynamicSchemeSource, hex, appSurfaceProfile, etc.).
- The smoke consumer should compile/export profile tokens and assert the CSS
  contains a profile variable such as --theme-chrome-background.
- Retain ESM runtime, CommonJS require, and strict declaration consumption checks.
- Replace MATERIAL_SCHEMES_* env vars and material-schemes-smoke-* prefixes with
  package-name-derived identifiers.

Verification:
- Run pnpm smoke:consumer.
- Run pnpm release:check.
- Run pnpm format.

Final report:
List changed files, smoke scenarios covered, commands and outcomes. Do not include
a commit message.
```

**Suggested commit message**

```text
test(smoke): rewrite packed consumer for graph-first API
```

---

## Prompt 8d — README rewrite

**Recommended reasoning effort: Medium**

```text
Goal:
Rewrite README content so it documents only the graph-first API that now exists.
Docs come last because they must describe code that actually ships.

Before adding code:
Read the current README and identify every wrapper-oriented section, example, and
export list. Cross-check every example against src/index.ts and the smoke consumer.

Read first:
- docs/migration-plan.md (section 7.2 README opening, 7.3 install snippet, 7.4
  allowlist, and the preserve/adapt list)
- README.md
- src/index.ts
- scripts/smokeConsumer.ts
- package.json

Current constraints:
- Keep package name and version unchanged (use the current material-schemes name;
  do not pre-rename—renaming is Prompt 10).
- Do not modify code or src/index.ts.
- Do not claim JSON export, DTCG, lab tooling, or broad color-space source support.

Scope:
Modify:
- README.md

Implementation requirements:
- Replace the wrapper-oriented opening, install command, examples, and public API
  list with graph-first equivalents.
- README must state the package remains unpublished and at 0.0.0.
- Use the current package name in install/import snippets.
- Preserve and adapt: direct dependency and bundling explanation, consumer versus
  maintainer Node runtime distinction, no TypeScript runtime dependency policy,
  0.0.0 pre-release policy, moment-in-time npm availability warning, packed
  consumer verification instructions, and pnpm verify:release as the authoritative
  local release check.

Verification:
- Run pnpm format.
- Run pnpm verify:release (README examples must compile against the packed tarball).
- Manually confirm no README example references a removed API.

Final report:
List sections rewritten and sections preserved. Do not include a commit message.
```

**Suggested commit message**

```text
docs(readme): rewrite for graph-first public contract
```

---

## Prompt 9 — Legacy internalization

**Recommended reasoning effort: High**

```text
Goal:
Move the remaining upstream dynamic-color implementation under the
dynamicScheme source boundary and delete wrapper-only code without changing
generated output.

Before changing code:
1. Search every source and test reference to the legacy modules and exports.
2. Identify exactly which functions and structural types the new dynamic source
   still uses.
3. Compare current golden fixtures before and after each logical move.
4. Reuse existing helpers; do not rewrite the upstream adapter gratuitously.

Read first:
- every file under src/
- tests/source-policy.test.ts
- tests/snapshots/deterministicOutput.test.ts
- tests/fixtures/*
- tsup.config.ts
- vitest.config.ts
- scripts/smokeConsumer.ts
- README.md maintainer notes
- the attached public extraction plan

Current constraints:
- No public API additions.
- No generated-output change.
- No package name/version change.
- No dependency change.
- No custom colors, palettes, JSON exporter, CLI, site, bindings, or package
  split.
- Preserve direct dependency, bundling, Vitest inlining, and packed smoke.
- Do not add tsx or ts-node.

Scope:
- Move the minimum remaining upstream-specific implementation to:
  src/sources/dynamicScheme/internal/
- Remove dead wrapper-only code and tests.
- Strengthen source-policy tests.

Implementation requirements:
- Dynamic scheme generation has one implementation path.
- Public/root modules do not import legacy wrapper classes.
- Remove MaterialTheme and its custom-color/CSS behavior if unused.
- Remove old arbitrary-record CSS helpers if unused.
- Remove public-only contrast, blend, palette, mutation, and tonal-palette code
  if no longer required internally.
- Keep only the structural upstream types needed inside the adapter.
- Internal filenames may mention the upstream implementation when useful, but
  public exports, generated keys, README opening, and API examples must not.
- Preserve deprecated-upstream-API policy checks.
- Add policy checks for:
  no legacy names in src/index.ts
  no public Material-named runtime exports
  generated source keys all start with scheme.
- Golden compiled and CSS fixtures must remain byte-for-byte unchanged.
- Prefer mechanical moves and narrow extractions over simultaneous rewrites.

Verification:
- Run pnpm check.
- Run pnpm release:check.
- Run pnpm verify:release if the environment supports the maintained Node
  runtime.
- Compare all fixture hashes before and after.
- Inspect generated declarations.

Final report:
List deleted, moved, and retained implementation files; prove whether fixtures
changed; list commands and outcomes; identify any remaining intentional
upstream coupling. Do not include a commit message.
```

**Suggested commit message**

```text
refactor(source): internalize legacy dynamic scheme implementation
```

---

## Prompt 10 — Conditional release candidate

**Recommended reasoning effort: High**

```text
Run this prompt only after a human has explicitly accepted:
- the graph data model
- role coverage and source defaults
- the exact public export list
- CSS output
- golden fixtures
- the compatibility decision
- the README positioning

Goal:
Choose the live npm package name and prepare version 0.1.0 without publishing.

Before editing:
Search all files for package-name, repository-name, version, install, import,
temporary-directory, and environment-variable literals. Check existing helpers
before adding rename logic.

Read first:
- package.json
- pnpm-lock.yaml
- README.md
- src/index.ts
- tests/public-api.test.ts
- scripts/smokeConsumer.ts
- scripts/verifyRelease.ts
- .github/workflows/release-check.yml
- all golden fixtures
- the release policy in the current README
- the attached public extraction plan

Current constraints:
- Do not rename the GitHub repository.
- Do not publish.
- Do not add publish automation.
- Do not add dependencies or features.
- Keep one package.
- Preserve packed ESM, CJS, and declaration verification.
- Treat any previous npm availability result as stale.

Required precondition:
Immediately before editing, run:
  npm view color-scheme-tokens name version --json
  npm view @chromavert/color-scheme-tokens name version --json

Package-name decision:
- Use color-scheme-tokens if it is currently available and that unscoped
  identity is accepted.
- Otherwise use @chromavert/color-scheme-tokens.
- Report the exact command outcomes.
- Do not infer availability from an older result.

Implementation requirements:
- Update package.json name to the accepted final name.
- Change version from 0.0.0 to 0.1.0.
- Update description and keywords to the graph/compiler product.
- Keep repository and issue URLs pointed at the current repository.
- Update the lockfile through pnpm, not by hand.
- Add CHANGELOG.md with an honest 0.1.0 entry.
- Replace README opening with the accepted graph-first wording.
- Use the exact chosen package name in install and import snippets.
- Include basic and lower-level graph usage.
- Document the direct upstream dependency and bundling constraint without
  making Material the product identity.
- Document pnpm verify:release as the authoritative local release check.
- Ensure smoke tooling remains package-name agnostic where possible.
- Do not run npm publish or pnpm publish.

Verification:
- Run pnpm verify:release.
- Run pnpm pack --dry-run.
- Run pnpm smoke:consumer.
- Inspect the packed file list.
- Inspect dist/index.d.ts.
- Confirm ESM and CJS entry points.
- Search the README, scripts, package metadata, and tests for stale install or
  import names.
- Confirm the repository name itself was not changed.
- Confirm no publish workflow or script was added.

Final report:
Return:
- chosen package name
- npm availability command outcomes
- files changed
- final version
- verification commands and outcomes
- packed tarball contents summary
- any release blocker
Do not publish and do not include a commit message.
```

**Suggested commit message**

```text
chore(release): prepare color-scheme-tokens 0.1.0
```

---

# 7. Public API decision gate

The first release must not proceed until the following single decision is accepted as a complete contract.

## 7.1 Package name

Preferred:

```text
color-scheme-tokens
```

Fallback:

```text
@chromavert/color-scheme-tokens
```

Do not make the final choice from today’s availability. Check immediately before release preparation:

```bash
npm view color-scheme-tokens name version --json
npm view @chromavert/color-scheme-tokens name version --json
```

A 404 is a moment-in-time observation, not a reservation.

## 7.2 README opening

Recommended release wording:

```md
# color-scheme-tokens

Stable color scheme tokens for TypeScript apps.

color-scheme-tokens turns generated or authored color schemes into stable,
typed, inspectable token graphs and compiles them into CSS variables for
TypeScript apps.

Dynamic color is the first scheme source. Profiles map scheme roles into
product semantics. The compiler validates and resolves aliases. Deterministic
serialization makes generated-output drift reviewable.
```

Use the scoped name in the heading and prose if the scoped fallback is selected.

Do not claim JSON export until a distinct JSON exporter actually ships.

## 7.3 Install snippet

Unscoped:

```bash
pnpm add color-scheme-tokens
```

Scoped:

```bash
pnpm add @chromavert/color-scheme-tokens
```

Every TypeScript import in the README, smoke test, and generated examples must use the selected name.

## 7.4 Exact public runtime exports

Recommended first-release values/functions:

```text
tokenKey
parseTokenKey
modeKey
parseModeKey
lightMode
darkMode

hex
srgb255

createSchemeGraph
validateGraph
compileGraph
serializeTokenSet

dynamicSchemeSource

applyProfile
appSurfaceProfile

exportCssVariables

createSchemeTokens
```

Deliberate open decision:

```text
cssVariableName
```

`cssVariableName` is useful for consumers that need to reference a generated variable name consistently. It is a
convenience export, not a core primitive. Include it only as an explicit, reviewed decision; do not let it appear
accidentally. If included, it joins the runtime allowlist above.

Deliberately omitted from the public runtime for now (available internally, can be elevated later only as a reviewed
decision):

```text
parseHexColor        (non-throwing counterpart to hex(); consumers use throwing hex() in v0)
dynamicColorRoleSet  (consumers discover roles by generating a graph, not by importing the role set)
```

Recommended public types:

```text
Result
ParseResult

TokenKey
TokenKeyResult
ModeKey
ModeKeyResult

SrgbColor
OklchColor
DisplayP3Color
ColorValue

ModeValue
ModeValues

TokenProvenance
ColorTokenNode
AliasTokenNode
TokenNode
ColorSchemeTokenGraph

GraphBuildProblem
GraphBuildResult
TokenGraphProblem
GraphValidationResult

SchemeSource
SchemeRoleDefinition
SchemeRoleSet

DynamicSchemeVariant
DynamicSchemeSourceOptions

ProfileToken
ColorSchemeProfile

CompileOptions
CompileProblem
CompiledModeColorValue
CompiledColorToken
CompiledTokenSet
CompileResult

CssVariableOptions
CssVariableModeSelectors

SchemeTokensRecipeOptions
SchemeTokensRecipeResult
```

`ColorIntent` is intentionally absent: it is deferred from v0. Color token nodes store concrete `ColorValue`. Add an
intent layer later only when it has behavior. `TokenKeyResult` and `ModeKeyResult` are `ParseResult` aliases (single
problem); `GraphBuildResult`, `GraphValidationResult`, and `CompileResult` are `Result` aliases (multiple problems).

Explicitly not public:

```text
createGraphBuilder
detectAliasCycles
validateModeValues
validateColorValue
formatCssColor
tokenKeyToCssName
upstream adapter helpers
PaletteStyle
Variant
ContrastLevel
MaterialTheme
DynamicColorScheme
createTheme
createScheme
createColorScheme
createPalette
getPaletteColors
createCssVarMap
serializeCssVarMap
createCssVariables
createSchemeCssVariables
MATERIAL_* constants and types
ColorIntent
```

## 7.5 Compatibility story

The compatibility story is:

> **There is no public legacy contract because the wrapper package was never released.**

Therefore:

- Do not publish `material-schemes`.
- Do not add legacy root exports.
- Do not add a `legacy` subpath.
- Do not add deprecated aliases.
- Do not publish a facade package.
- Do not write a user migration guide.
- Repository history may retain the old implementation; the package contract does not.

## 7.6 Version bump

Keep:

```jsonp
"version": "0.0.0"
```

through implementation, consolidation, snapshot review, public cutover, and release-candidate review.

Only after the contract is accepted:

```jsonp
"version": "0.1.0"
```

## 7.7 Release gate

All must be true:

1. Exact runtime and type export allowlists are accepted.
2. No legacy wrapper export remains.
3. All current required dynamic roles are represented as `scheme.*`.
4. Source defaults are documented and accepted.
5. Dynamic output and CSS golden fixtures are reviewed.
6. Profile aliases and per-mode resolution paths are proven.
7. README examples compile against the packed tarball.
8. ESM runtime smoke passes.
9. CommonJS runtime smoke passes.
10. Strict NodeNext declaration smoke passes with `skipLibCheck: false`.
11. `pnpm verify:release` passes.
12. CI passes on Ubuntu, Windows, and macOS.
13. The live npm name check has just been performed.
14. Package name, version, README, manifest, lockfile, smoke consumer, and changelog agree.
15. The packed file list contains only intended files.
16. Generated declarations contain no legacy public types.
17. No publish automation has been added.
18. A human explicitly approves publication.

Passing commands is necessary but not sufficient.

---

# 8. Risk register

| Risk                                                                        | Why it is serious                                                                                                 | Mitigation                                                                                                                                          |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public API freezes the wrong center**                                     | Once released, wrapper factories and Material-branded classes would require a compatibility story.                | Complete the hard cutover before `0.1.0`; enforce an exact export allowlist and negative legacy type tests.                                         |
| **Upstream algorithm drift**                                                | A dependency patch can alter every generated value while TypeScript still passes.                                 | Keep a direct dependency, bundle it, use a frozen lockfile, consider an exact manifest pin, and require golden-diff review for every upgrade.       |
| **Output snapshot churn**                                                   | Frequently changing fixtures become ignored and stop protecting anything.                                         | Use one canonical fixture input, stable serialization, deterministic ordering, and separate snapshot changes from refactors or dependency upgrades. |
| **Accidental Material-owned naming**                                        | `material.*`, `MaterialTheme`, or `createMaterial...` would re-center the package around its first source.        | Use `scheme.*`, `dynamicSchemeSource`, source-policy tests, exact public export tests, and a graph-first README opening.                            |
| **Compatibility residue becomes doctrine**                                  | Temporary convenience aliases or wrappers tend to survive and become supported behavior.                          | No public facade; mark bridges internal; schedule their relocation/deletion immediately after public cutover.                                       |
| **Over-large Codex rewrite**                                                | A single rewrite can alter algorithm behavior, API shape, snapshots, docs, and packaging simultaneously.          | Use the ordered prompts; defer root-index changes; require focused tests and a compact report after each batch.                                     |
| **Docs get ahead of implementation**                                        | README claims such as JSON export or broad color-space source support would become false promises.                | Rewrite public positioning only after code exists; do not mention JSON, DTCG, lab tooling, or unsupported source spaces.                            |
| **Consumer smoke fails after package-shape changes**                        | Unit tests can pass while ESM, CommonJS, declarations, or tarball contents are broken.                            | Update smoke atomically with the public cutover; derive package name from `package.json`; retain ESM/CJS/strict-type checks.                        |
| **Role coverage regresses from 59 enumerated roles to the 28-role example** | The new architecture would support less than the current wrapper despite claiming a stronger substrate.           | Mine `src/roles.ts`; require all 55 current required roles and track the four optional roles explicitly.                                            |
| **Branded types create false confidence**                                   | JavaScript consumers or deserialized data can bypass TypeScript brands and supply invalid strings or colors.      | Validate key grammar, mode grammar, schema version, graph structure, and color ranges at runtime.                                                   |
| **Dynamic source falsely accepts wide-gamut input**                         | The current upstream adapter is ARGB/sRGB-based; accepting OKLCH/P3 without conversion would misrepresent colors. | Make `dynamicSchemeSource.sourceColor` an opaque `SrgbColor` initially. Keep wider spaces available for authored graph colors only.                 |
| **Mode-specific alias cycle is missed**                                     | A graph may be valid in light mode and cyclic in dark mode.                                                       | Perform cycle detection per mode and include mode plus a stable cycle path in the problem.                                                          |
| **Serializer is only superficially deterministic**                          | Sorting top-level tokens while leaving nested mode values unstable still creates platform/order churn.            | Canonicalize token order and every token’s mode-value order using graph mode indices.                                                               |
| **Current default output changes during the architecture pivot**            | It becomes impossible to distinguish architectural bugs from intended algorithm changes.                          | Preserve current 2021/phone/tonal/contrast-zero defaults for the first fixture; change defaults only in a separate reviewed event.                  |
| **Release tooling runtime is “fixed” with a new TS runner**                 | Adding `tsx` or `ts-node` breaks the deliberate dependency posture.                                               | Keep Node’s direct TypeScript execution and Node 24.12 CI; document the maintainer-runtime distinction.                                             |
| **pnpm build policy is weakened**                                           | Broad build approval can permit unreviewed transitive install scripts.                                            | Preserve the exact `allowBuilds` policy; review any esbuild version change instead of approving all builds.                                         |
| **npm name check becomes stale**                                            | A name available during planning may be taken before publication.                                                 | Perform the check only at the release-candidate gate and repeat it immediately before any eventual manual publish.                                  |

---

# 9. Final recommendation

Run **Batch 0** first (commit this dossier as the control document), then **Codex Prompt 1: Core primitives**.

Prompt 1 establishes the invariants that every later layer depends on—validated keys, validated modes, normalized
colors, the shared `Result`/`ParseResult` shape, array-based `ModeValues`, serializable nodes, and the graph
shape—without touching the current root exports, upstream adapter, package identity, README, bundling, or packed-consumer
smoke.

The Prompt 1 in section 6 has been patched to lock the foundations that would otherwise become public-contract residue:
`ModeValues` is a readonly array (not a record) so validation can detect duplicate, missing, and unknown modes;
`ColorIntent` is deferred from v0; token keys require at least two segments; `hex()` accepts only `#RRGGBB`/`RRGGBB`;
and the shared result vocabulary is defined before any parser-specific result type.

Starting with the dynamic source would be weaker: it would force the new architecture to depend immediately on
unresolved key, mode, color, and validation decisions and would encourage Codex to reshape the existing wrapper
implementation in one oversized pass. Prompt 1 has the smallest blast radius and creates the clearest review boundary.

The public-contract foundations that must not be left to Codex invention are now locked in this document: the
`ModeValues` array shape, the absence of `ColorIntent`, the shared `Result`/`ParseResult` convention, the exact
`appSurfaceProfile` alias targets, the CSS mode-selector and color-formatting rules, the public export allowlist in
section 7.4, and the Batch 8 split into 8a–8d to keep the cutover blast radius small.

The invariant laws in section 3.12 further lock: `include` emits requested tokens only (dependencies are read, not
emitted); aliases support mode-specific targets via `ModeValues<TokenKey>`; duplicate keys are invalid and never
overwritten; the CSS exporter never renames tokens; provenance comments are optional, off by default, and deferred
from the first exporter slice; and all problems use `kind` discriminators with human-readable messages. Profile
composition is chainable in v0, not array-based. Profiles are plain serializable data objects with no builder helpers
beyond validated scalar constructors.
