# Rule: kebab-case Files

> All source files use kebab-case naming. Test files use the {source-name}.test.ts suffix.

## Motivation

kebab-case is the most common convention for TypeScript/JavaScript file naming and avoids
case-sensitivity issues across operating systems. The `.test.ts` suffix is the standard for
`bun:test` (and most JS test runners) — it's auto-discovered by the test runner and provides
instant visual pairing with the source file.

## Before / After

### From this codebase: consistent kebab-case (correct)

**Before:** (current — already follows the rule)
```
src/
  build-prompt.ts          # kebab-case
  build-prompt.test.ts     # matching test suffix
  config-cli.ts            # kebab-case
  config-cli.test.ts       # matching test suffix
  test-helpers.ts          # kebab-case (infrastructure, no matching test)
```

### Synthetic example: mixed naming conventions (anti-pattern)

**Before:**
```
src/
  buildPrompt.ts           # camelCase
  BuildPrompt.test.ts      # PascalCase test
  config_cli.ts            # snake_case
  ConfigCLI.spec.ts        # PascalCase + .spec suffix
```

**After:**
```
src/
  build-prompt.ts
  build-prompt.test.ts
  config-cli.ts
  config-cli.test.ts
```

## Exceptions

- `CLAUDE.md`, `README.md`, `SPEC.md`, `VISION.md` — uppercase by universal convention
- `.claude-mode.json` — config file follows its own naming convention
- Prompt `.md` files follow kebab-case too (already consistent)

## Scope

- Applies to: all `.ts` files in `src/` and `scripts/`
- Does NOT apply to: root-level dotfiles, markdown documentation, config files
