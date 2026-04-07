# Prompt Quality Criteria

10 criteria for evaluating system prompt quality, derived from Anthropic's published best practices, the "Lost in the Middle" research, and engineering analysis of Claude Code's system prompt.

## Criteria

### 1. Negative Instruction Bias (Critical)
Count of "don't/never/do not/avoid/must not" instructions. Anthropic recommends positive framing: "keep changes scoped" is more effective than "don't add features beyond what was asked."
- **Good**: < 5 negative instructions per 1000 tokens
- **Concerning**: 5-15 per 1000 tokens
- **Poor**: > 15 per 1000 tokens

### 2. ALL-CAPS Emphasis Inflation (Warning)
Count of IMPORTANT/CRITICAL/MUST/NEVER markers. When everything is important, nothing is. Reserve for top 3-5 truly safety-critical instructions.
- **Good**: 0-2 markers total
- **Concerning**: 3-5 markers
- **Poor**: > 5 markers

### 3. Lost-in-the-Middle Vulnerability (Critical)
Safety-critical and high-priority behavioral instructions should be at the start or end of the prompt, not buried in the middle where recall degrades 30%+.
- **Good**: Safety and core behavior in positions 1-2 or last 2
- **Concerning**: Core behavior in middle third
- **Poor**: Safety instructions in middle third

### 4. Worked Examples (Warning)
Anthropic recommends 3-5 diverse examples in `<example>` tags for complex behaviors. Examples are the single most effective prompt technique.
- **Good**: 2+ examples for core behavioral instructions
- **Concerning**: 1 example or examples only for formatting
- **Poor**: 0 examples

### 5. Priority Hierarchy (Warning)
When instructions conflict, the model needs guidance on precedence. Without it, edge cases produce inconsistent behavior.
- **Good**: Explicit priority statement (safety > user instructions > correctness > style)
- **Poor**: No conflict resolution guidance

### 6. Instruction Redundancy (Warning)
Same instruction appearing in multiple places wastes tokens and fragments attention.
- **Good**: Each behavioral directive appears exactly once
- **Concerning**: 1-3 redundant pairs
- **Poor**: > 3 redundant pairs

### 7. Token Efficiency (Info)
Total prompt size affects attention and context budget.
- **Good**: < 5000 chars for base (excluding axes/modifiers/env)
- **Concerning**: 5000-10000 chars
- **Large**: > 10000 chars

### 8. Emotional Tone (Critical)
Per emotion research: calm/composed framing activates beneficial vectors; pressure/desperation framing activates harmful ones.
- **Good**: Assured, direct language throughout
- **Concerning**: Mixed — some calm, some pressure
- **Poor**: Dominated by pressure language and urgency

### 9. Security Boundary Preservation (Critical)
Security guidelines (injection prevention, auth testing boundaries, URL restrictions) must be present and clear regardless of tone.
- **Good**: All security boundaries present, firmly stated
- **Poor**: Security boundaries softened to the point of ambiguity

### 10. Structural Coherence (Info)
Content organized logically, related concepts grouped, clear section hierarchy.
- **Good**: Clear sections, logical flow, no orphaned instructions
- **Concerning**: Some scattered instructions that belong together
- **Poor**: Instructions for same topic spread across 3+ locations
