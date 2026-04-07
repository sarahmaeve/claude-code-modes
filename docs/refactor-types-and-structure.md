# Refactor Plan: Types Cleanup and Structural Improvements

## Overview

The codebase has grown organically through feature additions (custom prompts, base design system). Three main structural issues emerged:

1. **The `as readonly string[]` cast appears 12+ times** across 6 files — a TypeScript limitation workaround that can be solved once with typed predicates
2. **`printUsage()` is duplicated** identically between `cli.ts` and `build-prompt.ts` (~50 lines each)
3. **Config validation is verbose** — repeated type-check-then-cast blocks in `validateConfig` that could use helper functions

Lower-priority: the three resolver functions in `resolve.ts` follow the same 4-step pattern but differ enough in return types and error messages that a generic abstraction would obscure more than it helps. Skip that one.

## Refactor Steps

### Step 1: Add typed predicate functions to types.ts

**Priority**: High
**Risk**: Low
**Files**: `src/types.ts`

**Current State**:
Every module that checks membership in a const array needs the cast:
```typescript
if ((BUILTIN_BASE_NAMES as readonly string[]).includes(value)) { ... }
if ((PRESET_NAMES as readonly string[]).includes(name)) { ... }
```

**Target State**:
Add predicate functions next to each const array in `types.ts`:
```typescript
export const BUILTIN_BASE_NAMES = ["standard", "chill"] as const;
export type BuiltinBaseName = (typeof BUILTIN_BASE_NAMES)[number];
export function isBuiltinBase(value: string): value is BuiltinBaseName {
  return (BUILTIN_BASE_NAMES as readonly string[]).includes(value);
}

export const BUILTIN_MODIFIER_NAMES = ["readonly", "context-pacing"] as const;
export type BuiltinModifier = (typeof BUILTIN_MODIFIER_NAMES)[number];
export function isBuiltinModifier(value: string): value is BuiltinModifier {
  return (BUILTIN_MODIFIER_NAMES as readonly string[]).includes(value);
}

export const PRESET_NAMES = ["create", "extend", "safe", "refactor", "explore", "none"] as const;
export type PresetName = (typeof PRESET_NAMES)[number];
export function isPresetName(value: string): value is PresetName {
  return (PRESET_NAMES as readonly string[]).includes(value);
}

// AXIS_BUILTINS already exists; add a generic predicate
export function isBuiltinAxisValue(axis: "agency" | "quality" | "scope", value: string): boolean {
  return (AXIS_BUILTINS[axis] as readonly string[]).includes(value);
}
```

The `as readonly string[]` cast happens exactly once per predicate, in `types.ts`. Every other module uses the predicate and gets proper type narrowing for free.

**Implementation Notes**:
- `isPresetName` already exists in `presets.ts` — move it to `types.ts` (it belongs with the type definition per Single Source of Truth) and re-export from `presets.ts` for backwards compat during this step, then remove the re-export in step 2
- The predicates are type guards (`value is X`) where useful, plain `boolean` where the narrowed type isn't needed
- Each predicate is a private-helper-style function defined immediately after its const array

**Acceptance Criteria**:
- [ ] Build passes (`bunx tsc --noEmit`)
- [ ] Tests pass (`bun test`)
- [ ] No `as readonly string[]).includes` patterns remain outside of `types.ts`
- [ ] `isPresetName` moved from `presets.ts` to `types.ts`

---

### Step 2: Replace all `as readonly string[]` casts with predicates

**Priority**: High
**Risk**: Low
**Files**: `src/resolve.ts`, `src/config.ts`, `src/config-cli.ts`, `src/assemble.ts`, `src/presets.ts`

**Current State** (example from `config.ts`):
```typescript
export function checkModifierNameCollision(name: string): void {
  if ((BUILTIN_MODIFIER_NAMES as readonly string[]).includes(name)) {
    throw new Error(...);
  }
}
```

**Target State**:
```typescript
export function checkModifierNameCollision(name: string): void {
  if (isBuiltinModifier(name)) {
    throw new Error(...);
  }
}
```

Apply the same replacement across all 12+ call sites:
- `config.ts`: `checkModifierNameCollision`, `checkPresetNameCollision`, `checkBaseNameCollision`, `checkAxisValueCollision`
- `resolve.ts`: `resolveModifier`, `resolveBase`
- `assemble.ts`: `loadBaseManifest`, `resolveFragmentPath`
- `config-cli.ts`: axis validation checks
- `presets.ts`: remove `isPresetName` (now in types.ts)

**Implementation Notes**:
- Import the predicates from `types.ts` in each file
- Remove the direct imports of the const arrays where they were only used for `.includes()` checks
- `presets.ts` can remove its own `isPresetName` and the `PRESET_NAMES` import if no other usage remains

**Acceptance Criteria**:
- [ ] Build passes
- [ ] Tests pass
- [ ] `grep -r "as readonly string\[\]" src/` returns only `types.ts` hits
- [ ] No behavior changes (same error messages, same logic)

---

### Step 3: Extract shared `printUsage` to a common location

**Priority**: High
**Risk**: Low
**Files**: `src/cli.ts`, `src/build-prompt.ts`

**Current State**:
`printUsage()` is defined identically in both files (~50 lines each). Any change (like adding `--base chill` to examples) must be made in both places.

**Target State**:
Extract to `src/usage.ts`:
```typescript
export function printUsage(): void {
  const usage = `Usage: claude-mode [preset] [options] ...`;
  process.stdout.write(usage + "\n");
}
```

Both `cli.ts` and `build-prompt.ts` import and call `printUsage()`.

