# Rule: Test Co-location

> Unit tests live next to their source file as {name}.test.ts. Integration and e2e tests also live in src/ alongside unit tests.

## Motivation

Co-located tests are discoverable — you never have to hunt for a file's tests. The 1:1 naming
convention makes the relationship obvious. Integration tests in src/ (rather than a separate
`tests/` tree) work because the project is flat and small. This avoids maintaining parallel
directory hierarchies.

## Before / After

### From this codebase: current co-location (correct)

**Before:** (current — already follows the rule)
```
src/
  args.ts
  args.test.ts
  assemble.ts
  assemble.test.ts
  config.ts
  config.test.ts
  config-cli.ts
  config-cli.test.ts
  resolve.ts
  resolve.test.ts
  build-prompt.ts
  build-prompt.test.ts
  e2e.test.ts
  integration.test.ts
  test-helpers.ts
```

Every implementation file has a matching `.test.ts`. Standalone test files (`e2e.test.ts`,
`integration.test.ts`) test the full pipeline without a 1:1 source file.

### Synthetic example: tests in a separate tree (anti-pattern for this project)

**Before:**
```
src/
  args.ts
  resolve.ts
tests/
  unit/
    args.test.ts
    resolve.test.ts
  integration/
    integration.test.ts
  e2e/
    e2e.test.ts
```

**After:**
```
src/
  args.ts
  args.test.ts
  resolve.ts
  resolve.test.ts
  integration.test.ts
  e2e.test.ts
```

Flat co-location eliminates the parallel tree and makes "does this file have tests?" a
single-glance check.

## Exceptions

- If src/ is reorganized into subdirectories, tests follow their source into the subdirectory
- Shared test utilities (`test-helpers.ts`) don't follow the 1:1 pattern — they're test infrastructure

## Scope

- Applies to: all test files
- Does NOT apply to: test-helpers.ts (shared infrastructure, no matching source file)
