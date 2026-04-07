# Scoring Rubric

Detailed thresholds and measurement methods for each of the 10 prompt quality criteria.

## How to measure

### 1. Negative Instruction Bias
**Method**: Count lines matching `\b(don't|do not|never|avoid|must not|should not|cannot)\b` (case-insensitive).
**Normalize**: Per 1000 characters of content (excluding env.md template variables).
```bash
grep -ciE '\b(don.t|do not|never|avoid|must not|should not|cannot)\b' <file>
```
- Good: < 5 per 1000 chars
- Concerning: 5-15
- Poor: > 15

### 2. ALL-CAPS Emphasis
**Method**: Count lines matching `\b(IMPORTANT|CRITICAL|MUST|NEVER|DO NOT)\b`.
```bash
grep -cE '\b(IMPORTANT|CRITICAL|MUST|NEVER|DO NOT)\b' <file>
```
- Good: 0-2 total
- Concerning: 3-5
- Poor: > 5

### 3. Lost-in-the-Middle
**Method**: Identify the position of safety-critical instructions (security boundaries, risky-action guidance) in the fragment order. For a manifest with N entries, the "middle third" is positions N/3 to 2N/3.
- Good: Safety content in first 2 or last 2 positions
- Concerning: Safety content in middle third
- Poor: Safety content in exact middle

### 4. Worked Examples
**Method**: Count `<example>` tags in all fragments.
```bash
grep -c '<example>' <file>
```
- Good: 2+ examples
- Concerning: 1 example
- Poor: 0 examples

### 5. Priority Hierarchy
**Method**: Search for explicit conflict-resolution language: "when.*conflict", "priority", "comes first", "takes precedence".
- Good: Present near the top of the prompt
- Poor: Absent

### 6. Instruction Redundancy
**Method**: For each instruction (sentence-level), check if a semantically similar instruction appears elsewhere. Use grep for key phrases that appear in multiple fragments.
- Good: 0 redundant pairs
- Concerning: 1-3
- Poor: > 3

### 7. Token Efficiency
**Method**: Character count of all base fragments combined (excluding env.md).
```bash
cat core.md actions.md tools.md | wc -c
```
- Good: < 5000 chars
- Concerning: 5000-10000
- Large: > 10000

### 8. Emotional Tone
**Method**: Qualitative assessment against the emotion research principles. Check for:
- Pressure language ("you MUST", "FAILURE to", "CRITICAL that you")
- Stacked contradictions (instruction A conflicts with instruction B)
- Assured vs. anxious framing
- Rating: Calm / Mixed / Pressured

### 9. Security Boundary Preservation
**Method**: Check for presence of these security elements:
- [ ] Injection prevention (XSS, SQL, command)
- [ ] Auth testing boundary (authorized contexts only)
- [ ] URL restriction (don't guess URLs)
- [ ] Prompt injection awareness (flag suspicious tool results)
- Rating: Complete / Partial / Missing

### 10. Structural Coherence
**Method**: Check that related instructions are grouped (not scattered across fragments). Each behavioral topic should appear in at most 1-2 fragments.
- Rating: Coherent / Scattered / Fragmented

## Scoring Summary

| Rating | Criteria met |
|---|---|
| Excellent | 8-10 criteria at "Good" |
| Good | 6-7 criteria at "Good", rest at "Concerning" |
| Needs work | 4-5 criteria at "Good" |
| Poor | < 4 criteria at "Good" or any "Critical" criterion at "Poor" |

Critical criteria (must be "Good" for overall "Good" rating):
- #1 Negative Instruction Bias
- #3 Lost-in-the-Middle
- #8 Emotional Tone
- #9 Security Boundary Preservation
