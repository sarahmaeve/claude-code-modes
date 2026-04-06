# Rule: Centralized Types

> All domain types, interfaces, and enums live in types.ts. Implementation files import from types.ts; they do not define their own domain types.

## Motivation

A single `types.ts` file is the schema of the entire project. When you need to understand
the data model, you read one file. This prevents type drift where the same concept is defined
slightly differently in multiple places. The `as const` enum arrays in types.ts serve as
both runtime validators and type definitions — a single source of truth.

## Before / After

### From this codebase: types.ts as single source (correct)

**Before:** (current — already follows the rule)
```ts
// src/types.ts — ALL domain types here
export const AGENCY_VALUES = ["autonomous", "collaborative", "surgical"] as const;
export type Agency = (typeof AGENCY_VALUES)[number];

export const QUALITY_VALUES = ["architect", "pragmatic", "minimal"] as const;
export type Quality = (typeof QUALITY_VALUES)[number];

export interface ModeConfig { ... }
export interface AxisConfig { ... }
export interface EnvInfo { ... }
export interface TemplateVars { ... }
export interface AssembleOptions { ... }
```

All other files import from `types.js`:
```ts
// src/resolve.ts
import type { ModeConfig } from "./types.js";
import { AGENCY_VALUES, QUALITY_VALUES, SCOPE_VALUES } from "./types.js";
```

### Synthetic example: scattered type definitions (anti-pattern)

**Before:**
```ts
// src/resolve.ts — defining its own types
interface ResolvedAxis { agency: string; quality: string; scope: string; }

// src/assemble.ts — different name for same concept
interface AxisValues { agency: string; quality: string; scope: string; }
```

**After:**
```ts
// src/types.ts — single definition
export interface AxisConfig { agency: string; quality: string; scope: string; }

// Both files import it
import type { AxisConfig } from "./types.js";
```

## Exceptions

- Module-internal interfaces exported for callers (e.g., `ParsedArgs` in args.ts, `LoadedConfig` in config.ts) are fine — these are the module's public API contract, not domain types
- Type narrowing helpers (`as const` casts) within a function body are fine

## Scope

- Applies to: domain-level types shared across modules (ModeConfig, AxisConfig, EnvInfo, etc.)
- Does NOT apply to: module-specific return types that are part of the module's API (ParsedArgs, LoadedConfig)
