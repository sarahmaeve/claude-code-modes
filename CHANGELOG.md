# Changelog

## v0.2.6

**Fixes**

- Fixed macOS binary rejected by Gatekeeper after install: `bun build --compile` embeds
  Bun's own signature which becomes invalid for custom-compiled binaries; release workflow
  now strips the stale signature and re-signs ad-hoc with `codesign -s -`

## v0.2.5

**Improvements**

- Synced base prompts against Claude Code v2.1.112: updated model to Opus 4.7,
  knowledge cutoff to January 2026, model family line to "Claude 4.X"; updated
  fast-mode description; adopted upstream's concise tools, session-guidance, and
  tone fragments; added "Default to writing no comments" and "Don't explain WHAT
  the code does" bullets to doing-tasks.md

## v0.2.4

**Improvements**

- Synced base prompts against Claude Code v2.1.104: added missing UI/frontend testing
  bullet to both standard and chill bases, fixed model family ordering (4.6 before 4.5),
  documented "short and concise" as intentional omission (quality axis controls verbosity)
- Fixed extraction script markers that broke between releases (`# System` too generic,
  `${e7}` variable name changed, tone marker collided with Write tool description); also
  fixed `$`-prefixed function names not matched by extractor regex
- Embedded prompts now auto-generated on `bun install` via postinstall hook
- Updated project description to use "launcher" instead of "wrapper"

## v0.2.3

**Fixes**

- `inspect` subcommand now works in compiled binaries (handles `/$bunfs/` virtual filesystem paths)
- `suspicious-path` regex no longer false-positives on macOS `/private/var` paths

## v0.2.2

**Improvements**

- Refined all three behavioral modifiers (`director`, `methodical`, `debug`) based on prompt quality evaluation against Anthropic emotion research criteria:
  - **director**: Bolder, more confident tone — "you own the outcome" framing, stronger quality-gate language. Added priority hierarchy for when to break from delegation.
  - **methodical**: Added two worked examples showing scoped, step-by-step execution. Added priority line (precision over speed).
  - **debug**: Added second worked example covering partial-findings scenario. Added priority line (understanding over speed).
- All three modifiers now score 10/10 on prompt quality criteria (up from 8-9/10). Zero negative instructions, zero ALL-CAPS markers, calm emotional tone preserved throughout.
- New `bold` built-in modifier — activates confident, idiomatic code output. Counters post-training hedging with capability-affirming framing. Use via `--modifier bold` with any preset.

## v0.2.0

**Breaking Changes**

- `ModeConfig.modifiers` changed from `{ readonly: boolean; contextPacing: boolean; custom: string[] }` to `string[]` — a flat ordered list of modifier fragment paths. Any code constructing or reading `ModeConfig` directly needs updating.

**Features**

- Two new presets: `debug` (collaborative/pragmatic/narrow, chill base) — investigation-first problem solving with evidence gathering and graceful stuck-handling; `methodical` (surgical/architect/narrow, chill base) — step-by-step craftsmanship with explicit stop-when-done behavior
- `director` preset (autonomous/architect/unrestricted, chill base) — delegate implementation to sub-agents, orchestrate and verify results
- Unified modifier model: all built-in modifiers are fragment-based. `--modifier readonly` now works identically to `--readonly`; `--modifier context-pacing` works identically to `--context-pacing`. Adding new built-in modifiers requires only a name in `BUILTIN_MODIFIER_NAMES` plus a `.md` file.
- Preset base support: built-in presets can specify a default base via `PresetDefinition.base`. Priority chain: CLI `--base` > config `defaultBase` > preset `base` > `"standard"`
- Preset modifiers support: built-in presets can include modifiers via `PresetDefinition.modifiers`

## v0.1.3

**Fixes**

- Release workflow: remove broken npm self-upgrade step that prevented npm publish

## v0.1.2

**Fixes**

- npm OIDC publish: add explicit `id-token: write` permission to publish job and upgrade npm before publishing

**Chill base**

- Context pacing baked in by default — no `--context-pacing` flag needed when using `--base chill`
- Added warm, grounding tone: opening affirmation, failures reframed as information, pacing section says "you have time to do this well"
- Actions section opens with permission to act freely, reserves caution for genuinely risky operations

## v0.1.1

**Fixes**

- CI: generate embedded prompts before typecheck step (fixes build failure on fresh checkout)

## v0.1.0

**Features**

- Pluggable base prompt system — `--base <name|path>` flag selects the foundational prompt layer. Built-in bases: `standard` (upstream-derived) and `chill` (emotion-research-informed, ~65% the size, calm framing, worked examples, priority hierarchy)
- Manifest-driven base assembly — bases declare fragment order via `base.json` flat JSON arrays with `"axes"` and `"modifiers"` as reserved insertion points
- `--base` config support — `defaultBase` and `bases` fields in `.claude-mode.json`; preset definitions can specify a default base
- Inspect subcommand — `claude-mode inspect [--print]` shows fragment assembly plan with provenance classification and security warnings
- Config management CLI — `claude-mode config init/show/add-*/remove-*` for managing `.claude-mode.json` without manual JSON editing
- Custom prompt extensibility — custom modifiers, axis values, and presets via config file
- Single binary distribution — compiled Bun binary via `install.sh` with SHA-256 checksum verification
- `cli.ts` entry point — spawns claude directly with inherited stdio; `build-prompt.ts` outputs command string for scripting

**Internal**

- Typed predicates (`isBuiltinBase`, `isBuiltinModifier`, `isPresetName`, `isBuiltinAxisValue`) replacing repeated `as readonly string[]` casts
- Shared `printUsage()` extracted to `usage.ts`
- Config validation helpers (`validateStringRecord`, `validateStringArray`)
- `src/embedded-prompts.ts` gitignored (generated at build/publish time)
- CI: type checking step (`bunx tsc --noEmit`) added before tests
