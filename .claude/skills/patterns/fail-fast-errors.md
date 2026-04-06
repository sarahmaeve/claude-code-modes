# Pattern: Fail-Fast with Descriptive Errors

Validation happens at the earliest possible point. Errors include the invalid value, what was expected, and enough context to fix it. The CLI entry point is the only place that catches errors and converts them to stderr + exit(1).

## Rationale

Throwing early means errors surface at the right layer with maximum context. Modules don't need to defensively check for bad state — they trust their inputs are valid by the time they're called. The single catch in `build-prompt.ts` means error formatting is consistent.

## Examples

### Example 1: Unknown axis value in resolve.ts
**File**: `src/resolve.ts:32-61`
```typescript
function resolveAxisValue(raw: string, axisName: "agency" | "quality" | "scope",
  builtinValues: readonly string[], loadedConfig: LoadedConfig | null): string {
  if (builtinValues.includes(raw)) return raw;
  const configAxes = loadedConfig?.config.axes?.[axisName];
  if (configAxes && raw in configAxes) {
    return resolveConfigPath(loadedConfig!.configDir, configAxes[raw]);
  }
  if (looksLikeFilePath(raw)) {
    return isAbsolute(raw) ? raw : pathResolve(raw);
  }
  const configHint = loadedConfig
    ? ` Config loaded from: ${loadedConfig.configDir}`
    : " No config file found.";
  throw new Error(
    `Unknown --${axisName} value: "${raw}". ` +
    `Must be one of: ${builtinValues.join(", ")}, ` +
    `a name defined in your config, or a file path.${configHint}`
  );
}
```

### Example 2: Incompatible flag rejection
**File**: `src/args.ts:50-55`
```typescript
if (values["system-prompt"] !== undefined || values["system-prompt-file"] !== undefined) {
  throw new Error(
    "Cannot use --system-prompt or --system-prompt-file with claude-mode. " +
    "claude-mode generates its own system prompt. Use --append-system-prompt to add content."
  );
}
```

### Example 3: Missing prompt fragment
**File**: `src/assemble.ts:124-126`
```typescript
if (content === null) {
  throw new Error(`Missing prompt fragment: ${fragPath}`);
}
```

### Example 4: Unreplaced template variables
**File**: `src/assemble.ts:31-36`
```typescript
const unreplaced = result.match(/\{\{[A-Z_]+\}\}/g);
if (unreplaced) {
  throw new Error(
    `Unreplaced template variables in prompt: ${[...new Set(unreplaced)].join(", ")}`
  );
}
```

### Example 5: Single catch at CLI boundary
**File**: `src/build-prompt.ts:83-88`
```typescript
let parsed;
try {
  parsed = parseCliArgs(argv);
} catch (err) {
  process.stderr.write(`Error: ${(err as Error).message}\n`);
  process.exit(1);
}
// After this point, parsed is guaranteed valid
```

## When to Use

- Any input that comes from outside the module (CLI flags, file paths, fragment contents)
- When an invalid value would cause confusing downstream failures

## When NOT to Use

- Internal state that TypeScript already guarantees (e.g., don't validate return types of your own pure functions)
- Operations where null/undefined is a valid "not present" result (use null returns instead of throws)

## Common Violations

- Silently ignoring invalid values and using a default — hides misconfiguration
- Throwing at the wrong layer (e.g., `resolveConfig` throwing for values that `parseCliArgs` should have caught)
- Generic errors without context: `throw new Error("Invalid value")` — doesn't help the user fix the problem
