# Worked Example: The Chill Base

The chill base demonstrates emotion-research-informed prompt design. Use it as a reference when authoring new bases.

## Structure

```
prompts/chill/
  base.json       # manifest
  core.md         # consolidated intro+system+tasks+tone+session
  actions.md      # neutral risky-actions guidance
  tools.md        # lean tool routing
  env.md          # environment template
```

Manifest:
```json
["core.md", "axes", "actions.md", "tools.md", "modifiers", "env.md"]
```

## Design Decisions

### Consolidation
Standard base: 8 fragments. Chill base: 4 fragments. core.md combines 5 standard fragments (intro, system, doing-tasks, tone, session-guidance) into one coherent document. This reduces redundancy and fragmentation naturally.

### Positive framing
Standard: "do not propose changes to code you haven't read"
Chill: "Read code before changing it."

Standard: "Be careful not to introduce security vulnerabilities"
Chill: "Write secure code."

### Zero ALL-CAPS
No IMPORTANT, CRITICAL, MUST, or NEVER markers. Instructions are stated with calm confidence.

### Priority hierarchy
Added at the top, after identity: "When guidelines conflict: safety and reversibility come first, then explicit user instructions, then correctness, then style."

### Worked examples
Three `<example>` blocks demonstrating task scoping and safety-check behavior. Short, concrete, showing good vs bad.

### Preserved security boundaries
Security guidelines are present and firm but calmly stated: "Do not assist with destructive techniques..." rather than "IMPORTANT: You must NEVER..."

### Protective caution reframed
Instead of eliminating caution, reframes it as professional judgment: "Actions that warrant consideration" rather than anxiety-driven checklists.

## Metrics

| Metric | Standard | Chill |
|---|---|---|
| Character count | 15,554 | 10,115 |
| Ratio | 100% | 65% |
| Negative instructions | 16 | 4 |
| ALL-CAPS markers | 4 | 0 |
| Worked examples | 0 | 3 |
| Priority hierarchy | No | Yes |
