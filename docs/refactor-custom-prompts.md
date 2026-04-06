# Refactor Plan: Post-Custom-Prompts Cleanup

## Overview

The custom prompts feature (Units 1-7) was implemented by two agents working sequentially. The code works — 212 tests pass — but introduced duplication between `config.ts` and `config-cli.ts`, repetitive modifier resolution logic in `resolve.ts`, exported helpers that should be private, and stale pattern documentation. This plan addresses these in 5 incremental steps.

## Refactor Steps

### Step 1: Extract modifier resolution helper in resolve.ts

**Priority**: High
**Risk**: Low
**Files**: `src/resolve.ts`

**Current State**:
Three nearly identical loops resolve modifiers and apply builtin flags (lines 113-123, 127-137, 192-204):

```typescript
// Appears 3 times with minor variations
for (const raw of someModifierList) {
  const resolved = resolveModifier(raw, loadedConfig);
  if (resolved.kind === "builtin") {
    if (resolved.name === "readonly") readonlyFlag = true;
    if (resolved.name === "context-pacing") contextPacingFlag = true;
  } else {
    customModifierPaths.push(resolved.path); // or unshift for presets
  }
}
```

**Target State**:
Extract a private helper that encapsulates the resolution + flag application:

```typescript
/** Resolves a list of modifier references, updating flags and custom paths. */
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

Then the three call sites become:

```typescript
const flags = { readonly: parsed.modifiers.readonly, contextPacing: parsed.modifiers.contextPacing };
const customModifierPaths: string[] = [];