**Implementation Notes**:
- `usage.ts` is a new file — but it's a single exported function, not a module with complex dependencies. Acceptable per the "create new files only when code doesn't belong in any existing module" convention.
- Alternatively, could put it in an existing file, but there's no natural home — it's not types, not args, not config. A dedicated file is cleaner.
- The function is private-helper-adjacent: it has no dependencies, no imports, just a string constant.

**Acceptance Criteria**:
- [ ] Build passes
- [ ] Tests pass (help/usage CLI tests should still work unchanged)
- [ ] `grep -r "function printUsage" src/` returns only `usage.ts`
- [ ] `cli.ts` and `build-prompt.ts` both import from `usage.ts`

---

### Step 4: Extract config validation helpers

**Priority**: Medium
**Risk**: Low
**Files**: `src/config.ts`

**Current State** (repeated ~8 times in `validateConfig`):
```typescript
if (typeof obj.bases !== "object" || obj.bases === null || Array.isArray(obj.bases)) {
  throw new Error(`Invalid config file ${configPath}: "bases" must be an object (Record<string, string>)`);
}
for (const [key, val] of Object.entries(obj.bases as Record<string, unknown>)) {
  if (typeof val !== "string") {
    throw new Error(`Invalid config file ${configPath}: "bases.${key}" must be a string`);
  }
}
```

**Target State**:
Add private helpers before `validateConfig`:
```typescript
/** Validates a value is a Record<string, string>. Returns the typed record or throws. */
function validateStringRecord(
  value: unknown,
  fieldName: string,
  configPath: string,
): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Invalid config file ${configPath}: "${fieldName}" must be an object (Record<string, string>)`);
  }
  const record = value as Record<string, unknown>;
  for (const [key, val] of Object.entries(record)) {
    if (typeof val !== "string") {
      throw new Error(`Invalid config file ${configPath}: "${fieldName}.${key}" must be a string`);
    }
  }
  return record as Record<string, string>;
}

/** Validates a value is a string[]. Returns the typed array or throws. */
function validateStringArray(
  value: unknown,
  fieldName: string,
  configPath: string,
): string[] {
  if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
    throw new Error(`Invalid config file ${configPath}: "${fieldName}" must be an array of strings`);
  }
  return value as string[];
}
```

Then `validateConfig` becomes:
```typescript
if (obj.bases !== undefined) {
  const bases = validateStringRecord(obj.bases, "bases", configPath);
  for (const key of Object.keys(bases)) checkBaseNameCollision(key);
}
if (obj.modifiers !== undefined) {
  const mods = validateStringRecord(obj.modifiers, "modifiers", configPath);
  for (const key of Object.keys(mods)) checkModifierNameCollision(key);
}
if (obj.defaultModifiers !== undefined) {
  validateStringArray(obj.defaultModifiers, "defaultModifiers", configPath);
}
```

**Implementation Notes**:
- These are private helpers (unexported, before their caller) per the project's convention
- The `as` casts still exist inside the helpers, but they're now behind runtime validation — each cast is guaranteed safe by the preceding check
- This cuts `validateConfig` from ~150 lines to ~80 lines
- Error messages stay identical — the helpers produce the same format

**Acceptance Criteria**:
- [ ] Build passes
- [ ] Tests pass (config validation tests should produce identical error messages)
- [ ] `validateConfig` is noticeably shorter
- [ ] All `as Record<string, unknown>` casts in config.ts are inside validation helpers, not in `validateConfig` directly

---

### Step 5: Clean up dead action variant files

**Priority**: Low
**Risk**: Low
**Files**: `prompts/base/actions-autonomous.md`, `prompts/base/actions-cautious.md`

**Current State**:
`actions-autonomous.md` and `actions-cautious.md` still exist on disk but are no longer referenced by any manifest or code (replaced by single `actions.md` in the base design system work).

**Target State**:
Delete both files. They're dead code.

**Implementation Notes**:
- Verify with `grep -r "actions-autonomous\|actions-cautious" src/ prompts/ scripts/` that no code references them
- The embedded prompts generator no longer lists them
- Tests no longer reference them

**Acceptance Criteria**:
- [ ] Build passes
- [ ] Tests pass
- [ ] `bun scripts/generate-prompts.ts` succeeds
- [ ] `grep -r "actions-autonomous\|actions-cautious" src/ scripts/` returns no hits

---

## Implementation Order

1. **Step 1**: Typed predicates in types.ts (foundation for step 2)
2. **Step 2**: Replace all cast sites with predicates (depends on step 1)
3. **Step 3**: Extract printUsage (independent of 1-2)
4. **Step 4**: Config validation helpers (independent of 1-3)
5. **Step 5**: Delete dead files (independent, do last for cleanliness)

Steps 1-2 are sequential. Steps 3, 4, 5 are independent of each other and of 1-2 — they can run in any order after step 2 if desired, or in parallel.

## What I Considered and Skipped

**Generic resolver abstraction**: The three resolve functions (`resolveAxisValue`, `resolveModifier`, `resolveBase`) follow the same 4-step pattern. However, they differ in return types (`string` vs `{ kind, name/path }`), config lookup shape, error message details, and edge case handling. A generic `createResolver<T>()` would need so many parameters it would be harder to read than the three concrete functions. The duplication here is structural similarity, not copy-paste — each function earns its existence.

**Error handling extraction in cli.ts/build-prompt.ts**: The try/catch → stderr → exit pattern repeats 10+ times across both entry points. However, these are the CLI boundary — they're *supposed* to be explicit about error handling per the fail-fast pattern. Extracting a `handleError(fn)` wrapper would hide the control flow. The repetition is acceptable at the boundary.

**Config collision checker consolidation**: Four `check*Collision` functions could become one `checkNameCollision(kind, name)`. But the four-function API is already clear and each has distinct error messages with specific valid values listed. Consolidating would save ~20 lines but make error messages more generic. Not worth it.
