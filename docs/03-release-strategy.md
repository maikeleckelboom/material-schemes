# What This Is, What You Have, and How to Ship It

> A grounded read of the architecture against what exists in the three repos.
> Written with the explicit constraint: **no throwing away what's already built.**

---

## The honest inventory

### `material-schemes` / `@chromavert/material` (dev branch)

This is your most mature codebase. What you actually have:

| What exists                                           | What the architecture calls it         |
|-------------------------------------------------------|----------------------------------------|
| `MaterialTheme` class                                 | The Material dialect — done            |
| `DynamicColorScheme` extending `DynamicScheme`        | Dialect graph node generator — done    |
| `PaletteStyle` typesafe enum (9 variants)             | Scheme variant selector — done         |
| `ContrastLevel` typesafe enum                         | Contrast policy — done                 |
| Per-palette overrides (primary, secondary, tertiary…) | Multi-source color input — done        |
| `createColorScheme()`                                 | Token extraction — partially done      |
| `colorSchemeToCssVars()`                              | CSS variable exporter — partially done |
| Light/dark scheme pair in `MaterialTheme`             | Mode-keyed output — done               |
| Custom color group support                            | Extended color slots — done            |

**What's missing from the architecture:**

- The graph object (`ColorSchemeTokenGraph`) as a durable intermediate artifact
- The profile/alias layer
- A compiler that resolves aliases and carries diagnostics
- Provenance on tokens
- Snapshot-stable serialization
- Validated token keys with grammar enforcement

**Verdict:** You have the Material dialect layer implemented in depth. That's the hardest, most domain-specific part.
The graph/compiler/profile machinery wraps around it, not under it.

---

### `material-schemes-library` (dev branch)

An earlier, cleaner functional API:

- `createScheme()`, `createTheme()`, `createColorScheme()` — functional wrappers
- `createCssVarMap()`, `serializeCssVarMap()`, `createCssVariables()` — CSS export
- Zod validation on inputs
- `Variant`, `ContrastLevel` as config objects

This is the prototype that proved the API shape. The `@chromavert/material` repo is the evolved version of this.

---

### `material-schemes-lab` (dev branch)

Visual lab for exploring the scheme output. This is the proof tool — it should eventually visualize the graph, not just
swatches.

---

## The two paths to release

### Path A: Release the Material dialect now

Ship `@chromavert/material` as a polished, focused library that does exactly what it does today — well. No graph model.
No profiles. No compiler pipeline.

**What you'd release:**

```ts
import {dynamicMaterialTheme, dynamicColorScheme, PaletteStyle, ContrastLevel} from "@chromavert/material"

const theme = dynamicMaterialTheme({
  sourceColor: "#6750A4",
  style: PaletteStyle.Vibrant,
  contrastLevel: ContrastLevel.High,
})

// theme.schemes.light, theme.schemes.dark
// theme.palettes.primary, etc.
// theme.customColors
```

With CSS export:

```ts
const css = colorSchemeToCssVars(theme.schemes.light, {selector: ":root"})
```

**What makes this releasable right now:**

- Multi-variant support (9 variants)
- Per-palette color overrides
- Contrast levels
- Custom extended colors
- Light/dark pair
- TypeScript-first, class-based, well-typed

**What it is in the market:**
A friendlier, more ergonomic API on top of `@material/material-color-utilities`. That library is powerful but raw. Your
package is the layer that makes it usable without understanding its internals.

**Who needs this:**

- Frontend developers building Material 3 apps
- Anyone trying to generate Material color systems in JavaScript without reading the raw MCU docs
- Design system engineers who need contrast and variant control

**What to call it:** `@chromavert/material` is fine. Or `material-schemes` (which was the library package name). The
name should reflect that it generates *schemes*, not that it *is* Material.

---

### Path B: Add the graph layer, then release both

Build the graph/profile/compiler architecture described in the two design docs, with `@chromavert/material` as the
Material dialect implementation.

**What you'd release:**

```ts
// @chromavert/core — graph, validator, compiler, exporters
// @chromavert/material — material dialect (wraps existing code)
// @chromavert/profiles — generic profile utilities + built-in profiles
```

