# ColorSchemeTokenGraph - Canonical Architecture

## Core principle

**ColorSchemeTokenGraph is the substrate. Scheme sources generate scheme-role tokens. Product themes are profiles. CSS
and JSON are export projections.**

Not:

```text
Material -> CSS variables
```

Not:

```text
Dynamic color source -> product UI directly
```

But:

```text
scheme source input
  -> scheme source graph
  -> profile graph
  -> compiled token set
  -> export artifacts
  -> snapshots
```

The graph is the canonical intermediate artifact. Source inputs and profiles produce graph nodes. Exporters never
consume source inputs directly.

The package identity is not Material-owned. The first source may generate a dynamic color role set that is strong enough
to represent a complete modern M3-style dynamic color scheme, but that is a conformance bar, not the library identity.

---

## Public positioning

Package:

```text
color-scheme-tokens
```

Tagline:

```text
Stable color scheme tokens for TypeScript apps.
```

README opening:

```text
color-scheme-tokens turns generated or authored color schemes into stable,
typed, inspectable token graphs and exports them as CSS or JSON for
TypeScript apps.
```

Architecture sentence:

```text
Dynamic color is the first scheme source. The graph/compiler model is designed
to carry at least a complete modern dynamic color role set across light and dark
modes without making any design system the package identity.
```

---

## Ownership table

| Layer             | Owns                                                                    | Does not own                                   |
|-------------------|-------------------------------------------------------------------------|------------------------------------------------|
| **Scheme source** | Scheme-role token generation                                            | Product semantics, CSS naming, exporter format |
| **Role set**      | Required scheme role coverage and conformance                           | Token resolution, product aliases, CSS output  |
| **Profile**       | App/product alias and authored token mapping                            | Scheme source internals, compiler, CSS format  |
| **Graph**         | Token nodes, modes, aliases, provenance, deterministic serialization    | Resolution, output format, source internals    |
| **Compiler**      | Validation, alias resolution, compiled token set, per-mode source paths | CSS syntax, JSON shape, source generation      |
| **Exporters**     | CSS strings, JSON documents                                             | Alias resolution, validation, graph mutation   |

---

## Package shape

One package for v0. Do not split until real consumers require it.

```text
src/
  core/
    keys.ts
    modes.ts
    colorValue.ts
    colorIntent.ts
    provenance.ts
    graph.ts
    graphBuilder.ts
    validateGraph.ts
    compileGraph.ts
    serializeTokenSet.ts

  sources/
    dynamicScheme/
      dynamicColorRoleSet.ts
      createDynamicSchemeValues.ts
      dynamicSchemeSource.ts
      index.ts

  profiles/
    profile.ts
    applyProfile.ts
    appSurfaceProfile.ts

  exporters/
    formatCssColor.ts
    exportCssVariables.ts
    exportJsonTokens.ts

  recipes/
    createSchemeTokens.ts

  index.ts

  __tests__/
    dynamicSchemeSource.test.ts
    roleSetCoverage.test.ts
    profile.test.ts
    compileGraph.test.ts
    exportCssVariables.test.ts
    snapshots.test.ts
```

Avoid public names such as `materialDialect`, `MaterialSchemeRecipe`, `material.*`, or `createMaterialSchemeTokens`.
Those names pull the architecture toward the first implementation and away from the graph substrate.

---

## 1. Keys and modes

Token identity is a validated address, not an arbitrary object path.

```ts
declare const tokenKeyBrand: unique symbol;
declare const modeKeyBrand: unique symbol;

export type TokenKey = string & {
  readonly [tokenKeyBrand]: "TokenKey";
};

export type ModeKey = string & {
  readonly [modeKeyBrand]: "ModeKey";
};

export const lightMode = "light" as ModeKey;
export const darkMode = "dark" as ModeKey;
```

Token key grammar: namespaced, lower-camel segments, dot-separated.

```ts
export type TokenKeyResult =
  | { readonly ok: true; readonly key: TokenKey }
  | { readonly ok: false; readonly reason: "invalid-token-key"; readonly value: string };

export function parseTokenKey(value: string): TokenKeyResult {
  if (!/^[a-z][a-z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/.test(value)) {
    return { ok: false, reason: "invalid-token-key", value };
  }

  return { ok: true, key: value as TokenKey };
}

/** Internal helper. Throws on invalid key. Use parseTokenKey in public parsing paths. */
export function tokenKey(value: string): TokenKey {
  const result = parseTokenKey(value);

  if (!result.ok) {
    throw new Error(`Invalid token key: ${value}`);
  }

  return result.key;
}
```

Valid examples:

```text
scheme.primary
scheme.onPrimaryContainer
chrome.background
library.row.selected.background
semantic.danger.background
```

Invalid examples:

```text
Scheme.primary
scheme.Primary
scheme.on-primary
primary
```

