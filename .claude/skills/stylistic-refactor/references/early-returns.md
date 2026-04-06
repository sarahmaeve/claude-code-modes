# Style: Early Returns

> Use guard clauses and early returns for error/edge cases; never nest more than 2 levels deep.

## Motivation

Early returns keep the happy path at the left margin, making functions scannable top-to-bottom.
Guard clauses at the top of a function handle edge cases immediately, so readers don't need to
track nested else branches. TypeScript's type narrowing works naturally with early returns.

## Before / After

### From this codebase: axis resolution (src/resolve.ts:32-61)

**Before:** (current — already follows the rule)
```ts
function resolveAxisValue(raw: string, axisName: string, builtinValues: readonly string[], loadedConfig: LoadedConfig | null): string {
  // 1. Built-in value
  if (builtinValues.includes(raw)) return raw;

  // 2. Config-defined custom name
  const configAxes = loadedConfig?.config.axes?.[axisName];
  if (configAxes && raw in configAxes) {
    return resolveConfigPath(loadedConfig!.configDir, configAxes[raw]);
  }

  // 3. File path
  if (looksLikeFilePath(raw)) {
    return isAbsolute(raw) ? raw : pathResolve(raw);
  }

  // 4. Unknown — throw
  throw new Error(`Unknown --${axisName} value: "${raw}". ...`);
}
```

### Synthetic example: nested conditional anti-pattern

**Before:**
```ts
function processModifier(raw: string, config: LoadedConfig | null): ResolvedModifier {
  if (config) {
    if (config.config.modifiers) {
      if (raw in config.config.modifiers) {
        return { kind: "custom", path: resolveConfigPath(config.configDir, config.config.modifiers[raw]) };
      } else {
        if (looksLikeFilePath(raw)) {
          return { kind: "custom", path: pathResolve(raw) };
        } else {
          throw new Error(`Unknown modifier: "${raw}"`);
        }
      }
    } else {
      if (looksLikeFilePath(raw)) {
        return { kind: "custom", path: pathResolve(raw) };
      } else {
        throw new Error(`Unknown modifier: "${raw}"`);
      }
    }
  } else {
    if (looksLikeFilePath(raw)) {
      return { kind: "custom", path: pathResolve(raw) };
    } else {
      throw new Error(`Unknown modifier: "${raw}"`);
    }
  }
}
```

**After:**
```ts
function processModifier(raw: string, config: LoadedConfig | null): ResolvedModifier {
  const configModifiers = config?.config.modifiers;
  if (configModifiers && raw in configModifiers) {
    return { kind: "custom", path: resolveConfigPath(config!.configDir, configModifiers[raw]) };
  }

  if (looksLikeFilePath(raw)) {
    return { kind: "custom", path: isAbsolute(raw) ? raw : pathResolve(raw) };
  }

  throw new Error(`Unknown modifier: "${raw}"`);
}
```

## Exceptions

- Switch statements with many cases are fine — they're flat, not nested
- A single level of nesting inside a loop body is acceptable (loop + one if)

## Scope

- Applies to: all functions in `src/`
- Does NOT apply to: test assertion blocks (describe/it nesting is fine)
