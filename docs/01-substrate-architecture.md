# Color Scheme Token Graph — Substrate Architecture

> **Core principle:**
> ColorSchemeTokenGraph is the substrate. Material is a dialect. Product themes are profiles. CSS/JSON are export
> projections.

Not: Material → CSS variables

But: Material dialect → graph → optional product profile → export target

That keeps the package useful for Dekzer later without making Dekzer Material-owned.

---

## 1. Package layers

Recommended repo shape:

```
packages/
  core/
    src/
      colorValue.ts
      tokenKey.ts
      graph.ts
      validateGraph.ts
      serializeGraph.ts
      resolveGraph.ts
      index.ts

  material-dialect/
    src/
      materialRoles.ts
      createMaterialScheme.ts
      materialGraph.ts
      index.ts

  exporters/
    src/
      cssVariables.ts
      jsonTokens.ts
      dtcgTokens.ts
      typescriptConstants.ts
      index.ts

  profiles/
    src/
      createProfileGraph.ts
      index.ts

  lab/
    src/
      preview
      graphInspector
      materialPreview
      fixtureViewer
```

For v1, this could be one package internally split by folders. Public exports can still be small.

```
src/
  core/
  dialects/material/
  exporters/
  profiles/
  index.ts
```

Do not over-monorepo this until it earns it.

---

## 2. Core type model

The graph core must not know Material, Dekzer, Tailwind, or CSS.

It owns:

- token identity
- modes
- color values
- aliases
- provenance
- policies
- validation
- deterministic serialization

```ts
export type ColorMode = "light" | "dark";

export type ColorSpace =
  | "srgb"
  | "oklch"
  | "display-p3";

export type ColorValue =
  | {
  readonly space: "srgb";
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly alpha?: number;
}
  | {
  readonly space: "oklch";
  readonly l: number;
  readonly c: number;
  readonly h: number;
  readonly alpha?: number;
}
  | {
  readonly space: "display-p3";
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly alpha?: number;
};

export type TokenKey = string;

export type TokenRole =
  | "scheme-role"
  | "semantic-role"
  | "component-role"
  | "state-role"
  | "export-role";

export type TokenProvenance =
  | {
  readonly kind: "generated";
  readonly dialect: string;
  readonly source: string;
}
  | {
  readonly kind: "authored";
  readonly source: string;
}
  | {
  readonly kind: "mapped";
  readonly from: TokenKey;
  readonly profile: string;
};
```

---

## 3. Token node model

Keep v1 strict: only value nodes and alias nodes.

Do not add formulas, derived tokens, conditional expressions, arbitrary transforms, or runtime plugins yet.

```ts
export type ColorTokenNode = {
  readonly kind: "color";
  readonly key: TokenKey;
  readonly role: TokenRole;
  readonly description?: string;
  readonly values: Readonly<Record<ColorMode, ColorValue>>;
  readonly provenance: TokenProvenance;
};

export type AliasTokenNode = {
  readonly kind: "alias";
  readonly key: TokenKey;
  readonly role: TokenRole;
  readonly description?: string;
  readonly targets:
    | TokenKey
    | Readonly<Record<ColorMode, TokenKey>>;
  readonly provenance: TokenProvenance;
};

export type TokenNode =
  | ColorTokenNode
  | AliasTokenNode;

export type ColorSchemeTokenGraph = {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly modes: readonly ColorMode[];
  readonly nodes: readonly TokenNode[];
  readonly metadata?: {
    readonly name?: string;
    readonly description?: string;
    readonly createdBy?: string;
  };
};
```

Important: nodes are an array, not a plain object map. That gives deterministic ordering. Internally you can index them
by key.

---

## 4. Graph validation

Invariants:

- token keys are unique
- all aliases resolve
- alias cycles are rejected
- all color nodes support all graph modes
- mode-specific aliases only reference valid keys
- no exporter receives an invalid graph
- serialization order is stable

```ts
export type GraphValidationIssue =
  | {
  readonly code: "duplicate-token-key";
  readonly key: TokenKey;
}
  | {
  readonly code: "unresolved-alias-target";
  readonly key: TokenKey;
  readonly target: TokenKey;
}
  | {
  readonly code: "alias-cycle";
  readonly keys: readonly TokenKey[];
}
  | {
  readonly code: "missing-mode-value";
  readonly key: TokenKey;
  readonly mode: ColorMode;
};

export type GraphValidationResult =
  | { readonly ok: true }
  | {
  readonly ok: false;
  readonly issues: readonly GraphValidationIssue[];
};
```

Alias cycle detection should be a separate helper so validation stays readable.

---

## 5. Material as dialect

Material should output graph nodes. It should not be the graph.

Material owns:

- source color interpretation
- Material role generation
- Material role naming
- Material-compatible role set

It does not own:

- product semantics
- exporter semantics
- CSS variable naming outside its own dialect export

```ts
export function createMaterialGraph(
  options: MaterialDialectOptions,
): ColorSchemeTokenGraph {
  const scheme = createMaterialScheme({
    sourceColor: options.sourceColor,
  });

  const nodes: TokenNode[] = Object.entries(scheme).map(
    ([role, values]) => ({
      kind: "color",
      key: `material.${role}`,
      role: "scheme-role",
      values,
      provenance: {
        kind: "generated",
        dialect: "material",
        source: "source-color",
      },
    }),
  );

  return {
    schemaVersion: 1,
    graphId: options.graphId,
    modes: ["light", "dark"],
    nodes,
    metadata: {name: options.name},
  };
}
```

---

## 6. Product profiles

A profile maps one graph vocabulary into another.

This is where Dekzer eventually lives, but not as a first-class dependency of the package.

