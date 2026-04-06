# Style: Verb-First Naming

> Functions start with a verb (detect, parse, resolve, validate, build, assemble, read, check, apply). Booleans use is/has prefixes.

## Motivation

Verb-first function names make call sites read like sentences: `parseCliArgs(argv)`,
`resolveConfig(parsed, loaded)`, `assemblePrompt(options)`. Boolean prefixes (`is`, `has`)
make conditions read naturally: `if (isGit)`, `if (flags.readonly)`. This consistency
eliminates ambiguity about what a function does vs what a value represents.

## Before / After

### From this codebase: consistent verb-first naming

```ts
// src/env.ts — functions
function exec(command: string): string | null
export function detectEnv(): EnvInfo
export function buildTemplateVars(env: EnvInfo): TemplateVars

// src/resolve.ts — functions
function looksLikeFilePath(value: string): boolean
function resolveAxisValue(raw: string, ...): string
function resolveModifier(raw: string, ...): { kind: string; ... }
function applyModifiers(modifiers: string[], ...): void
export function resolveConfig(parsed: ParsedArgs, ...): ModeConfig

// src/env.ts — booleans
isGit: boolean
```

### Synthetic example: noun-based naming anti-pattern

**Before:**
```ts
function config(parsed: ParsedArgs): ModeConfig { /* ... */ }
function fragments(mode: ModeConfig): string[] { /* ... */ }
const gitRepo = exec("git rev-parse ...") === "true";
```

**After:**
```ts
function resolveConfig(parsed: ParsedArgs): ModeConfig { /* ... */ }
function getFragmentOrder(mode: ModeConfig): string[] { /* ... */ }
const isGit = exec("git rev-parse ...") === "true";
```

## Exceptions

- Private helper functions that are tiny predicates can use `looksLike` or `is` prefix instead of a verb (e.g., `looksLikeFilePath`, `isPresetName`)
- Constants and type names are noun-based (that's correct: `AGENCY_VALUES`, `ModeConfig`)

## Scope

- Applies to: all exported and private function names in `src/`
- Does NOT apply to: type names, interface names, constant names, test descriptions
