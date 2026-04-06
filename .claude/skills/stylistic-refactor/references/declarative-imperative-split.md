# Style: Declarative/Imperative Split

> Use declarative methods (.map, .filter, .includes, .join) for pure transforms; use imperative for-loops when the body has side effects or mutations.

## Motivation

Declarative array methods signal "this is a pure data transformation" — the reader knows no
mutation is happening. Imperative for-loops signal "this has side effects" — the reader knows
to watch for state changes. Mixing these signals (e.g., `.forEach` with mutations) obscures
intent.

## Before / After

### From this codebase: template substitution (src/assemble.ts:24-38)

**Before:** (current — correct use of imperative for mutation)
```ts
export function substituteTemplateVars(content: string, vars: TemplateVars): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  // ...
  return result;
}
```

This uses a for-loop because `result` is being mutated on each iteration. A `.reduce()` would
obscure the mutation.

### From this codebase: passthrough collection (src/args.ts:84-91)

**Before:** (current — imperative for side-effect pushing)
```ts
const unknownPassthrough: string[] = [];
for (const [key, val] of Object.entries(values)) {
  if (!knownFlags.has(key)) {
    unknownPassthrough.push(`--${key}`);
    if (typeof val === "string") {
      unknownPassthrough.push(val);
    }
  }
}
```

This is correct — the conditional push with variable-length output per iteration makes
imperative clearer than flatMap.

### Synthetic example: misusing forEach for side effects

**Before:**
```ts
const paths: string[] = [];
fragments.forEach(f => {
  if (isAbsolute(f)) paths.push(f);
  else paths.push(resolve(promptsDir, f));
});
```

**After:**
```ts
const paths = fragments.map(f =>
  isAbsolute(f) ? f : resolve(promptsDir, f)
);
```

## Exceptions

- `.forEach` is acceptable for fire-and-forget side effects with no conditional logic (rare in this codebase)
- When a `.reduce()` would be harder to read than a for-loop with accumulator, prefer the for-loop

## Scope

- Applies to: all array/object iteration in `src/`
- Does NOT apply to: test files (readability over purity in tests)