Token key namespace is the first segment. CSS export converts camel segments to kebab automatically.

---

## 2. Color values

**All internal channels are normalized: 0..1.** CSS formatting owns conversion to CSS syntax. Never store raw 0-255
integers in graph nodes.

```ts
export type SrgbColor = {
  readonly space: "srgb";
  readonly r: number;      // 0..1
  readonly g: number;      // 0..1
  readonly b: number;      // 0..1
  readonly alpha?: number; // 0..1
};

export type OklchColor = {
  readonly space: "oklch";
  readonly l: number;      // 0..1
  readonly c: number;
  readonly h: number;      // degrees 0..360
  readonly alpha?: number; // 0..1
};

export type DisplayP3Color = {
  readonly space: "display-p3";
  readonly r: number;      // 0..1
  readonly g: number;      // 0..1
  readonly b: number;      // 0..1
  readonly alpha?: number; // 0..1
};

export type ColorValue =
  | SrgbColor
  | OklchColor
  | DisplayP3Color;
```

Input helpers for callers who have raw values:

```ts
export type ColorParseResult =
  | { readonly ok: true; readonly value: SrgbColor }
  | { readonly ok: false; readonly code: "invalid-color"; readonly input: string };

export function srgb255(
  r: number,
  g: number,
  b: number,
  alpha = 1,
): SrgbColor {
  for (const channel of [r, g, b]) {
    if (!Number.isInteger(channel) || channel < 0 || channel > 255) {
      throw new Error(`Invalid sRGB channel: ${channel}`);
    }
  }

  if (alpha < 0 || alpha > 1) {
    throw new Error(`Invalid alpha: ${alpha}`);
  }

  return {
    space: "srgb",
    r: r / 255,
    g: g / 255,
    b: b / 255,
    alpha,
  };
}

export function parseHexColor(input: string): ColorParseResult {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(input);

  if (!match) {
    return { ok: false, code: "invalid-color", input };
  }

  const value = match[1];
  const n = Number.parseInt(value, 16);

  return {
    ok: true,
    value: {
      space: "srgb",
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255,
      alpha: 1,
    },
  };
}

export function hex(input: string): SrgbColor {
  const result = parseHexColor(input);

  if (!result.ok) {
    throw new Error(`Invalid hex color: ${input}`);
  }

  return result.value;
}
```

Usage:

```ts
sourceColor: hex("#6750A4")
sourceColor: srgb255(103, 80, 164)
```

### ColorIntent

`ColorIntent` wraps a `ColorValue` for graph nodes. No public gamut policy in v0. Reserve that surface for when behavior
actually exists.

```ts
export type ColorIntent = {
  readonly value: ColorValue;
};
```

---

## 3. Mode values

Do not use `Record<ModeKey, T>`. TypeScript cannot enforce that a record covers exactly the modes declared by a graph.
Validation owns that guarantee, not the type.

```ts
export type ModeValue<T> = {
  readonly mode: ModeKey;
  readonly value: T;
};

export type ModeValues<T> = readonly ModeValue<T>[];
```

Node creation example:

```ts
builder.addColor({
  key: tokenKey("scheme.primary"),
  values: [
    { mode: lightMode, value: { value: hex("#6750A4") } },
    { mode: darkMode, value: { value: hex("#CFBCFF") } },
  ],
  provenance: { kind: "source", sourceId: "dynamic-scheme" },
});
```

---

## 4. Provenance

Every token must carry a traceable origin.

```ts
export type TokenProvenance =
  | {
      readonly kind: "source";
      readonly sourceId: string;
      readonly sourceVersion?: string;
      readonly roleSetId?: string;
      readonly inputId?: string;
    }
  | {
      readonly kind: "profile";
      readonly profileId: string;
      readonly sourceKeys: readonly TokenKey[];
    }
  | {
      readonly kind: "authored";
      readonly sourceName?: string;
    }
  | {
      readonly kind: "imported";
      readonly format: "json" | "dtcg" | "css";
      readonly sourceName?: string;
    };
```

A token inspector can render:

```text
chrome.background
  aliases -> scheme.surface
  profile: studio
  source: dynamic-scheme | graph: brand-purple
```

---

## 5. Token nodes

`TokenRole` is removed from v0. Token ownership is expressed through key namespace and provenance. Tags and role
classification can come later.

```ts
export type TokenNodeBase = {
  readonly key: TokenKey;
  readonly description?: string;
  readonly provenance: TokenProvenance;
};

export type ColorTokenNode = TokenNodeBase & {
  readonly kind: "color";
  readonly values: ModeValues<ColorIntent>;
};

export type AliasTokenNode = TokenNodeBase & {
  readonly kind: "alias";
  readonly target: TokenKey | ModeValues<TokenKey>;
};

export type TokenNode =
  | ColorTokenNode
  | AliasTokenNode;
```

