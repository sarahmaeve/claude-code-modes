# E2E Test Suite Design: Custom Prompts Workflows

## Project Summary
CLI tool (`claude-mode`) that launches Claude Code with custom system prompts. Entry point is a bash script that calls `bun run src/build-prompt.ts`. Users interact via presets, axis overrides, modifiers, and a `.claude-mode.json` config file.

## Test Environment
- Framework: `bun:test`
- Helpers: `createCliRunner` (bash wrapper), `execSync` (direct bun invocation for config commands)
- Fixtures: temp directories with `.claude-mode.json` and custom `.md` files
- All tests self-contained with beforeAll/afterAll cleanup

## Existing Coverage (224 tests)
- Built-in presets, axis overrides, modifiers: fully covered
- Config CLI CRUD operations: covered
- Custom modifier/axis via file path (simple): 2 tests
- Config-driven workflows through the full pipeline: NOT covered
- Multi-step user journeys: NOT covered

---

## Golden-Path Tests

### Journey: Config-Driven Custom Preset
**Priority:** High

#### Test: create config, define preset with custom modifier, run preset, verify output
- **Setup:** temp dir with `.claude-mode.json` containing modifier + preset definitions, and custom `.md` files
- **Steps:** run `claude-mode <custom-preset> --print` with CWD set to temp dir
- **Assertions:** output contains custom modifier content, correct axis headers, no template variable leaks
- **Teardown:** rm temp dir

### Journey: defaultModifiers Affect Output
**Priority:** High

#### Test: config defaultModifiers includes content in every run
- **Setup:** temp dir with `.claude-mode.json` containing `defaultModifiers: ["my-rules"]` and `modifiers: { "my-rules": "./rules.md" }`, plus the `rules.md` file
- **Steps:** run `claude-mode create --print` with CWD set to temp dir
- **Assertions:** output contains the default modifier content without `--modifier` flag

### Journey: Custom Preset with Custom Axis Value
**Priority:** High

#### Test: preset references custom axis name, resolved content appears in output
- **Setup:** temp dir with config defining axis `quality.team-standard` → `./team-q.md`, preset referencing it, and the `team-q.md` file
- **Steps:** run `claude-mode <preset> --print` with CWD
- **Assertions:** output contains custom quality content, does NOT contain built-in quality header

### Journey: Multiple --modifier Composition
**Priority:** Medium

#### Test: two --modifier flags both appear in output, in order
- **Setup:** two temp `.md` files with unique content
- **Steps:** run `claude-mode create --modifier /path/a.md --modifier /path/b.md --print`
- **Assertions:** output contains content from both, content A appears before content B

### Journey: Config Modifier Name via --modifier Flag
**Priority:** Medium

#### Test: --modifier resolves config-defined name
- **Setup:** temp dir with config defining `modifiers.focus-rules` → `./focus.md`, plus the `focus.md` file
- **Steps:** run `claude-mode create --modifier focus-rules --print` with CWD
- **Assertions:** output contains the custom content from `focus.md`

### Journey: --append-system-prompt Forwarding
**Priority:** Medium

#### Test: --append-system-prompt appears in the claude command output
- **Steps:** run `claude-mode create --append-system-prompt "Use TypeScript only"`
- **Assertions:** command output contains `--append-system-prompt` and `Use TypeScript only`

### Journey: Multi-Step Config Then Run
**Priority:** High

#### Test: build config step by step, then run preset
- **Setup:** temp dir, temp `.md` file
- **Steps:**
  1. `config init` in temp dir
  2. `config add-modifier team-rules /path/to/rules.md`
  3. `config add-default team-rules`
  4. `config add-preset team --agency collaborative --quality architect`
  5. Run `claude-mode team --print` with CWD in temp dir
- **Assertions:** output contains custom modifier content, collaborative agency header, architect quality header

---

## Adversarial / Failure-Mode Tests

### Category: User Mistakes

#### Test: unknown preset name produces helpful error
- **Action:** run `claude-mode typo-preset`
- **Expected:** stderr contains "Unknown preset" and lists available presets
- **Verify:** non-zero exit

#### Test: --modifier with nonexistent file path
- **Action:** run `claude-mode create --modifier /nonexistent/path.md --print`
- **Expected:** stderr contains error about missing fragment
- **Verify:** non-zero exit

#### Test: --quality with nonexistent file path
- **Action:** run `claude-mode create --quality /nonexistent/quality.md --print`
- **Expected:** stderr contains error about missing fragment
- **Verify:** non-zero exit

#### Test: config add-preset with no arguments
- **Action:** run `claude-mode config add-preset`
- **Expected:** stderr contains usage/error
- **Verify:** non-zero exit

### Category: Bad Environment

#### Test: invalid JSON in .claude-mode.json
- **Setup:** temp dir with `{ bad json` in `.claude-mode.json`
- **Action:** run `claude-mode create --print` with CWD
- **Expected:** stderr contains "Invalid config file"
- **Verify:** non-zero exit

#### Test: config referencing nonexistent modifier file
- **Setup:** temp dir with config defaultModifiers referencing a modifier whose file doesn't exist
- **Action:** run `claude-mode create --print` with CWD
- **Expected:** stderr contains error about missing fragment
- **Verify:** non-zero exit

---

## Implementation Notes
- Config-driven tests need `execSync` with `cwd` set to the temp dir (not the bash wrapper `run` helper, since it runs from project root)
- Use `bun run {PROJECT_ROOT}/src/build-prompt.ts` for CWD-dependent tests
- Tests that verify assembled prompt content use `--print` mode
- Tests that verify claude command output use normal mode (no `--print`)
- Temp files must have real content — the assembler reads them

## Priority Order
1. Config-driven custom preset journey (highest value — tests the full new feature)
2. defaultModifiers affecting output (core new behavior)
3. Multi-step config workflow (realistic user journey)
4. Custom preset with custom axis (composite resolution)
5. Unknown preset error (most common user mistake)
6. Invalid config JSON (bad environment)
7. Multiple --modifier composition
8. Config name resolution via --modifier
9. --append-system-prompt forwarding
10. Missing file errors
