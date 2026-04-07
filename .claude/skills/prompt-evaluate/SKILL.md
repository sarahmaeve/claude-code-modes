---
description: Score existing bases, modifiers, or assembled prompts against Anthropic emotion research and prompt engineering quality criteria. Produces a scorecard covering negative instruction bias, ALL-CAPS inflation, lost-in-the-middle vulnerability, worked examples, priority hierarchy, and redundancy. Use when user says "evaluate prompt", "score this base", "check prompt quality", "prompt review", or invokes /prompt-evaluate.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
---

# Prompt Evaluate

Score prompt content for claude-code-modes against 10 quality criteria grounded in Anthropic's emotion research and prompt engineering best practices.

## Before starting

Read these references:
1. [references/emotion-research.md](references/emotion-research.md) — emotion vector findings
2. [references/prompt-quality.md](references/prompt-quality.md) — 10 quality criteria with thresholds
3. [references/scoring-rubric.md](references/scoring-rubric.md) — measurement methods and commands

## Phase 1: Identify what to evaluate

Determine the target. Options:

**A base directory** — e.g., `prompts/chill/` or a custom base path. Read all fragment files and the manifest.

**A modifier file** — e.g., `prompts/modifiers/debug.md`. Read the single file.

**An assembled prompt** — run `bun run src/build-prompt.ts <preset> [--base <base>] --print` to get the fully assembled output. This is the most comprehensive evaluation since it includes axis fragments and modifiers.

**A file path provided by the user** — read it directly.

If the user doesn't specify, ask what to evaluate.

## Phase 2: Run measurements

For each of the 10 criteria, collect data using the methods in [references/scoring-rubric.md](references/scoring-rubric.md).

### Automated measurements

Run these commands against the target files:

```bash
# 1. Negative instruction count
grep -ciE '\b(don.t|do not|never|avoid|must not|should not|cannot)\b' <files>

# 2. ALL-CAPS emphasis count
grep -cE '\b(IMPORTANT|CRITICAL|MUST|NEVER|DO NOT)\b' <files>

# 4. Worked examples count
grep -c '<example>' <files>

# 5. Priority hierarchy presence
grep -ciE '(when.*conflict|priority|comes first|takes precedence)' <files>

# 7. Character count (token efficiency)
wc -c <files>
```

### Manual assessments

For criteria that require reading and judgment (3, 6, 8, 9, 10), read the content and assess against the rubric thresholds.

## Phase 3: Produce scorecard

Present results as a table. For each criterion, show: rating (Good/Concerning/Poor), measured value, and a specific finding.

Format:

```
## Prompt Quality Scorecard: {target name}

| # | Criterion | Rating | Value | Finding |
|---|-----------|--------|-------|---------|
| 1 | Negative Instruction Bias | Good | 4 per 1000 chars | ... |
| 2 | ALL-CAPS Emphasis | Good | 0 markers | ... |
| ... | ... | ... | ... | ... |

**Overall: {Excellent/Good/Needs work/Poor}**

### Critical findings
{Any criterion rated "Poor" with specific remediation advice}

### Suggestions
{Specific, actionable improvements ranked by impact}
```

### Rating logic
- **Excellent**: 8-10 criteria at Good
- **Good**: 6-7 at Good, none of the 4 critical criteria at Poor
- **Needs work**: 4-5 at Good
- **Poor**: < 4 at Good, or any critical criterion at Poor

Critical criteria (must be Good for overall Good):
1. Negative Instruction Bias
3. Lost-in-the-Middle
8. Emotional Tone
9. Security Boundary Preservation

## Phase 4: Comparison (optional)

If evaluating a custom base or modifier, offer to compare against the standard and chill bases:

```bash
# Generate assembled prompts for comparison
bun run src/build-prompt.ts create --print > /tmp/standard.txt
bun run src/build-prompt.ts create --base chill --print > /tmp/chill.txt
bun run src/build-prompt.ts create --base <custom> --print > /tmp/custom.txt
```

Show a side-by-side comparison table of key metrics across all bases.

## Output

Report results directly in conversation. Do not write files to disk. The scorecard should be immediately actionable — every finding includes a specific suggestion.

If the user wants to fix issues, suggest they use `/prompt-author` to create improved content.