```ts
export type ProfileAlias = {
  readonly key: TokenKey;
  readonly target: TokenKey | Readonly<Record<ColorMode, TokenKey>>;
  readonly description?: string;
  readonly role?: TokenRole;
};

export type ColorSchemeProfile = {
  readonly profileId: string;
  readonly aliases: readonly ProfileAlias[];
};

export function applyProfile(
  graph: ColorSchemeTokenGraph,
  profile: ColorSchemeProfile,
): ColorSchemeTokenGraph {
  const profileNodes: AliasTokenNode[] = profile.aliases.map((alias) => ({
    kind: "alias",
    key: alias.key,
    role: alias.role ?? "semantic-role",
    description: alias.description,
    targets: alias.target,
    provenance: {
      kind: "mapped",
      from:
        typeof alias.target === "string"
          ? alias.target
          : Object.values(alias.target).join(","),
      profile: profile.profileId,
    },
  }));

  return {
    ...graph,
    nodes: [...graph.nodes, ...profileNodes],
  };
}
```

Generic product profile:

```ts
export const studioDarkProfile: ColorSchemeProfile = {
  profileId: "studio",
  aliases: [
    {key: "chrome.background", target: "material.surface"},
    {key: "chrome.foreground", target: "material.onSurface"},
    {key: "panel.border", target: "material.outline"},
    {key: "action.primary.background", target: "material.primary"},
    {key: "action.primary.foreground", target: "material.onPrimary"},
    {key: "status.danger.background", target: "material.error"},
    {key: "status.danger.foreground", target: "material.onError"},
  ],
};
```

Later Dekzer can define its own profile in its own repo. The public library does not need to know Dekzer exists.

---

## 7. Resolver

Exporters should not manually chase aliases. Use a resolver first.

```ts
export type ResolvedColorSchemeTokenGraph = {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly modes: readonly ColorMode[];
  readonly tokens: readonly ResolvedColorToken[];
};

export function resolveGraph(
  graph: ColorSchemeTokenGraph,
): ResolvedColorSchemeTokenGraph {
  // Resolves all alias chains, returns flat token set with concrete values
}
```

In real implementation, return typed errors instead of throwing inside the public API.

---

## 8. CSS variable exporter

Exporter is a projection, not the owner.

```ts
export function exportCssVariables(
  graph: ResolvedColorSchemeTokenGraph,
  options: CssVariableExportOptions = {},
): string
```

Example output:

```css
:root {
  --scheme-chrome-background: rgb(18 18 18);
  --scheme-chrome-foreground: rgb(238 238 238);
}

:root[data-theme="dark"] {
  --scheme-chrome-background: rgb(12 12 14);
  --scheme-chrome-foreground: rgb(245 245 245);
}
```

---

## 9. JSON token exporter

This is how you make drift visible. This JSON becomes a fixture — if generated output changes, tests fail unless the
change is intentional.

```ts
export function exportJsonTokens(
  graph: ResolvedColorSchemeTokenGraph,
): JsonTokenDocument
```

---

## 10. Public API

Keep the public API brutally small.

```ts
import {
  applyProfile,
  createMaterialGraph,
  exportCssVariables,
  exportJsonTokens,
  resolveGraph,
  validateGraph,
} from "color-scheme-tokens";

const materialGraph = createMaterialGraph({
  graphId: "brand-purple",
  sourceColor: {space: "srgb", r: 103, g: 80, b: 164},
  name: "Brand purple",
});

const themedGraph = applyProfile(materialGraph, {
  profileId: "studio",
  aliases: [
    {key: "chrome.background", target: "material.surface"},
    {key: "chrome.foreground", target: "material.onSurface"},
    {key: "selection.background", target: "material.primaryContainer"},
    {key: "selection.foreground", target: "material.onPrimaryContainer"},
  ],
});

const validation = validateGraph(themedGraph);
if (!validation.ok) throw new Error("Invalid graph");

const resolvedGraph = resolveGraph(themedGraph);
const css = exportCssVariables(resolvedGraph, {
  variablePrefix: "theme",
  include: ["chrome.background", "chrome.foreground"],
});
const tokens = exportJsonTokens(resolvedGraph);
```

---

## 11. Dekzer later, without Materializing it

Dekzer should define its own profile in Dekzer, not in this package.

```ts
// In Dekzer's repo:
export const instrumentThemeProfile: ColorSchemeProfile = {
  profileId: "instrument",
  aliases: [
    {key: "chrome.background", target: "material.surface"},
    {key: "library.row.selected.background", target: "material.primaryContainer"},
    {key: "library.row.selected.foreground", target: "material.onPrimaryContainer"},
    {key: "library.row.focus.outline", target: "material.primary"},
    {key: "status.error.background", target: "material.error"},
  ],
};
```

Dekzer consumes `--theme-chrome-background`, not `--md-sys-color-primary-container`. That is the whole protection.

---

## 12. What v1 must reject

- arbitrary user formula tokens
- runtime graph mutation
- image extraction
- SSR pipeline
- high-gamut solver
- automatic contrast repair
- component library bindings
- Tailwind plugin
- theme editor
- direct Dekzer package dependency

v1 is:

**source color → Material dialect graph → optional profile graph → resolved graph → CSS/JSON exports**

---

## 13. Acceptance bar

1. Generate Material-style graph from one source color.
2. Validate graph.
3. Apply generic profile aliases.
4. Resolve graph.
5. Export CSS variables.
6. Export JSON tokens.
7. Snapshot JSON output.
8. Change one generation rule and see snapshot fail.
9. Add a second profile without changing Material code.
10. Use only profiled tokens in a sample app.

If that works, you have the substrate.

---

## 14. Final architecture sentence

**A scheme dialect generates role tokens. A profile maps role tokens into product semantics. The graph preserves
identity, modes, aliases, provenance, and deterministic serialization. Exporters are projections, not owners.**
