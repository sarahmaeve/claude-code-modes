# Feature: Base Prompt Design System

## Summary

Make the base prompt layer pluggable so users can choose between different foundational prompt philosophies while preserving composition with the existing axis system (agency/quality/scope). Ship one alternative base — "calm" — informed by Anthropic's [Emotion Concepts research](https://www.anthropic.com/research/emotion-concepts-function), which is shorter, more direct, and framed to activate calm/confident internal states rather than the anxious hedging patterns that post-training reinforces.

## Requirements

### Pluggable Base Architecture

- **A base is a directory of markdown fragments plus a manifest**: The manifest (`base.json`) declares the fragment files and their assembly order. The assembly pipeline reads the manifest instead of hardcoding fragment names.
  - *Acceptance criteria*: A base directory with a valid `base.json` and its declared fragments assembles into a complete prompt when combined with axis fragments and modifiers.

- **Bases compose with the existing axis system**: Every base must produce a prompt that the axis layer (agency/quality/scope) and modifier layer can compose onto. The manifest declares where axis fragments are inserted in the assembly order.
  - *Acceptance criteria*: Running `claude-mode create --base calm` produces a prompt with the calm base fragments + the autonomous/architect/unrestricted axis fragments + any modifiers, in the order the calm manifest specifies.

- **CLI flag `--base <name|path>`**: Selects an alternative base by config-defined name or directory path. When omitted, the built-in "standard" base is used (current behavior, backwards compatible).
  - *Acceptance criteria*: `claude-mode create` (no `--base`) produces identical output to today. `claude-mode create --base calm` uses the calm base. `claude-mode create --base ./my-base/` uses a directory path.

- **Config support for named bases**: The `.claude-mode.json` config gains a `bases` field mapping names to directory paths, plus an optional `defaultBase` field.
  - *Acceptance criteria*: `{ "bases": { "calm": "./prompts/bases/calm" }, "defaultBase": "calm" }` causes all invocations to use the calm base unless overridden. Config-defined names resolve before path heuristics.

- **The built-in "standard" base is the current base**: The existing `prompts/base/` fragments become the "standard" base. No changes to their content or structure. "standard" is a reserved name that always resolves to the built-in fragments.
  - *Acceptance criteria*: The name "standard" is always available and cannot be overridden by config. It resolves to the current embedded/built-in base fragments.

### Base Manifest Format

- **`base.json` declares fragments and axis insertion point**: The manifest specifies an ordered list of fragment files (relative to the base directory) and marks where axis fragments should be inserted in the assembly order.
  - *Acceptance criteria*: A manifest like `{ "fragments": ["intro.md", "core.md", { "axes": true }, "tools.md", "env.md"], "templateVars": ["CWD", "PLATFORM", ...] }` is valid. The `{ "axes": true }` marker tells the assembler where to inject axis fragments. The `templateVars` array declares which `{{VAR}}` placeholders the base uses.

- **Manifest validation at assembly time**: Missing fragments, missing axis insertion point, and undeclared template variables produce clear errors.
  - *Acceptance criteria*: A base with a manifest referencing `intro.md` but no such file in the directory throws an error naming the missing file and base. A manifest without an axis insertion point throws an error explaining it's required.

### The "calm" Alternative Base

- **Shorter than standard**: The calm base should be meaningfully fewer tokens than the standard base — targeting roughly 40-60% of the standard base's size.
  - *Acceptance criteria*: Token count of the calm base (excluding axis/modifier fragments) is measurably smaller than the standard base.

- **Calm, confident framing**: Instructions use assured, direct language. No pressure words ("CRITICAL", "IMPORTANT", "you MUST"), no stacked urgency. Framed to activate calm/composed internal states per the Anthropic emotion research.
  - *Acceptance criteria*: The calm base contains no ALL-CAPS emphasis words. Instructions read as confident guidance rather than anxious warnings.