---

## 6. Graph

The graph is a durable, serializable intermediate artifact. No functions, no class instances, no `Map` in the public
shape. JSON roundtrip must work.

```ts
export type ColorSchemeTokenGraph = {
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

`nodes` is an array for deterministic ordering. Validation and compilation build internal maps.

---

## 7. Graph builder

Scheme sources and profiles use the builder for a safe construction path.

```ts
export type GraphBuildProblem =
  | { readonly code: "duplicate-token"; readonly key: TokenKey };

export type GraphBuildResult =
  | { readonly ok: true; readonly graph: ColorSchemeTokenGraph }
  | { readonly ok: false; readonly problems: readonly GraphBuildProblem[] };

export function createGraphBuilder(input: {
  readonly graphId: string;
  readonly modes: readonly ModeKey[];
  readonly name?: string;
}) {
  const nodes: TokenNode[] = [];
  const keys = new Set<TokenKey>();
  const problems: GraphBuildProblem[] = [];

  function addNode(node: TokenNode): void {
    if (keys.has(node.key)) {
      problems.push({code: "duplicate-token", key: node.key});
      return;
    }

    keys.add(node.key);
    nodes.push(node);
  }

  return {
    addColor(node: Omit<ColorTokenNode, "kind">): void {
      addNode({...node, kind: "color"});
    },

    addAlias(node: Omit<AliasTokenNode, "kind">): void {
      addNode({...node, kind: "alias"});
    },

    build(): GraphBuildResult {
      if (problems.length > 0) {
        return {ok: false, problems};
      }

      return {
        ok: true,
        graph: {
          schemaVersion: 1,
          graphId: input.graphId,
          modes: input.modes,
          nodes,
          ...(input.name === undefined
            ? {}
            : {metadata: {name: input.name}}),
        },
      };
    },
  };
}
```

---

## 8. Scheme sources

A scheme source generates a graph from input. It does not produce CSS, JSON, or any export format.

```ts
export type SchemeSource = {
  readonly sourceId: string;
  readonly roleSetId: string;

  createGraph(input: {
    readonly graphId: string;
    readonly name?: string;
  }): GraphBuildResult;
};
```

### Dynamic scheme source

The first scheme source generates a full dynamic color role set from a source color. Its public namespace is `scheme.*`,
not `material.*`.

The implementation may wrap an upstream dynamic color algorithm internally. That implementation detail must not leak
into public token keys, examples, or package identity.

```ts
export type DynamicSchemeVariant =
  | "tonal"
  | "vibrant"
  | "expressive"
  | "neutral";

export type DynamicSchemeSourceOptions = {
  readonly sourceColor: ColorValue;
  readonly variant?: DynamicSchemeVariant;
  readonly contrastLevel?: number;
};

export function dynamicSchemeSource(
  options: DynamicSchemeSourceOptions,
): SchemeSource {
  return {
    sourceId: "dynamic-scheme",
    roleSetId: dynamicColorRoleSet.roleSetId,

    createGraph(input) {
      return createDynamicSchemeGraph({
        graphId: input.graphId,
        name: input.name,
        sourceColor: options.sourceColor,
        variant: options.variant ?? "tonal",
        contrastLevel: options.contrastLevel ?? 0,
      });
    },
  };
}
```

Example graph output uses scheme-role keys:

```text
scheme.primary
scheme.onPrimary
scheme.primaryContainer
scheme.onPrimaryContainer
scheme.surface
scheme.onSurface
scheme.error
scheme.onError
```

---

## 9. Dynamic color role set

The role set is the conformance boundary. The graph must comfortably carry at least a complete modern M3-style dynamic
color scheme across light and dark modes.

The package does not need to call this Material in public examples. The role coverage still acts as the bar.

```ts
export type SchemeRoleDefinition = {
  readonly key: TokenKey;
  readonly required: boolean;
  readonly description?: string;
};

export type SchemeRoleSet = {
  readonly roleSetId: string;
  readonly roles: readonly SchemeRoleDefinition[];
};