if (config?.defaultModifiers) {
  applyModifiers(config.defaultModifiers, loadedConfig, flags, customModifierPaths, "append");
}
applyModifiers(parsed.customModifiers, loadedConfig, flags, customModifierPaths, "append");
// ... later, for preset modifiers:
if (customPreset.modifiers) {
  applyModifiers(customPreset.modifiers, loadedConfig, flags, customModifierPaths, "prepend");
}
```

**Implementation Notes**:
- `applyModifiers` is a private helper (unexported, before `resolveConfig`)
- Deduplication check (`!customPaths.includes`) is built into the helper
- The `position` parameter distinguishes preset modifiers (prepend) from defaults/CLI (append)

**Acceptance Criteria**:
- [ ] `bun test` — all 212 tests pass
- [ ] No duplicated modifier resolution logic in `resolveConfig`
- [ ] Modifier ordering preserved: defaults → preset (prepended) → CLI

---

### Step 2: Share config validation between config.ts and config-cli.ts

**Priority**: High
**Risk**: Low
**Files**: `src/config.ts`, `src/config-cli.ts`

**Current State**:
`config-cli.ts:readConfig` (lines 33-49) duplicates the JSON parse + object validation from `config.ts:loadConfig` (lines 46-57, 71-75):

```typescript
// config-cli.ts:readConfig — duplicated logic
const text = readFileSync(configPath, "utf8");
raw = JSON.parse(text);
// ... catch ...
if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
  throw new Error(`Invalid config file ${configPath}: top-level value must be an object`);
}
return raw as UserConfig;
```

**Target State**:
Export a `readConfigFile(configPath: string): UserConfig` function from `config.ts` that handles JSON parse + basic object validation. Both `loadConfig()` and `config-cli.ts:readConfig()` use it.

```typescript
// config.ts — new export
export function readConfigFile(configPath: string): UserConfig {
  let raw: unknown;
  try {
    const text = readFileSync(configPath, "utf8");
    raw = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Invalid config file ${configPath}: ${(err as Error).message}`
    );
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error(
      `Invalid config file ${configPath}: top-level value must be an object`
    );
  }
  return raw as UserConfig;
}
```

Then `config-cli.ts:readConfig` becomes:

```typescript
import { readConfigFile } from "./config.js";

function readConfig(configPath: string): UserConfig {
  if (!existsSync(configPath)) return {};
  return readConfigFile(configPath);
}
```

And `config.ts:loadConfig` uses it internally:

```typescript
const config = validateConfig(readConfigFile(configPath), configPath);
```

**Implementation Notes**:
- `readConfigFile` does NOT run `validateConfig` — it just parses JSON and checks the top-level type. `loadConfig` calls `validateConfig` after for full schema validation. The CLI's `readConfig` skips full validation since it's about to modify the config.
- This also centralizes the error message format for JSON parse errors.

**Acceptance Criteria**:
- [ ] `bun test` — all 212 tests pass
- [ ] `config-cli.ts` no longer duplicates JSON parsing logic
- [ ] `config.ts:loadConfig` uses `readConfigFile` internally
- [ ] Error messages unchanged

---

### Step 3: Share collision checking between config.ts and config-cli.ts

**Priority**: High
**Risk**: Low
**Files**: `src/types.ts`, `src/config.ts`, `src/config-cli.ts`

**Current State**:
Collision checks appear in both `config.ts:validateConfig` and `config-cli.ts` command handlers:

```typescript
// config.ts:104 — modifier collision
if ((BUILTIN_MODIFIER_NAMES as readonly string[]).includes(key)) {
  throw new Error(`...modifier name "${key}" collides with a built-in modifier name...`);
}

// config-cli.ts:112 — modifier collision (different message)
if ((BUILTIN_MODIFIER_NAMES as readonly string[]).includes(name)) {
  throw new Error(`"${name}" is a built-in modifier name...`);
}

// config.ts:150 — preset collision
if ((PRESET_NAMES as readonly string[]).includes(presetName)) { ... }

// config-cli.ts:196 — preset collision (different message)
if ((PRESET_NAMES as readonly string[]).includes(name)) { ... }
```

Also, `config-cli.ts:150-154` defines an `axisBuiltins` mapping that would be useful elsewhere.

**Target State**:
Add an `AXIS_BUILTINS` map to `types.ts` and collision check helpers to `config.ts`:

```typescript
// types.ts — new export
export const AXIS_BUILTINS: Record<"agency" | "quality" | "scope", readonly string[]> = {
  agency: AGENCY_VALUES,
  quality: QUALITY_VALUES,
  scope: SCOPE_VALUES,
};
```

```typescript
// config.ts — new exports
export function checkModifierNameCollision(name: string): void {
  if ((BUILTIN_MODIFIER_NAMES as readonly string[]).includes(name)) {
    throw new Error(
      `"${name}" is a built-in modifier name (${BUILTIN_MODIFIER_NAMES.join(", ")}); choose a different name`
    );
  }
}

export function checkPresetNameCollision(name: string): void {
  if ((PRESET_NAMES as readonly string[]).includes(name)) {
    throw new Error(
      `"${name}" is a built-in preset name (${PRESET_NAMES.join(", ")}); choose a different name`
    );
  }
}

export function checkAxisValueCollision(axis: "agency" | "quality" | "scope", name: string): void {
  const builtins = AXIS_BUILTINS[axis];
  if ((builtins as readonly string[]).includes(name)) {
    throw new Error(
      `"${name}" is a built-in ${axis} value (${builtins.join(", ")}); choose a different name`
    );
  }
}
```

Both `validateConfig` and `config-cli.ts` call these helpers instead of inlining the checks.

**Implementation Notes**:
- Error messages in `config.ts:validateConfig` currently prefix with `Invalid config file ${path}: ` — the helper throws a generic message, and `validateConfig` catches + re-wraps with the file context. OR: `validateConfig` can just use the generic message since it already includes the collision detail.
- `AXIS_BUILTINS` replaces the local `axisBuiltins` in `config-cli.ts:150-154`.

**Acceptance Criteria**:
- [ ] `bun test` — all 212 tests pass
- [ ] `AXIS_BUILTINS` exported from `types.ts`
- [ ] Collision check helpers exported from `config.ts`
- [ ] No inline collision checks remain in `config-cli.ts`
- [ ] `validateConfig` uses the shared helpers

---

### Step 4: Un-export internal helpers in assemble.ts

**Priority**: Medium
**Risk**: Medium (test imports change)
**Files**: `src/assemble.ts`, `src/assemble.test.ts`

**Current State**:
`readFragment`, `substituteTemplateVars`, and `getFragmentOrder` are exported despite being internal implementation details of `assemblePrompt`. Tests import and test them directly.

```typescript
export function readFragment(...): string | null { ... }
export function substituteTemplateVars(...): string { ... }
export function getFragmentOrder(...): string[] { ... }
export function assemblePrompt(...): string { ... }
export function writeTempPrompt(...): string { ... }
```

**Target State**:
Only `assemblePrompt` and `writeTempPrompt` are exported. Tests exercise the helpers through `assemblePrompt` and `getFragmentOrder`-level assertions via the assembled output.

However — `getFragmentOrder` and `substituteTemplateVars` are independently testable and their tests are valuable. Rather than removing those tests, keep the functions exported but document them as internal-test-only exports:

Actually, re-evaluating: the pattern doc says "When the helper has independent testability value — consider exporting it." These helpers do have testability value (fragment ordering logic is complex, template substitution has edge cases). **Keep them exported.** The pattern violation flagged by the agent was incorrect — the "When NOT to Use" exception applies.

**Decision**: Skip this step. The exports are justified per the pattern's own exception clause. Update the pattern doc instead to reflect the current state.

---

### Step 5: Update stale pattern documentation

**Priority**: Medium
**Risk**: None (docs only)
**Files**: `.claude/skills/patterns/pipeline.md`, `.claude/skills/patterns/as-const-enum.md`, `.claude/skills/patterns/private-module-helpers.md`, `.claude/skills/patterns/fail-fast-errors.md`, `.claude/skills/patterns/test-fixture-spread.md`

**Current State**:
Pattern docs reference file:line ranges that have shifted after the custom prompts implementation:
- `pipeline.md` references `src/args.ts:6-22` for ParsedArgs — now has additional fields
- `pipeline.md` references `src/resolve.ts:9-49` — now 237 lines with config awareness
- `as-const-enum.md` references `src/args.ts:83-89` for validateAxisValue — that function moved to resolve.ts
- `private-module-helpers.md` references `src/assemble.ts:10-82` — file is now 143 lines
- `private-module-helpers.md` Example 2 references `validateAxisValue` in args.ts — it no longer exists there
- `test-fixture-spread.md` references `src/resolve.test.ts:5-11` — baseParsed now has more fields

**Target State**:
Update all pattern examples to reflect current code: correct line ranges, correct function locations, updated code snippets. Add examples from the new modules (config.ts, config-cli.ts, resolve.ts) where they demonstrate patterns well.

**Implementation Notes**:
- Read each pattern file, check each example's file:line reference, update to match current code
- Add new examples where the custom prompts code demonstrates patterns (e.g., `resolveAxisValue` in resolve.ts is a good fail-fast example)
- Remove the `validateAxisValue` example from `private-module-helpers.md` since it no longer exists in args.ts. Replace with `looksLikeFilePath` or `resolveAxisValue` from resolve.ts.

**Acceptance Criteria**:
- [ ] All file:line references in pattern docs match actual code
- [ ] No pattern example references removed functions
- [ ] Code snippets in patterns match the current implementation
- [ ] `bun test` still passes (docs-only change, no code affected)

---

### Step 6: Extract shared test helper for temp directories

**Priority**: Low
**Risk**: Low
**Files**: `src/test-helpers.ts`, `src/config.test.ts`, `src/config-cli.test.ts`

**Current State**:
Both `config.test.ts` and `config-cli.test.ts` define their own `makeTempDir()` function:

```typescript
// config.test.ts
function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "config-test-"));
}

// config-cli.test.ts
function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "config-cli-test-"));
}
```

**Target State**:
Add `makeTempDir(prefix: string)` to `test-helpers.ts` and import in both test files:

```typescript
// test-helpers.ts — new export
export function makeTempDir(prefix = "test-"): string {
  return mkdtempSync(join(tmpdir(), prefix));
}
```

**Acceptance Criteria**:
- [ ] `bun test` — all 212 tests pass
- [ ] `makeTempDir` defined once in `test-helpers.ts`
- [ ] Both config test files import from `test-helpers.ts`

---

## Implementation Order

1. **Step 1** — Modifier resolution helper in resolve.ts (highest duplication count, self-contained)
2. **Step 2** — Shared config file reading (reduces config.ts ↔ config-cli.ts coupling)
3. **Step 3** — Shared collision checking (depends on step 2's pattern)
4. **Step 5** — Pattern doc updates (no code changes, can be done anytime)
5. **Step 6** — Test helper extraction (lowest value, do last)

Step 4 was skipped (exports are justified).
