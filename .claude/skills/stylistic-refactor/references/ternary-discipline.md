# Style: Ternary Discipline

> Use ternaries for simple two-branch expressions; use if/else for anything complex or multi-line.

## Motivation

Ternaries are compact for simple conditional assignments. But nested ternaries or ternaries
with long expressions hurt readability. The rule: if both branches fit on one line and are
simple values or short function calls, use a ternary. Otherwise, use if/else.

## Before / After

### From this codebase: good ternary (src/resolve.ts:49)

**Before:** (current — correct, simple two-branch)
```ts
return isAbsolute(raw) ? raw : pathResolve(raw);
```

### From this codebase: borderline nested ternary (src/resolve.ts:163-171)

**Before:** (current)
```ts
agency = parsed.overrides.agency
  ? resolveAxisValue(parsed.overrides.agency, "agency", AGENCY_VALUES, loadedConfig)
  : preset.axes.agency;
```

This is acceptable — it's a single ternary where each branch is a clear expression. The line
wrapping is for readability, not complexity.

### Synthetic example: nested ternary anti-pattern

**Before:**
```ts
const value = isBuiltin(raw)
  ? raw
  : isConfigDefined(raw, config)
    ? resolveConfigPath(config.dir, config.values[raw])
    : looksLikeFilePath(raw)
      ? pathResolve(raw)
      : throwError(raw);
```

**After:**
```ts
if (isBuiltin(raw)) return raw;
if (isConfigDefined(raw, config)) return resolveConfigPath(config.dir, config.values[raw]);
if (looksLikeFilePath(raw)) return pathResolve(raw);
throw new Error(`Unknown value: "${raw}"`);
```

## Exceptions

- Assignment ternaries that wrap to two lines for readability (like the `agency =` example above) are fine — they're still one ternary, not nested
- Ternaries inside template literals are acceptable when short: `` `Status: ${isGit ? "repo" : "none"}` ``

## Scope

- Applies to: all conditional expressions in `src/`
- Does NOT apply to: type-level conditionals (TypeScript conditional types use ternary syntax by design)