export const dynamicColorRoleSet: SchemeRoleSet = {
  roleSetId: "dynamic-color-v0",
  roles: [
    { key: tokenKey("scheme.primary"), required: true },
    { key: tokenKey("scheme.onPrimary"), required: true },
    { key: tokenKey("scheme.primaryContainer"), required: true },
    { key: tokenKey("scheme.onPrimaryContainer"), required: true },

    { key: tokenKey("scheme.secondary"), required: true },
    { key: tokenKey("scheme.onSecondary"), required: true },
    { key: tokenKey("scheme.secondaryContainer"), required: true },
    { key: tokenKey("scheme.onSecondaryContainer"), required: true },

    { key: tokenKey("scheme.tertiary"), required: true },
    { key: tokenKey("scheme.onTertiary"), required: true },
    { key: tokenKey("scheme.tertiaryContainer"), required: true },
    { key: tokenKey("scheme.onTertiaryContainer"), required: true },

    { key: tokenKey("scheme.error"), required: true },
    { key: tokenKey("scheme.onError"), required: true },
    { key: tokenKey("scheme.errorContainer"), required: true },
    { key: tokenKey("scheme.onErrorContainer"), required: true },

    { key: tokenKey("scheme.surface"), required: true },
    { key: tokenKey("scheme.onSurface"), required: true },
    { key: tokenKey("scheme.surfaceVariant"), required: true },
    { key: tokenKey("scheme.onSurfaceVariant"), required: true },

    { key: tokenKey("scheme.outline"), required: true },
    { key: tokenKey("scheme.outlineVariant"), required: true },
    { key: tokenKey("scheme.shadow"), required: true },
    { key: tokenKey("scheme.scrim"), required: true },

    { key: tokenKey("scheme.inverseSurface"), required: true },
    { key: tokenKey("scheme.inverseOnSurface"), required: true },
    { key: tokenKey("scheme.inversePrimary"), required: true },
    { key: tokenKey("scheme.surfaceTint"), required: true },
  ],
};
```

Conformance test:

```ts
test("dynamic scheme source satisfies full role-set coverage", () => {
  const graphResult = createSchemeGraph({
    graphId: "dynamic-purple",
    source: dynamicSchemeSource({
      sourceColor: hex("#6750A4"),
    }),
  });

  expect(graphResult.ok).toBe(true);
  if (!graphResult.ok) return;

  const compiled = compileGraph(graphResult.graph);

  expect(compiled.ok).toBe(true);
  if (!compiled.ok) return;

  const tokenKeys = new Set(compiled.tokenSet.tokens.map((token) => token.key));

  for (const role of dynamicColorRoleSet.roles) {
    expect(tokenKeys.has(role.key)).toBe(true);
  }

  for (const token of compiled.tokenSet.tokens) {
    const modes = new Set(token.values.map((modeValue) => modeValue.mode));

    expect(modes.has(lightMode)).toBe(true);
    expect(modes.has(darkMode)).toBe(true);
  }
});
```

---

## 10. Create scheme graph

Low-level public graph creation centers the source, not the first implementation.

```ts
export type CreateSchemeGraphOptions = {
  readonly graphId: string;
  readonly source: SchemeSource;
  readonly name?: string;
};

export function createSchemeGraph(
  options: CreateSchemeGraphOptions,
): GraphBuildResult {
  return options.source.createGraph({
    graphId: options.graphId,
    ...(options.name === undefined ? {} : { name: options.name }),
  });
}
```

---

## 11. Profile model

Profiles extend a graph. They do not mutate the existing graph. They return a new graph with nodes appended.

Profiles support two kinds of tokens:

- **alias**: maps a new key to an existing key, uniformly or per mode
- **color**: authors a new concrete color node directly in the profile

```ts
export type ProfileToken =
  | {
      readonly kind: "alias";
      readonly key: TokenKey;
      readonly target: TokenKey | ModeValues<TokenKey>;
      readonly description?: string;
    }
  | {
      readonly kind: "color";
      readonly key: TokenKey;
      readonly values: ModeValues<ColorIntent>;
      readonly description?: string;
    };

