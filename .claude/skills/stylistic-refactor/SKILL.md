---
name: stylistic-refactor
description: >
  Project stylistic refactoring rules for Bun/TypeScript CLI. Proactively scans for refactoring
  opportunities and produces a prioritized plan. Defines the team's preferred coding style.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Agent, Write
---

# Stylistic Refactor

Scan the codebase for opportunities to apply these stylistic preferences.
Each style has a reference file with rationale, examples, and exceptions.

## Styles

| Style | Rule (one line) | Reference |
|-------|-----------------|-----------|
| Functions Over Classes | Use top-level functions and plain objects; never introduce classes | [details](references/functions-over-classes.md) |
| Early Returns | Use guard clauses and early returns; never nest more than 2 levels deep | [details](references/early-returns.md) |
| Declarative/Imperative Split | Declarative (.map/.filter) for pure transforms; imperative for-loops for side effects | [details](references/declarative-imperative-split.md) |
| Immutable First | Create new objects via spread; mutate only caller-owned local data | [details](references/immutable-first.md) |
| Ternary Discipline | Ternaries for simple 2-branch expressions only; if/else for anything complex | [details](references/ternary-discipline.md) |
| Verb-First Naming | Functions start with verbs; booleans use is/has prefixes | [details](references/verb-first-naming.md) |
| Concatenation Style | Template literals for multi-line strings; + concatenation for simple joins | [details](references/concatenation-style.md) |

## Output

Write the refactoring plan to `docs/stylistic-refactor-plan.md` (create `docs/` if needed).

The document should be a **prioritized refactoring plan** with these sections:

### High Value
Implement-ready entries with file:line, current code, target code, and acceptance criteria.

### Worth Considering
Valid refactors with moderate impact. Brief entries with file paths and rationale.

### Not Worth It
Code that technically violates a style but should NOT be refactored, with explanation why.
