# Patterns Index

- **Parse→Resolve→Assemble Pipeline**: CLI data flows one-way through typed stages — parse raw input, resolve config with defaults, assemble output. Entry point orchestrates, stages are pure. → [pipeline.md](../skills/patterns/pipeline.md)
- **Private Module Helpers**: Internal helpers are unexported functions defined before their sole public caller. Never export a helper used only within one module. → [private-module-helpers.md](../skills/patterns/private-module-helpers.md)
- **`as const` Enum Arrays**: Fixed value sets are `const array as const` + derived type. Use the array for `.includes()` validation, the type for function signatures. → [as-const-enum.md](../skills/patterns/as-const-enum.md)
- **Fail-Fast with Descriptive Errors**: Validate at the earliest layer. Errors include the invalid value and what's expected. One catch at the CLI boundary converts to stderr + exit(1). → [fail-fast-errors.md](../skills/patterns/fail-fast-errors.md)
- **Base Fixture + Spread Override**: Tests define a complete typed base fixture, then spread-override only the relevant field per test case. → [test-fixture-spread.md](../skills/patterns/test-fixture-spread.md)
- **CLI Runner Factory**: Integration/e2e tests use `createCliRunner(command, timeout)` from `test-helpers.ts` to get `{ run, runExpectFail }` helpers bound to a command. → [cli-runner-factory.md](../skills/patterns/cli-runner-factory.md)
