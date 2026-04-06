---
name: structural-refactor
description: >
  Project structural organization rules for Bun/TypeScript CLI. Proactively scans for
  organizational issues and produces a prioritized plan. Defines file, folder, and module
  structure preferences.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent, Write
---

# Structural Refactor

Scan the codebase for organizational issues based on these structural rules.
Each rule has a reference file with rationale, examples, and exceptions.

## Rules

| Rule | Summary (one line) | Reference |
|------|-------------------|-----------|
| Flat by Default | Keep src/ flat; group into subdirectories only when 3+ files share a concern | [details](references/flat-by-default.md) |
| Soft 300-Line Limit | Implementation files should stay under 300 lines; split when single-domain logic exceeds it | [details](references/file-size-limit.md) |
| Test Co-location | Unit tests next to source (file.test.ts); integration/e2e tests also in src/ | [details](references/test-colocation.md) |
| Centralized Types | All domain types/interfaces/enums in types.ts; no local type definitions | [details](references/centralized-types.md) |
| No Barrel Exports | No index.ts re-export files; always import directly from the source module | [details](references/no-barrel-exports.md) |
| Prompt Domain Organization | Prompts organized by domain concept (axis/modifier), not by implementation | [details](references/prompt-domain-org.md) |
| kebab-case Files | All source files use kebab-case; test files use {source}.test.ts suffix | [details](references/kebab-case-files.md) |

## Output

Write the refactoring plan to `docs/structural-refactor-plan.md`.

The document should be a **prioritized refactoring plan** with these sections:

### High Value
Implement-ready entries with file paths, current layout, target layout, and acceptance criteria.

### Worth Considering
Valid reorganizations with moderate impact. Brief entries with paths and rationale.

### Not Worth It
Code that technically violates a rule but should NOT be reorganized, with explanation why.
