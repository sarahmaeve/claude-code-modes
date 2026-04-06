# Rule: Soft 300-Line Limit

> Implementation files should stay under 300 lines. Consider splitting when a file exceeds this, but single-domain files can go over if splitting would fragment cohesive logic.

## Motivation

Files under 300 lines are scannable in a single sitting. Longer files usually signal that
a module handles multiple concerns that could be separated. The limit is soft because some
single-domain files (like `validateConfig` with sequential validation blocks) are inherently
long but cohesive — splitting them would scatter related logic.

## Before / After

### From this codebase: config-cli.ts (319 lines, borderline)

**Before:** (current)
```
src/config-cli.ts    319 lines — handles all config subcommands
```

This is borderline. It handles `config add-modifier`, `config add-axis`, `config add-preset`,
`config remove`, and `config show` — 5 subcommands in one file. Currently acceptable because
each subcommand is a focused function, but if new subcommands are added it should split.

### Synthetic example: file exceeding 300 lines with two concerns

**Before:**
```
src/resolve.ts       450 lines
  — resolveAxisValue()      (60 lines)
  — resolveModifier()       (35 lines)
  — applyModifiers()        (20 lines)
  — resolveConfig()         (100 lines)
  — validateResolvedConfig() (80 lines)  ← new validation concern
  — formatConfigReport()    (60 lines)   ← new reporting concern
```

**After:**
```
src/resolve.ts       215 lines  — resolution logic only
src/resolve-report.ts 60 lines  — config reporting (if needed)
```

Split by concern, not by arbitrary line count. The validation stays with resolution because
it's tightly coupled.

## Exceptions

- Test files can exceed 300 lines freely — comprehensive tests are valuable
- Sequential validation functions (like `validateConfig`) that check one domain exhaustively
- Files that are long due to exhaustive `as const` arrays or type definitions

## Scope

- Applies to: implementation files in `src/` (not `.test.ts`)
- Does NOT apply to: test files, prompt markdown files, documentation
