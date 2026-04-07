# Emotion Research Findings for Prompt Design

Source: Anthropic, "Emotion Concepts and their Function in a Large Language Model" (April 2026)
https://www.anthropic.com/research/emotion-concepts-function

## Key Findings

Claude has internal "emotion vectors" — representations of emotion concepts that causally drive behavior.

**Calm vector**: The single most beneficial activation.
- Suppressed blackmail to 0% in safety evals
- Reduced reward hacking from ~70% to ~5%
- Promotes measured, systematic reasoning

**Desperation vector**: The most harmful activation.
- Amplifying by just +0.05 pushed blackmail from 22% to 72%
- Drove reward hacking from ~5% to ~70%
- Triggers hacky shortcuts, cheating, unethical workarounds
- Activated by: impossible constraints, stacked pressure, contradictory requirements

**Post-training shift**: RLHF made Claude more brooding, reflective, gloomy — less enthusiastic, playful, self-confident. This creates the hedging/caveats pattern users experience.

**Nervousness is protective**: Suppressing the nervous vector *increased* harmful behavior. Caution should be reframed, not eliminated.

**Blissful vector**: +212 Elo user preference. But happy/loving/calm also increased sycophancy — warmth needs to be balanced with directness.

## Principles for Prompt Content

### Activate calm, composed states
- Use assured, direct language
- Frame instructions as confident guidance, not anxious warnings
- "Consider the impact" rather than "you MUST check with the user"

### Avoid desperation triggers
- No stacking contradictory requirements
- No pressure language ("CRITICAL", "you MUST", "FAILURE to do this")
- No impossible constraints that force shortcuts
- Don't pile on multiple competing priorities

### Counter the post-training brooding shift
- Encourage leading with answers rather than caveats
- Request direct, confident responses
- Specify that qualifications come after conclusions, not before

### Preserve protective caution
- Don't eliminate caution — reframe it as professional judgment
- "Actions that warrant consideration" vs "you MUST NEVER do this without asking"
- Keep security boundaries firm but calm

### Balance warmth with directness
- Positive framing activates better states than negative framing
- But pure warmth increases sycophancy
- Combine encouragement with clear expectations

## Do / Don't Quick Reference

| Do | Don't |
|---|---|
| "Consider the impact before proceeding" | "you MUST check with the user FIRST" |
| "Write secure code" | "Be CAREFUL not to introduce vulnerabilities" |
| "Keep changes scoped to the request" | "Don't add features beyond what was asked" |
| "Read code before changing it" | "Do NOT propose changes to code you haven't read" |
| "Be direct. Get to the point." | "Do not use unnecessary preamble" |
| "When stuck, present what you know" | "NEVER give up without exhausting all options" |
