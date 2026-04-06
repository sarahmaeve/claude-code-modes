# Rule: No Barrel Exports

> No index.ts re-export files. Always import directly from the source module.

## Motivation

Barrel files (index.ts that re-exports from multiple modules) obscure where things are defined.
When you see `import { resolveConfig } from "./index.js"`, you don't know which module owns it.
Direct imports make the dependency graph explicit and keep IDE "go to definition" pointing at
the real source. In a flat project, barrels add a layer of indirection with no navigation benefit.

## Before / After

### From this codebase: direct imports (correct)

**Before:** (current — already follows the rule)
```ts
// src/build-prompt.ts — imports directly from each module
import { parseCliArgs } from "./args.js";
import { loadConfig } from "./config.js";
import { resolveConfig } from "./resolve.js";
import { assemblePrompt, writeTempPrompt } from "./assemble.js";
import { detectEnv, buildTemplateVars } from "./env.js";
```

Each import line tells you exactly which module owns the function.

### Synthetic example: barrel file anti-pattern

**Before:**
```ts
// src/index.ts (barrel)
export { parseCliArgs } from "./args.js";
export { loadConfig } from "./config.js";
export { resolveConfig } from "./resolve.js";
export { assemblePrompt } from "./assemble.js";

// src/build-prompt.ts
import { parseCliArgs, loadConfig, resolveConfig, assemblePrompt } from "./index.js";
```

**After:**
```ts
// No index.ts — direct imports
import { parseCliArgs } from "./args.js";
import { loadConfig } from "./config.js";
import { resolveConfig } from "./resolve.js";
import { assemblePrompt } from "./assemble.js";
```

## Exceptions

- If subdirectories are introduced (per the flat-by-default rule), a subdirectory may have
  one index.ts that curates its public API — but only if the subdirectory has 3+ files
- Package entry point (package.json `main`/`exports`) is not a barrel — it's a build artifact

## Scope

- Applies to: all `src/` TypeScript files
- Does NOT apply to: package.json entry points, build output
