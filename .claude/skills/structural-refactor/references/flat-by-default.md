# Rule: Flat by Default

> Keep src/ flat; group into a subdirectory only when 3+ tightly-coupled files share a single concern.

## Motivation

Flat directories are faster to navigate and eliminate decision fatigue about where files belong.
For a CLI tool with 10 implementation files, nesting adds overhead without benefit. The trigger
for grouping is functional coupling, not arbitrary file count — when a concern grows complex
enough to span 3+ files, a subdirectory helps readers understand the boundary.

## Before / After

### From this codebase: current flat layout (correct)

**Before:** (current — already follows the rule)
```
src/
  args.ts
  assemble.ts
  build-prompt.ts
  config.ts
  config-cli.ts
  env.ts
  presets.ts
  resolve.ts
  test-helpers.ts
  types.ts
```

This is correct — no concern spans 3+ files yet. `config.ts` and `config-cli.ts` share a
concern but are only 2 files, so no grouping needed.

### Synthetic example: when grouping becomes warranted

**Before:**
```
src/
  config.ts
  config-cli.ts
  config-validate.ts
  config-migrate.ts
  args.ts
  resolve.ts
  ...
```

**After:**
```
src/
  config/
    load.ts
    cli.ts
    validate.ts
    migrate.ts
  args.ts
  resolve.ts
  ...
```

When config grows to 4 files, group them. The subdirectory signals "this is a cohesive concern."

## Exceptions

- The `prompts/` directory follows its own domain-based organization (see prompt-domain-org rule)
- `.claude/skills/` directories can nest freely — they're documentation, not code
- `scripts/` can hold multiple utility scripts without grouping

## Scope

- Applies to: `src/` directory
- Does NOT apply to: `prompts/`, `.claude/`, `scripts/`, `docs/`
