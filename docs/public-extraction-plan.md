# Public Extraction Plan

> Which repo becomes canonical. What to mine. What to archive. How to get to v0.1 without publishing the wrong thing.

---

## Constraint

**Mine existing repos aggressively. Only the graph-first package becomes canonical.**

Existing code is evidence. It is not doctrine. The constraint is not "no throwing away what's built." The constraint
is "no shipping an API that predates the real architecture."

**Do not publish the old wrapper path.** A direct dynamic-color wrapper without graph/profile/compiler does not claim
the new idea. It also forces a public API freeze before the real architecture exists.

---

## Repository decision

Before implementation begins, decide the public package identity and repo role explicitly.

Canonical package:

```text
color-scheme-tokens
```

Canonical concept:

```text
ColorSchemeTokenGraph
```

Canonical public source:

```text
dynamicSchemeSource
```

Canonical scheme role namespace:

```text
scheme.*
```

Do not expose the first implementation through names such as `materialDialect`, `material.*`, or
`createMaterialSchemeTokens`.

---

## Repo inventory

### `material-schemes` / `@chromavert/material` - canonical implementation target

This is the implementation codebase. The graph/compiler/profile layer gets built here, alongside the existing dynamic
color implementation.

What exists and is worth keeping:

| Existing code                             | Architectural role                                       |
|-------------------------------------------|----------------------------------------------------------|
| `MaterialTheme`                           | Dynamic scheme source internals                          |
| `DynamicColorScheme`                      | Dynamic scheme source internals                          |
| `PaletteStyle` typesafe enum (9 variants) | Source variant selector                                  |
| `ContrastLevel` typesafe enum             | Source contrast input                                    |
| Per-palette color overrides               | Multi-source color input, not in v0 public scope         |
| `createColorScheme()`                     | Token extraction, to be replaced by source graph builder |
| `colorSchemeToCssVars()`                  | CSS export prior art, superseded by exporter layer       |
| Custom color group support                | Extended color source behavior, not in v0 scope          |

What changes: these types remain internal implementation assets. The public source is `dynamicSchemeSource()`, and its
graph output uses `scheme.*` keys.

What does not change: existing implementation code may be reused internally. It must not define the public package
identity.

### `material-schemes-library` - prior art, to be archived

Earlier functional API prototype. Useful for mining:

- `Variant` / `ContrastLevel` config objects
- `createCssVarMap` / `serializeCssVarMap` CSS export ideas
- `createScheme` / `createTheme` functional wrapper ideas

After mining is complete: archive this repo. Do not maintain two implementations.

### `material-schemes-lab` - proof tooling

The lab stays live. It becomes an inspector for the graph, not just a swatch viewer. See `lab-proof-plan.md`.

---

## What the published package is NOT

- Not a nicer wrapper around an upstream dynamic color utility
- Not a design-system-branded package
- Not a theme generator
- Not a CSS variable utility

What it IS:

> A compiler for color-scheme token graphs. Dynamic color is the first scheme source. Full modern dynamic color role
> coverage is the conformance bar.

---

## Package identity

```text
name:     color-scheme-tokens
version:  0.1.0
license:  MIT
```

Tagline:

```text
Stable color scheme tokens for TypeScript apps.
```

README opening paragraph:

```text
color-scheme-tokens turns generated or authored color schemes into stable,
typed, inspectable, exportable token graphs for TypeScript apps.

Dynamic color is the first scheme source.
Profiles map scheme roles into product semantics.
The compiler resolves and validates.
Exporters produce CSS and JSON.
Snapshots make drift visible.
```

---

## v0 implementation sequence

Work in this order. Each step is shippable as an internal milestone before the next begins.

### Step 1 - Core types

Files: `core/keys.ts`, `core/modes.ts`, `core/colorValue.ts`, `core/colorIntent.ts`, `core/provenance.ts`,
`core/graph.ts`

Deliver:

- `TokenKey` and `ModeKey` branded types
- `parseTokenKey` and `tokenKey` helpers
- `lightMode`, `darkMode` constants
- `ColorValue` (srgb, oklch, display-p3) with all channels normalized 0..1
- `parseHexColor()`, `hex()`, and `srgb255()` input helpers with validation
- `ColorIntent`
- `ModeValue<T>` and `ModeValues<T>`, not Record
- `TokenProvenance` with source, profile, authored, imported variants
- `ColorTokenNode`, `AliasTokenNode`, `TokenNode`
- `ColorSchemeTokenGraph`

No validation logic yet. No source implementation yet.

---

### Step 2 - Graph builder and validation

Files: `core/graphBuilder.ts`, `core/validateGraph.ts`

Deliver:

- `createGraphBuilder` with `addColor`, `addAlias`, `build`
- `validateGraph` covering:
  - graph has at least one mode
  - duplicate graph modes
  - duplicate token keys
  - missing mode values
  - duplicate mode values
  - unknown mode values
  - unknown alias targets
  - missing mode alias targets
  - alias cycles
- `TokenGraphProblem` union, one name only
- `GraphValidationResult`

Tests: write validation failure cases before moving on.

---

### Step 3 - Scheme source interface

Files: `core/schemeSource.ts`, `core/createSchemeGraph.ts`

Deliver:

- `SchemeSource`
- `CreateSchemeGraphOptions`
- `createSchemeGraph(options): GraphBuildResult`

Constraint: the public interface is source-centered. Do not introduce dialect terminology.

---

### Step 4 - Dynamic scheme source

Files: `sources/dynamicScheme/dynamicColorRoleSet.ts`, `sources/dynamicScheme/createDynamicSchemeValues.ts`,
`sources/dynamicScheme/dynamicSchemeSource.ts`

