# Pattern: Private Module Helpers

Internal helper functions are defined as unexported functions within the module that uses them. They are never exported, never imported elsewhere, and always positioned before their sole caller.

## Rationale

Keeps module APIs minimal. Consumers see only the public interface; implementation details are hidden. Refactoring a helper can't break other modules since there are no external callers.

## Examples

### Example 1: `exec` helper in env.ts
**File**: `src/env.ts:5-11`
```typescript
// Private — not exported
function exec(command: string): string | null {
  try {
    return execSync(command, { encoding: "utf8", timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

export function detectEnv(): EnvInfo {
  const isGit = exec("git rev-parse --is-inside-work-tree 2>/dev/null") === "true";
  // ...
}
```

### Example 2: `validateAxisValue` helper in args.ts
**File**: `src/args.ts:24-35`
```typescript
// Private — not exported
function validateAxisValue<T extends string>(
  value: unknown,
  validValues: readonly T[],
  flagName: string,
): T {
  if (!(validValues as readonly string[]).includes(value as string)) {
    throw new Error(
      `Invalid --${flagName} value: "${value}". Must be one of: ${validValues.join(", ")}`
    );
  }
  return value as T;
}
```

### Example 3: `shellEscape` and `printUsage` in build-prompt.ts
**File**: `src/build-prompt.ts:8-51`
```typescript
// Both private, each with a single caller in main()
function shellEscape(arg: string): string {
  if (/^[a-zA-Z0-9_.\/\-=]+$/.test(arg)) return arg;
  return "'" + arg.replace(/'/g, "'\\''") + "'";
}

function printUsage(): void {
  process.stdout.write(`Usage: claude-mode ...\n`);
}
```

### Example 4: Fragment helpers in assemble.ts
**File**: `src/assemble.ts:10-82`
```typescript
// Three private helpers, all used only by assemblePrompt()
function readFragment(promptsDir: string, relativePath: string): string | null { ... }
function substituteTemplateVars(content: string, vars: TemplateVars): string { ... }
function getFragmentOrder(mode: ModeConfig): string[] { ... }

export function assemblePrompt(options: AssembleOptions): string {
  const fragmentPaths = getFragmentOrder(mode);     // uses private helper
  // ...
  return substituteTemplateVars(joined, templateVars); // uses private helper
}
```

## When to Use

- Logic that is only needed by one exported function in the module
- Implementation details that would pollute the public API
- Utility functions that would be misleading if exported (e.g., `exec` is too generic a name)

## When NOT to Use

- When two or more modules need the same helper — extract to a shared module instead
- When the helper has independent testability value — consider exporting it

## Common Violations

- Exporting helpers "just in case" — adds surface area without benefit
- Defining the helper in a separate file for a one-module helper — overkill
