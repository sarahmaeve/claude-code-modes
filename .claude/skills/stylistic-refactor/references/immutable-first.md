# Style: Immutable First

> Create new objects via spread; only mutate data that the current function owns and created.

## Motivation

Immutable data flow makes it easy to trace where values come from. When functions return new
objects instead of mutating inputs, callers never worry about side effects. Strategic mutation
is allowed only for locally-created data structures where immutability would add complexity
without benefit.

## Before / After

### From this codebase: config merging (src/config-cli.ts)

**Before:** (current — spread to create new config)
```ts
const updated = { ...config.modifiers, [name]: mdPath };
```

This creates a new object rather than mutating the existing config. Correct.

### From this codebase: local mutation (src/resolve.ts:103-122)

**Before:** (current — acceptable local mutation)
```ts
function applyModifiers(
  modifiers: string[],
  loadedConfig: LoadedConfig | null,
  flags: { readonly: boolean; contextPacing: boolean },
  customPaths: string[],
  position: "append" | "prepend",
): void {
  for (const raw of modifiers) {
    const resolved = resolveModifier(raw, loadedConfig);
    if (resolved.kind === "builtin") {
      if (resolved.name === "readonly") flags.readonly = true;
      if (resolved.name === "context-pacing") flags.contextPacing = true;
    } else {
      if (!customPaths.includes(resolved.path)) {
        if (position === "prepend") customPaths.unshift(resolved.path);
        else customPaths.push(resolved.path);
      }
    }
  }
}
```

This mutates `flags` and `customPaths` — acceptable because the caller (`resolveConfig`) created
and owns both objects. The mutation is documented via the `void` return type.

### Synthetic example: mutating input parameters

**Before:**
```ts
function enrichConfig(config: UserConfig): UserConfig {
  config.defaultModifiers = config.defaultModifiers ?? [];
  config.defaultModifiers.push("context-pacing");
  return config;
}
```

**After:**
```ts
function enrichConfig(config: UserConfig): UserConfig {
  return {
    ...config,
    defaultModifiers: [...(config.defaultModifiers ?? []), "context-pacing"],
  };
}
```

## Exceptions

- Mutation of locally-created arrays/objects within the same function (e.g., building up a `sections` array in `assemblePrompt`)
- Performance-critical paths where spread would cause measurable allocation overhead (unlikely in a CLI)

## Scope

- Applies to: all functions that receive data as parameters
- Does NOT apply to: local variables created within the function body (those can be mutated freely)