Deliver:

- `dynamicColorRoleSet` with required `scheme.*` keys
- `createDynamicSchemeValues(sourceColor: ColorValue)` wrapping existing implementation internals
- `dynamicSchemeSource(options): SchemeSource`
- Input accepts `ColorValue` (callers use `hex()` or `srgb255()`)
- Output: `GraphBuildResult` containing `ColorSchemeTokenGraph` with `scheme.*` keys

Constraint: no CSS, no profile, no exporter references in this folder.

Tests:

- create a graph from `hex("#6750A4")`
- assert node count matches `dynamicColorRoleSet.roles.length`
- assert all generated role keys start with `scheme.`
- assert every required role has exactly one light value and one dark value
- assert role-set conformance passes for at least 28 roles across 2 modes

---

### Step 5 - Profile model

Files: `profiles/profile.ts`, `profiles/applyProfile.ts`, `profiles/appSurfaceProfile.ts`

Deliver:

- `ProfileToken` union (alias | color)
- `ColorSchemeProfile`
- `applyProfile(graph, profile): ColorSchemeTokenGraph`
- `appSurfaceProfile` built-in profile using `scheme.*` targets

Test: apply `appSurfaceProfile` to a dynamic scheme graph, assert alias nodes appear, assert alias provenance carries
correct `profileId` and `sourceKeys`.

---

### Step 6 - Compiler

Files: `core/compileGraph.ts`

Deliver:

- `CompileOptions`
- `CompileDiagnostic`
- `CompiledModeColorValue`
- `CompiledColorToken`
- `CompiledTokenSet`
- `CompileResult`
- `compileGraph(graph, options): CompileResult`
- validation called internally
- aliases resolved to concrete color values
- each compiled mode value carries `sourceKey` and `resolutionPath`

Tests:

- compile a profiled graph
- assert alias tokens resolve to correct source keys and concrete color values for both modes
- test include filter
- test mode-specific alias with different light/dark targets
- test that a cycle returns `ok: false`

---

### Step 7 - Exporters

Files: `exporters/formatCssColor.ts`, `exporters/exportCssVariables.ts`, `exporters/exportJsonTokens.ts`

Deliver:

- `formatCssColor(value: ColorValue): string`
- `tokenKeyToCssName(key: TokenKey): string`
- `cssVariableName(key, prefix): string`
- `exportCssVariables(tokenSet, options): string`
- `exportJsonTokens(tokenSet): JsonTokenDocument`

Tests:

- assert `scheme.onPrimaryContainer` becomes `--theme-scheme-on-primary-container`
- assert `chrome.background` becomes `--theme-chrome-background`
- snapshot CSS output for a known input
- JSON export preserves full provenance and per-mode source paths

---

### Step 8 - Snapshot serialization

File: `core/serializeTokenSet.ts`

Deliver:

- `serializeTokenSet(tokenSet): string` with deterministic JSON and sorted tokens, modes, diagnostics

Tests:

- two compilations of the same input produce identical output
- changing one generated role changes the snapshot

---

### Step 9 - Recipe API

File: `recipes/createSchemeTokens.ts`

Deliver:

- `SchemeTokensRecipeOptions`
- `SchemeTokensRecipeResult`
- `createSchemeTokens(options): SchemeTokensRecipeResult`
- recipe supports `source`, `profile`, `compile`, and `css` options

Tests:

- simple usage: hex input -> CSS string output
- profiled usage: hex input + profile -> CSS with profiled tokens only via `compile.include`

---

### Step 10 - Public API surface and index

File: `index.ts`

Deliver:

- deliberate exports only
- no `export *` from internal modules
- all public types exported
- all public functions exported
- internal helpers (`createGraphBuilder`, `detectAliasCycles`, etc.) not exported
- no public `material*` names

---

### Step 11 - Release checklist

- [ ] `version: "0.1.0"` in `package.json`
- [ ] Upstream dynamic color implementation is a direct dependency with a pinned range if used
- [ ] Public API contains `dynamicSchemeSource`, not implementation-branded names
- [ ] Public generated roles use `scheme.*`, not implementation-branded keys
- [ ] `package.json` `exports` field covers `.` correctly with types, import, require
- [ ] All public functions have JSDoc
- [ ] All public types have JSDoc
- [ ] `README.md` includes installation, basic usage, advanced usage, API reference link
- [ ] `CHANGELOG.md` has a v0.1.0 entry
- [ ] All snapshots committed
- [ ] All tests pass
- [ ] Dry run: `npm pack` and verify dist shape
- [ ] Publish to npm under `color-scheme-tokens`

---

## What to archive

After v0.1 ships:

- `material-schemes-library` - archive. Mining complete. No further maintenance.
- `material-schemes-lab` - stays live as inspector tooling.
- `material-schemes` / `@chromavert/material` - either rename to `color-scheme-tokens` or keep as the repo host with the
  package under the new name.

---

## What does not ship in v0

Not in v0. Not in the API. Not in the README.

- DTCG exporter
- TypeScript constants exporter
- StyleX exporter
- CLI
- Image extraction
- SSR pipeline
- Gamut policy controls
- Automatic contrast repair
- Theme editor
- Tailwind plugin
- React/Vue bindings
- Dekzer theme package
- Multiple npm packages / monorepo split

These go in a `ROADMAP.md` if documentation is needed. They do not appear in the API surface.

---

## The thing worth claiming

Not: "better Material colors."

This:

> **ColorSchemeTokenGraph turns generated or authored color schemes into stable, typed, inspectable, exportable token
graphs for TypeScript apps.**
