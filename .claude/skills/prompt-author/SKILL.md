---
description: Interactively create custom bases, modifiers, or axis values for claude-code-modes. Guides prompt design using Anthropic emotion research findings (calm vectors, avoiding desperation triggers, positive framing). Produces markdown fragments and base.json manifests. Use when user says "create a base", "write a modifier", "new axis value", "custom prompt", or invokes /prompt-author.
user-invocable: true
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion, Bash
---

# Prompt Author

Create custom prompt content for claude-code-modes — bases, modifiers, or axis values — grounded in Anthropic's emotion research.

## Before starting

Read these references:
1. [references/emotion-research.md](references/emotion-research.md) — emotion vector findings and principles
2. [references/prompt-quality.md](references/prompt-quality.md) — 10 quality criteria
3. [references/base-format.md](references/base-format.md) — manifest and fragment specs
4. [references/examples.md](references/examples.md) — chill base as worked example

Read the existing prompts to understand the current patterns:
- `prompts/base/` — standard base fragments
- `prompts/chill/` — chill base fragments (emotion-research-informed)
- `prompts/modifiers/` — existing modifiers
- `prompts/axis/` — existing axis values

## Phase 1: Determine what to create

**AskUserQuestion**: What type of prompt content?
- **Base** — a complete foundational prompt (directory + manifest + fragments)
- **Modifier** — a behavioral layer that composes on top of any base/preset
- **Axis value** — a custom value for agency, quality, or scope

## Phase 2: Interview about desired behavior

Ask the user conversationally (not all at once):

**For a base:**
- What's the philosophy? (e.g., minimal, domain-specific, team-flavored)
- What behaviors matter most?
- What tone? (direct, warm, formal, casual)
- How does it differ from standard and chill?
- What fragments should it have? (consolidate like chill, or granular like standard?)

**For a modifier:**
- What behavior does this shape? (investigation, craftsmanship, caution, speed)
- When would someone use it? (debugging, reviewing, prototyping)
- What should the agent do differently with this modifier active?
- What should it explicitly NOT do?

**For an axis value:**
- Which axis? (agency, quality, scope)
- What behavior does this value represent?
- How does it differ from the existing built-in values?

## Phase 3: Draft the content

Apply these principles from the emotion research (see [references/emotion-research.md](references/emotion-research.md)):

### Writing rules

1. **Positive framing first**. State what to do, not what to avoid. "Keep changes scoped to the request" not "Don't add features beyond what was asked."

2. **Zero ALL-CAPS emphasis**. No IMPORTANT, CRITICAL, MUST, NEVER. State instructions with calm confidence.

3. **Activate calm vectors**. Use assured, direct language. "Consider the impact" not "you MUST check with the user FIRST."

4. **Avoid desperation triggers**. No stacked contradictory requirements. No pressure language. No impossible constraints.

5. **Counter post-training brooding**. Encourage leading with answers. Directness over qualifications.

6. **Preserve protective caution**. Reframe as professional judgment, not anxiety. "Actions that warrant consideration" not "NEVER do this without asking."

7. **Include worked examples**. Use `<example>` tags for complex behaviors. Show good vs bad. 2-3 examples for core instructions.

8. **Add a priority hierarchy** (for bases). One line near the top: "When guidelines conflict: safety first, then user instructions, then correctness, then style."

9. **Security boundaries stay firm**. Calm tone, but no ambiguity on injection prevention, auth testing limits, URL restrictions.

10. **Keep it lean**. Target 40-70% the token count of the standard base. Every instruction should earn its place.

### For bases specifically

- Write a `base.json` manifest (flat JSON array with `"axes"` and `"modifiers"` reserved words)
- Decide fragment structure — consolidate like chill (fewer, bigger fragments) or granular like standard
- Include `env.md` with all template variables (see [references/base-format.md](references/base-format.md))
- Actions fragment should be behaviorally neutral — the agency axis handles the autonomous-vs-cautious split

### For modifiers specifically

- Keep under 200 words. Modifiers are behavioral nudges, not full rewrites.
- Use the same calm, positive framing as base content.
- Start with a heading (`# Modifier Name`).
- Focus on one behavioral dimension — don't try to cover everything.

## Phase 4: Review with user

Present the drafted content and ask for feedback. Highlight:
- Token count compared to standard/chill equivalents
- Number of negative instructions (target: < 5)
- Number of ALL-CAPS markers (target: 0)
- Number of worked examples
- Whether security boundaries are preserved

Iterate until the user approves.

## Phase 5: Write files

**For a base**: Create the directory, write `base.json` and all fragment files.
**For a modifier**: Write the `.md` file to `prompts/modifiers/`.
**For an axis value**: Write the `.md` file to `prompts/axis/{axis}/`.

Remind the user to:
1. Run `bun scripts/generate-prompts.ts` if the content should be embedded (built-in bases/modifiers)
2. Register custom content in `.claude-mode.json` if it's project-specific
3. Test with `claude-mode create --base <name> --print` or `claude-mode create --modifier <name> --print`

## Quality checklist

Before finalizing, verify:
- [ ] Negative instruction count < 5 per 1000 characters
- [ ] Zero ALL-CAPS emphasis markers
- [ ] Security boundaries present and unambiguous
- [ ] At least 2 worked examples (for bases)
- [ ] Priority hierarchy present (for bases)
- [ ] All template variables present in env.md (for bases)
- [ ] Manifest has both `"axes"` and `"modifiers"` entries (for bases)
- [ ] Content is shorter than the standard base equivalent
