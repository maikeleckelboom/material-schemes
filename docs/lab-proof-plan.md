# Lab Proof Plan

> The lab proves the graph. Not just swatches.

---

## Purpose

The lab is the living inspection tool for the architecture. It demonstrates that the graph/compiler/exporter pipeline is
real and correct. It is not a theme editor. It is not a design handoff tool.

The lab should be able to answer:

- Where does this token come from?
- What does it resolve to in each mode?
- Which source role ultimately owns this value?
- What does the compiled output look like in CSS and JSON?
- Does the generated scheme satisfy the full dynamic role-set coverage bar?

---

## Source

The lab connects directly to the `color-scheme-tokens` package, not a prototype or fork. If the package changes, the lab
reflects it.

The lab uses:

```text
dynamicSchemeSource
  -> createSchemeGraph
  -> applyProfile
  -> compileGraph
  -> exportCssVariables / exportJsonTokens / serializeTokenSet
```

Do not build lab-only source logic.

---

## Panels

### 1. Source input

A color picker and hex field. This is the `sourceColor` passed to `dynamicSchemeSource`.

Optional controls:

- variant selector (`tonal`, `vibrant`, `expressive`, `neutral`)
- contrast level selector

These feed into the dynamic scheme source options. They do not bypass the graph.

### 2. Role-set coverage view

Displays `dynamicColorRoleSet` and verifies coverage against the current compiled token set.

Columns:

- Role key (`scheme.primary`, `scheme.onPrimary`, ...)
- Required
- Present in graph
- Present in compiled token set
- Light value exists
- Dark value exists

This is the conformance bar. It proves the graph can carry a complete modern dynamic color scheme shape without making
the package identity design-system-specific.

### 3. Source graph view

Displays every `TokenNode` emitted by `createSchemeGraph` using `dynamicSchemeSource`.

Columns:

- Key (`scheme.primary`, `scheme.onPrimary`, ...)
- Kind (color / alias)
- Light value (formatted)
- Dark value (formatted)
- Provenance label

This is the raw source output before any profile is applied.

### 4. Profile selector

Choose or compose a profile.

Built-in option:

- `appSurfaceProfile`

Custom option:

- paste profile JSON

The profile should map `scheme.*` tokens into app/product tokens such as `chrome.background` or
`semantic.action.background`.

### 5. Profile graph view

Displays the full graph after `applyProfile`.

Shows both source nodes and profile nodes. Profile nodes show alias targets and provenance.

### 6. Compiled token view

Displays `CompiledTokenSet.tokens`, the fully resolved output from `compileGraph`.

For each token:

- Key
- Light value, as CSS color
- Dark value, as CSS color
- Light source key
- Dark source key
- Light resolution path
- Dark resolution path
- Color swatch per mode

Diagnostics appear here if any exist.

Do not show one fake source key for the whole token. Source is per mode.

### 7. Export filter

Choose what gets exported:

- all tokens
- `scheme.*` tokens only
- profile tokens only
- custom include list

This proves `compile.include` is useful and that apps can consume only profiled product tokens.

### 8. CSS output view

Displays the raw string output of `exportCssVariables`. Copyable.

Controls:

- variable prefix
- selector
- light mode selector
- dark mode selector
- export filter

Mode selector shows light or dark CSS block. Full output shows both blocks.

### 9. JSON output view

Displays the output of `exportJsonTokens`. Formatted JSON. Copyable.

The JSON output must preserve:

- full provenance
- per-mode source keys
- per-mode resolution paths

### 10. Snapshot view

Displays the output of `serializeTokenSet`. Highlight a diff when the source color changes. The diff is the visual proof
that snapshot testing works.

### 11. Mode toggle

A toggle that switches the lab UI itself between light and dark mode, consuming the CSS variables exported by the
current graph.

This is the practical proof that the CSS output is usable.

### 12. Alias inspector

Click any token in the compiled view to see its full resolution chain per mode.

Example:

```text
chrome.background
  light -> scheme.surface -> rgb(255 251 254)
  dark  -> scheme.surface -> rgb(28 27 30)
  profile: app-surface
  source: dynamic-scheme | graph: brand-purple
```

Mode-specific aliases must show different paths when they resolve to different source tokens.

### 13. Invalid graph fixture panel

Later, not required for the first lab pass.

Fixtures:

- duplicate token key
- missing dark value
- unknown alias target
- duplicate graph mode
- unknown mode value
- alias cycle

The panel shows the exact `TokenGraphProblem` output.

---

## What the lab is not

- Not a theme editor
- Not a design handoff tool
- Not a Figma plugin surface
- Not a product theme manager
- Not a color accessibility checker
- Not an image extraction tool
- Not an SSR parity tester

These may become separate labs later. They do not belong in the v0 proof lab.

---

## Proof milestone

The lab is ready when:

1. Change source color -> all views update.
2. Role-set coverage shows every required `scheme.*` role present.
3. Select a profile -> profile tokens appear in graph and compiled views.
4. Click an alias token -> per-mode resolution chain is visible.
5. Export filter can show profile tokens only.
6. Copy CSS output -> paste into a real stylesheet and it works.
7. JSON output preserves provenance and per-mode source paths.
8. Snapshot view shows a meaningful diff when source color changes.
9. Mode toggle switches the lab UI using its own exported CSS variables.