- **Direct — counteracts post-training brooding**: Encourages Claude to lead with answers rather than caveats. Counters the hedging/qualification tendency that post-training amplifies.
  - *Acceptance criteria*: The tone section explicitly instructs directness and brevity over qualification.

- **Preserves protective caution as judgment**: Doesn't eliminate caution (the emotion research shows nervousness is protective). Reframes caution as thoughtful judgment — "consider the impact" rather than "you MUST check with the user before proceeding."
  - *Acceptance criteria*: Risky-action guidance exists but is framed as professional judgment calls rather than anxiety-driven checklists.

- **Composes with all existing axes and modifiers**: The calm base works with every axis value and modifier, including custom ones.
  - *Acceptance criteria*: All 5 built-in presets work with `--base calm`. The `--readonly`, `--context-pacing`, and `--modifier` flags work with the calm base.

- **Actions variant handling**: The calm base must support the actions-autonomous vs actions-cautious variance, either through its own variants or by declaring how the axis system selects between them.
  - *Acceptance criteria*: `claude-mode create --base calm` (autonomous agency) and `claude-mode safe --base calm` (collaborative agency) produce different action guidance appropriate to each.

### `inspect` Integration

- **`claude-mode inspect` shows the active base**: The inspect subcommand should display which base is active and its manifest.
  - *Acceptance criteria*: `claude-mode create --base calm --print` shows the calm base fragments in the output. Inspect output identifies the base name.

## Scope

**In scope:**
- Manifest-driven base architecture (base.json + fragment directory)
- CLI `--base` flag and config `bases`/`defaultBase` fields
- One alternative built-in base: "calm"
- Refactoring assembly pipeline to read manifests instead of hardcoded fragment lists
- The "standard" base: wrapping current fragments in a manifest without changing content
- Validation and error messages for malformed bases
- Config collision checks (custom base names vs reserved names)

**Out of scope:**
- Registry, package manager, or npm-based distribution for bases (file paths only)
- More than one alternative base (only "calm" ships initially)
- Bases defining their own axes or modifiers (bases compose with the shared axis system)
- Breaking backwards compatibility (no `--base` flag = identical to current behavior)
- Changing the standard base content
- `claude-mode config add-base` / `remove-base` CLI (manual config editing for now; can add later)

## Technical Context

- **Existing code**: `src/assemble.ts` has `getFragmentOrder()` which hardcodes the fragment list — this is the primary code that needs to become manifest-driven. `src/types.ts` defines `ModeConfig` and `AssembleOptions` which need a base field. `src/resolve.ts` resolves axis/modifier values and would also resolve the base. `src/args.ts` parses CLI args and needs `--base`. `src/config.ts` loads/validates config and needs `bases`/`defaultBase` fields.
- **Embedded prompts**: `src/embedded-prompts.ts` (generated) embeds built-in fragments. The standard base's manifest and the calm base's fragments + manifest would need to be embedded too.
- **Dependencies**: No new external dependencies. File I/O for reading base directories (already used for custom axis values and modifiers).
- **Constraints**: Must remain zero-dependency beyond Bun built-ins. The calm base prompt content should be informed by the Anthropic emotion research but is ultimately a prompt engineering exercise — its effectiveness is subjective and should be iterated on.

## Open Questions

- **Manifest format details**: Should the manifest support conditional fragments (like the current actions-autonomous vs actions-cautious split), or should that be handled by having the base declare two fragments and letting the assembler pick based on agency? What's the cleanest way to express "insert axis fragments here" in the manifest?
- **Template variable declaration**: Should bases declare which template vars they use (strict validation), or should the assembler just substitute what it has and ignore missing ones?
- **Calm base fragment structure**: Should the calm base mirror the standard base's fragment breakdown (intro, system, doing-tasks, etc.) or reorganize into fewer, differently-scoped fragments (e.g., combining system+tools into one)?
- **Naming**: Is "calm" the right name for the alternative base? Other candidates: "focused", "clear", "direct", "lean".