export type ColorSchemeProfile = {
  readonly profileId: string;
  readonly tokens: readonly ProfileToken[];
};
```

Profile application:

```ts
export function applyProfile(
  graph: ColorSchemeTokenGraph,
  profile: ColorSchemeProfile,
): ColorSchemeTokenGraph {
  const profileNodes: TokenNode[] = profile.tokens.map((token) => {
    if (token.kind === "color") {
      return {
        kind: "color",
        key: token.key,
        ...(token.description === undefined ? {} : { description: token.description }),
        values: token.values,
        provenance: {
          kind: "profile",
          profileId: profile.profileId,
          sourceKeys: [],
        },
      } satisfies ColorTokenNode;
    }

    const sourceKeys: TokenKey[] =
      typeof token.target === "string"
        ? [token.target]
        : token.target.map((mv) => mv.value);

    return {
      kind: "alias",
      key: token.key,
      ...(token.description === undefined ? {} : { description: token.description }),
      target: token.target,
      provenance: {
        kind: "profile",
        profileId: profile.profileId,
        sourceKeys,
      },
    } satisfies AliasTokenNode;
  });

  return { ...graph, nodes: [...graph.nodes, ...profileNodes] };
}
```

Generic built-in profile:

```ts
export const appSurfaceProfile: ColorSchemeProfile = {
  profileId: "app-surface",
  tokens: [
    { kind: "alias", key: tokenKey("chrome.background"), target: tokenKey("scheme.surface") },
    { kind: "alias", key: tokenKey("chrome.foreground"), target: tokenKey("scheme.onSurface") },
    { kind: "alias", key: tokenKey("chrome.border"), target: tokenKey("scheme.outline") },
    { kind: "alias", key: tokenKey("semantic.action.background"), target: tokenKey("scheme.primary") },
    { kind: "alias", key: tokenKey("semantic.action.foreground"), target: tokenKey("scheme.onPrimary") },
    { kind: "alias", key: tokenKey("semantic.danger.background"), target: tokenKey("scheme.error") },
    { kind: "alias", key: tokenKey("semantic.danger.foreground"), target: tokenKey("scheme.onError") },
  ],
};
```

Product-specific profiles live in the product repo. This package never imports Dekzer or any product.

---

## 12. Validation

Validation answers: **Is this graph structurally valid?**

It runs before compilation. Compilation calls validation and gates on it.

```ts
export type TokenGraphProblem =
  | { readonly code: "graph-has-no-modes" }
  | { readonly code: "duplicate-graph-mode"; readonly mode: ModeKey }
  | { readonly code: "duplicate-token-key"; readonly key: TokenKey }
  | { readonly code: "missing-mode-value"; readonly key: TokenKey; readonly mode: ModeKey }
  | { readonly code: "duplicate-mode-value"; readonly key: TokenKey; readonly mode: ModeKey }
  | { readonly code: "unknown-mode-value"; readonly key: TokenKey; readonly mode: ModeKey }
  | { readonly code: "unknown-alias-target"; readonly key: TokenKey; readonly target: TokenKey }
  | { readonly code: "missing-mode-alias-target"; readonly key: TokenKey; readonly mode: ModeKey }
  | { readonly code: "alias-cycle"; readonly keys: readonly TokenKey[] };

export type GraphValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly problems: readonly TokenGraphProblem[] };
```

Validation requirements:

- graph has at least one mode
- graph modes are unique
- token keys are unique
- color nodes have exactly one value for every graph mode
- color nodes do not contain unknown modes
- color nodes do not contain duplicate mode values
- alias nodes with uniform target reference an existing token
- alias nodes with mode targets have exactly one target for every graph mode
- alias nodes do not contain unknown modes
- alias nodes do not contain duplicate mode targets
- aliases do not form cycles

```ts
export function validateGraph(graph: ColorSchemeTokenGraph): GraphValidationResult {
  const problems: TokenGraphProblem[] = [];
  const graphModes = new Set<ModeKey>();

  if (graph.modes.length === 0) {
    problems.push({ code: "graph-has-no-modes" });
  }

  for (const mode of graph.modes) {
    if (graphModes.has(mode)) {
      problems.push({ code: "duplicate-graph-mode", mode });
    }
    graphModes.add(mode);
  }

  const seen = new Set<TokenKey>();
  const nodeByKey = new Map<TokenKey, TokenNode>();

  for (const node of graph.nodes) {
    if (seen.has(node.key)) {
      problems.push({ code: "duplicate-token-key", key: node.key });
      continue;
    }
    seen.add(node.key);
    nodeByKey.set(node.key, node);
  }

  for (const node of graph.nodes) {
    if (node.kind === "color") {
      validateModeValues({ graphModes, key: node.key, values: node.values, problems });
    }

    if (node.kind === "alias") {
      if (typeof node.target === "string") {
        if (!nodeByKey.has(node.target)) {
          problems.push({ code: "unknown-alias-target", key: node.key, target: node.target });
        }
      } else {
        validateModeValues({ graphModes, key: node.key, values: node.target, problems });

        for (const mode of graph.modes) {
          const mv = node.target.find((v) => v.mode === mode);
          if (!mv) {
            problems.push({ code: "missing-mode-alias-target", key: node.key, mode });
          } else if (!nodeByKey.has(mv.value)) {
            problems.push({ code: "unknown-alias-target", key: node.key, target: mv.value });
          }
        }
      }
    }
  }

  if (problems.length > 0) {
    return { ok: false, problems };
  }

  const cycleProblems = detectAliasCycles(graph, nodeByKey);

  if (cycleProblems.length > 0) {
    return { ok: false, problems: cycleProblems };
  }

  return { ok: true };
}
```

The helper `validateModeValues` should report duplicate, missing, and unknown modes. It is intentionally shared by color
values and mode-specific aliases.

---

## 13. Compiler

`compileGraph` is the public boundary. `validateGraph` is called internally. Callers do not need to call it separately.

The compiler returns per-mode source paths. A token can resolve to different source tokens in light and dark mode, so
source identity must live on each compiled mode value, not once on the token.

```ts
export type CompileDiagnostic = {
  readonly severity: "warning";
  readonly code: string;
  readonly message: string;
};