**Timeline:**

- Path A can ship within a sprint of cleanup
- Path B adds 4–8 weeks of real architecture work on top of Path A

---

## What "hard feelings towards changing things" means in practice

The architecture documents describe a *wrapper layer* around your existing code, not a replacement.

Your existing `MaterialTheme`, `DynamicColorScheme`, `PaletteStyle`, and `ContrastLevel` are the dialect internals. They
don't change. The graph model is the public contract that sits above them.

The translation looks like this:

```ts
// Current:
const theme = new MaterialTheme({sourceColor: "#6750A4"})
const css = colorSchemeToCssVars(theme.schemes.light)

// With graph layer:
const graphResult = materialDialect.createGraph({
  graphId: "brand-purple",
  sourceColor: {space: "srgb", r: 103, g: 80, b: 164},
})
// Internally, materialDialect still calls new MaterialTheme(...)
// It just wraps the output as TokenNode[]
```

The `MaterialTheme` class stays. The graph model is a new surface, not a replacement surface.

---

## The minimum viable release candidate

If you shipped today, the honest list of what needs to happen first:

### Must-have for release

- [ ] `package.json` version set to `0.1.0` (not `0.0.0`)
- [ ] Public exports are deliberate — not `export * from './internals'`
- [ ] `README.md` with installation, basic usage, and API surface
- [ ] At least one snapshot/integration test proving CSS output stays stable
- [ ] `@material/material-color-utilities` as a peer dependency, not a bundled dep
- [ ] TypeScript declaration files ship correctly (`dist/index.d.ts`)

### Should-have

- [ ] One clear entry point — right now `packages/core` has `export * from './theme'`, `export * from './utils'`, etc.
  That should resolve to a clean flat public API
- [ ] Input validation with readable errors (you have Zod in the library prototype — consider bringing that in or
  replacing with typed runtime checks)
- [ ] A demo page or playground that shows the actual output

### Nice-to-have

- [ ] JSDoc on all public types and functions
- [ ] Changelog
- [ ] `CONTRIBUTING.md`

---

## The name question

Three repos, three names. Before release, pick one.

Options in play:

- `@chromavert/material` — scoped to your org, clear it's Material-specific
- `material-schemes` — what the library prototype was called, descriptive
- `color-scheme-tokens` — what the architecture docs envision (fits the graph model better, more generic)

**Recommendation for Path A:** `@chromavert/material` — clean, owned by you, accurate.

**Recommendation for Path B:** `@chromavert/core` for the graph layer, `@chromavert/material` for the dialect. The
`@chromavert` namespace becomes the brand.

---

## What the lab becomes

The lab should be the living proof, not a demo. For release:

- Show the raw dialect graph tokens
- Show alias resolution through a profile
- Show the compiled token set
- Show CSS output with a live color picker
- Show snapshot diff between two source colors

That is your selling document. The lab proves the architecture is real.

---

## The sentence that governs the release decision

**If someone imports your package tomorrow, what problem does it solve for them that they couldn't solve by reading
the `@material/material-color-utilities` README?**

The answer right now: **multi-variant Material schemes with per-palette overrides and CSS variable export, without
reading MCU internals.**

That is a real problem. That is a real release.

The graph layer is what makes it a *platform* instead of a library. That can come after the first release.

---

## Recommended next actions

1. **Decide: Path A or Path B for v0.1.**
   Path A is shippable now with cleanup. Path B is the right architecture but takes longer.

2. **If Path A:** Freeze the public API surface of `@chromavert/material`. Document it. Write one snapshot test.
   Publish.

3. **If Path B:** Write the graph model first (`ColorSchemeTokenGraph`, `validateGraph`, `compileGraph`). Then wire
   `MaterialTheme` as the dialect. Then add profiles. Then publish both packages together.

4. **In both cases:** The lab stays running and gets connected to the real package output, not a prototype.

5. **The `material-schemes-library` repo:** It has proven what it needed to prove. It can be archived or folded into the
   monorepo as a reference. The `@chromavert/material` monorepo is the canonical codebase.