export type CompiledModeColorValue = {
  readonly mode: ModeKey;
  readonly value: ColorValue;
  readonly sourceKey: TokenKey;
  readonly resolutionPath: readonly TokenKey[];
};

export type CompiledColorToken = {
  readonly key: TokenKey;
  readonly values: readonly CompiledModeColorValue[];
  readonly provenance: TokenProvenance;
};

export type CompiledTokenSet = {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly modes: readonly ModeKey[];
  readonly tokens: readonly CompiledColorToken[];
  readonly diagnostics: readonly CompileDiagnostic[];
  readonly metadata?: {
    readonly compilerVersion?: string;
    readonly sourceGraphSchemaVersion?: 1;
  };
};

export type CompileOptions = {
  readonly include?: readonly TokenKey[];
};

export type CompileResult =
  | { readonly ok: true; readonly tokenSet: CompiledTokenSet }
  | { readonly ok: false; readonly problems: readonly TokenGraphProblem[] };
```

Public compiler shape:

```ts
export function compileGraph(
  graph: ColorSchemeTokenGraph,
  options: CompileOptions = {},
): CompileResult {
  const validation = validateGraph(graph);

  if (!validation.ok) {
    return { ok: false, problems: validation.problems };
  }

  const nodeByKey = new Map<TokenKey, TokenNode>(
    graph.nodes.map((node) => [node.key, node]),
  );

  const include = options.include === undefined
    ? undefined
    : new Set(options.include);

  const diagnostics: CompileDiagnostic[] = [];

  function resolveColor(
    key: TokenKey,
    mode: ModeKey,
    path: readonly TokenKey[] = [],
  ): CompiledModeColorValue {
    if (path.includes(key)) {
      throw new Error(`Compiler invariant violated: cycle at ${key}`);
    }

    const node = nodeByKey.get(key);

    if (!node) {
      throw new Error(`Compiler invariant violated: unknown key ${key}`);
    }

    if (node.kind === "color") {
      const mv = node.values.find((value) => value.mode === mode);

      if (!mv) {
        throw new Error(`Compiler invariant violated: missing mode ${mode} for ${key}`);
      }

      return {
        mode,
        value: mv.value.value,
        sourceKey: key,
        resolutionPath: [...path, key],
      };
    }

    const target: TokenKey =
      typeof node.target === "string"
        ? node.target
        : (() => {
            const mv = node.target.find((value) => value.mode === mode);

            if (!mv) {
              throw new Error(`Compiler invariant violated: missing alias mode ${mode} for ${key}`);
            }

            return mv.value;
          })();

    return resolveColor(target, mode, [...path, key]);
  }

  const tokens = graph.nodes
    .filter((node) => include === undefined || include.has(node.key))
    .map((node) => ({
      key: node.key,
      values: graph.modes.map((mode) => resolveColor(node.key, mode)),
      provenance: node.provenance,
    } satisfies CompiledColorToken));

  return {
    ok: true,
    tokenSet: {
      schemaVersion: 1,
      graphId: graph.graphId,
      modes: graph.modes,
      tokens,
      diagnostics,
    },
  };
}
```

---

## 14. CSS variable exporter

Exporters receive `CompiledTokenSet` only. They do not resolve aliases. They do not validate graphs.

Token keys convert camel segments to kebab automatically:

```ts
export function tokenKeyToCssName(key: TokenKey): string {
  return key
    .replaceAll(".", "-")
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function cssVariableName(key: TokenKey, prefix: string): string {
  return `--${prefix}-${tokenKeyToCssName(key)}`;
}
```

Example:

```text
scheme.onPrimaryContainer -> --theme-scheme-on-primary-container
chrome.background         -> --theme-chrome-background
```

```ts
export type CssVariableOptions = {
  readonly selector?: string;
  readonly variablePrefix?: string;
  readonly modeSelectors?: Readonly<Record<string, string>>;
};

export function formatCssColor(value: ColorValue): string {
  if (value.space === "srgb") {
    const r = Math.round(value.r * 255);
    const g = Math.round(value.g * 255);
    const b = Math.round(value.b * 255);
    const alpha = value.alpha ?? 1;

    return alpha === 1
      ? `rgb(${r} ${g} ${b})`
      : `rgb(${r} ${g} ${b} / ${alpha})`;
  }

  if (value.space === "oklch") {
    const l = (value.l * 100).toFixed(2);
    const alpha = value.alpha ?? 1;

    return alpha === 1
      ? `oklch(${l}% ${value.c} ${value.h})`
      : `oklch(${l}% ${value.c} ${value.h} / ${alpha})`;
  }

  const alpha = value.alpha ?? 1;

  return alpha === 1
    ? `color(display-p3 ${value.r} ${value.g} ${value.b})`
    : `color(display-p3 ${value.r} ${value.g} ${value.b} / ${alpha})`;
}

export function exportCssVariables(
  tokenSet: CompiledTokenSet,
  options: CssVariableOptions = {},
): string {
  const prefix = options.variablePrefix ?? "scheme";
  const selector = options.selector ?? ":root";

  const defaultModeSelectors: Record<string, string> = {
    light: selector,
    dark: `${selector}[data-theme="dark"]`,
  };

  const modeSelectors = { ...defaultModeSelectors, ...options.modeSelectors };

  return tokenSet.modes
    .map((mode) => {
      const modeSelector = modeSelectors[mode] ?? selector;
      const declarations = tokenSet.tokens
        .map((token) => {
          const mv = token.values.find((value) => value.mode === mode);

          if (!mv) {
            return undefined;
          }

          return `  ${cssVariableName(token.key, prefix)}: ${formatCssColor(mv.value)};`;
        })
        .filter((line): line is string => line !== undefined)
        .join("\n");

      return `${modeSelector} {\n${declarations}\n}`;
    })
    .join("\n\n");
}
```

Example output:

```css
:root {
  --theme-scheme-primary: rgb(103 80 164);
  --theme-chrome-background: rgb(255 251 254);
}

:root[data-theme="dark"] {
  --theme-scheme-primary: rgb(207 188 255);
  --theme-chrome-background: rgb(28 27 30);
}
```

---

## 15. JSON exporter

This is how output drift becomes visible. The JSON document is the fixture.

The JSON export preserves full provenance and per-mode source resolution.

```ts
export type JsonTokenValue = {
  readonly mode: string;
  readonly value: string;
  readonly sourceKey: string;
  readonly resolutionPath: readonly string[];
};

export type JsonTokenRecord = {
  readonly key: string;
  readonly provenance: TokenProvenance;
  readonly values: readonly JsonTokenValue[];
};

export type JsonTokenDocument = {
  readonly schemaVersion: 1;
  readonly graphId: string;
  readonly modes: readonly string[];
  readonly tokens: readonly JsonTokenRecord[];
};

export function exportJsonTokens(tokenSet: CompiledTokenSet): JsonTokenDocument {
  return {
    schemaVersion: tokenSet.schemaVersion,
    graphId: tokenSet.graphId,
    modes: [...tokenSet.modes],
    tokens: tokenSet.tokens.map((token) => ({
      key: token.key,
      provenance: token.provenance,
      values: token.values.map((mv) => ({
        mode: mv.mode,
        value: formatCssColor(mv.value),
        sourceKey: mv.sourceKey,
        resolutionPath: [...mv.resolutionPath],
      })),
    })),
  };
}
```

---

## 16. Snapshot serialization

Stable, deterministic JSON for snapshot testing.

```ts
export function serializeTokenSet(tokenSet: CompiledTokenSet): string {
  return JSON.stringify(
    {
      ...tokenSet,
      modes: [...tokenSet.modes].sort(),
      tokens: [...tokenSet.tokens].sort((a, b) => a.key.localeCompare(b.key)),
      diagnostics: [...tokenSet.diagnostics].sort((a, b) =>
        `${a.code}:${a.message}`.localeCompare(`${b.code}:${b.message}`),
      ),
    },
    undefined,
    2,
  );
}
```

Test:

```ts
test("dynamic purple snapshot is stable", () => {
  const graphResult = createSchemeGraph({
    graphId: "dynamic-purple",
    source: dynamicSchemeSource({
      sourceColor: hex("#6750A4"),
    }),
  });

  expect(graphResult.ok).toBe(true);
  if (!graphResult.ok) return;

  const compiled = compileGraph(graphResult.graph);

  expect(compiled.ok).toBe(true);
  if (!compiled.ok) return;

  expect(serializeTokenSet(compiled.tokenSet)).toMatchSnapshot();
});
```

If generated output changes, tests fail unless the change is intentional. This is the credibility mechanism.

---

## 17. Recipe API

High-level entry point. Does not hide the graph. Returns it alongside compiled outputs.

```ts
export type SchemeTokensRecipeOptions = {
  readonly graphId: string;
  readonly source: SchemeSource;
  readonly profile?: ColorSchemeProfile;
  readonly compile?: CompileOptions;
  readonly css?: CssVariableOptions;
};

export type SchemeTokensRecipeResult =
  | {
      readonly ok: true;
      readonly graph: ColorSchemeTokenGraph;
      readonly tokenSet: CompiledTokenSet;
      readonly cssVariables: string;
      readonly jsonTokens: JsonTokenDocument;
    }
  | {
      readonly ok: false;
      readonly problems: readonly TokenGraphProblem[];
    };

export function createSchemeTokens(
  options: SchemeTokensRecipeOptions,
): SchemeTokensRecipeResult {
  const graphResult = createSchemeGraph({
    graphId: options.graphId,
    source: options.source,
  });

  if (!graphResult.ok) {
    return {
      ok: false,
      problems: graphResult.problems.map((problem) => ({
        code: "duplicate-token-key",
        key: problem.key,
      })),
    };
  }

  const graph = options.profile === undefined
    ? graphResult.graph
    : applyProfile(graphResult.graph, options.profile);

  const compiled = compileGraph(graph, options.compile ?? {});

  if (!compiled.ok) {
    return compiled;
  }

  return {
    ok: true,
    graph,
    tokenSet: compiled.tokenSet,
    cssVariables: exportCssVariables(compiled.tokenSet, options.css ?? {}),
    jsonTokens: exportJsonTokens(compiled.tokenSet),
  };
}
```

Basic usage:

```ts
const result = createSchemeTokens({
  graphId: "brand-purple",
  source: dynamicSchemeSource({
    sourceColor: hex("#6750A4"),
  }),
  profile: appSurfaceProfile,
  compile: {
    include: [
      tokenKey("chrome.background"),
      tokenKey("chrome.foreground"),
      tokenKey("semantic.action.background"),
      tokenKey("semantic.action.foreground"),
    ],
  },
  css: {
    variablePrefix: "theme",
  },
});
```

---

## 18. Public API surface

Small and deliberate.

```ts
// Types
export type {
  ColorSchemeTokenGraph,
  ColorSchemeProfile,
  ColorValue,
  ColorIntent,
  CompiledTokenSet,
  TokenKey,
  ModeKey,
  TokenGraphProblem,
  CompileDiagnostic,
  CompileResult,
  GraphBuildResult,
  SchemeSource,
  SchemeRoleSet,
} from "./core";

// Keys and modes
export {
  parseTokenKey,
  tokenKey,
  lightMode,
  darkMode,
} from "./core";

// Color helpers
export {
  hex,
  parseHexColor,
  srgb255,
} from "./core";

// Graph and compiler
export {
  createSchemeGraph,
  validateGraph,
  compileGraph,
  serializeTokenSet,
} from "./core";

// Sources
export {
  dynamicSchemeSource,
  dynamicColorRoleSet,
} from "./sources/dynamicScheme";

// Profiles
export {
  applyProfile,
  appSurfaceProfile,
} from "./profiles";

// Recipes
export {
  createSchemeTokens,
} from "./recipes";

// Exporters
export {
  exportCssVariables,
  exportJsonTokens,
  cssVariableName,
} from "./exporters";
```

Do not export internal helpers such as `createGraphBuilder` or `detectAliasCycles`.

---

## 19. Dependency strategy

If the dynamic scheme source uses an upstream dynamic color implementation, that dependency is a **direct dependency**,
not a peer dependency.

This package produces deterministic output. A peer dependency lets the consuming app choose a different upstream
algorithm version and silently change output.

**Upstream color algorithm changes are package-level events. Output drift is changelog-worthy, not a consumer dependency
accident.**

- Direct dependency for v0
- Fixture snapshots run against generated output
- Dependency upgrades are explicit commits
- Any snapshot change is a noted release event
- Public names stay graph-centered even if the upstream implementation is M3-compatible internally

---

## 20. v0 rejects - hard list

Do not include in v0. Do not reference as "coming soon" in the public API.

- DTCG exporter
- TypeScript constants exporter
- StyleX exporter
- CLI
- Image extraction
- SSR pipeline
- High-gamut policy controls (`gamutPolicy`)
- Automatic contrast repair
- Theme editor
- Tailwind plugin
- React/Vue bindings
- Dekzer package dependency
- Multiple npm packages / monorepo split

---

## 21. Acceptance bar

v0 is proven when all of these pass:

1. Generate a dynamic scheme source graph from one source color.
2. Graph validates without problems.
3. The dynamic role set coverage test proves all required `scheme.*` roles exist.
4. Every required role has both light and dark mode values.
5. Apply alias profile. New alias tokens appear in graph.
6. Compile graph. All aliases resolve to concrete color values.
7. Compiled tokens expose per-mode source keys and resolution paths.
8. Export CSS variables. Output is valid CSS.
9. Export JSON tokens. Output is valid JSON and preserves provenance.
10. Serialize compiled token set. Output is deterministic across runs.
11. Snapshot test passes. Change one scheme role and snapshot fails.
12. Add a second profile without touching source code.
13. A sample app consumes only profiled CSS variables. No raw `scheme.*` keys are required in app code.
14. Authored color node in profile compiles correctly without an alias target.
15. Mode-specific alias with different light/dark targets compiles correctly and reports the correct source per mode.

---

## 22. The law

**A scheme source generates scheme-role tokens. A role set defines the coverage bar. A profile maps those roles into
product semantics or authors new ones. The graph preserves identity, modes, aliases, provenance, and deterministic
serialization. The compiler resolves and validates. Exporters are projections, not owners.**
