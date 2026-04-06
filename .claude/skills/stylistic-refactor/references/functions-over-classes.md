# Style: Functions Over Classes

> Use top-level functions and plain objects; never introduce classes.

## Motivation

This codebase is a pure data pipeline (parse -> resolve -> assemble). Functions with typed
inputs/outputs are easier to test, compose, and reason about than class instances with hidden
state. Plain objects with TypeScript interfaces provide the same type safety without inheritance
overhead.

## Before / After

### From this codebase: environment detection (src/env.ts)

**Before:** (current — already follows the rule)
```ts
export function detectEnv(): EnvInfo {
  const cwd = process.cwd();
  const isGit = exec("git rev-parse --is-inside-work-tree 2>/dev/null") === "true";
  // ...
  return { cwd, isGit, gitBranch, gitStatus, gitLog, platform, shell, osVersion };
}
```

**After:** N/A — already correct. A class-based version would look like:
```ts
// DO NOT do this
class EnvironmentDetector {
  private cwd: string;
  private isGit: boolean;
  constructor() { this.detect(); }
  private detect() { /* ... */ }
  getInfo(): EnvInfo { return { ... }; }
}
```

### Synthetic example: config validation

**Before:**
```ts
class ConfigValidator {
  private errors: string[] = [];
  validate(config: unknown): UserConfig {
    this.checkModifiers(config);
    this.checkAxes(config);
    if (this.errors.length) throw new Error(this.errors.join(", "));
    return config as UserConfig;
  }
  private checkModifiers(config: unknown) { /* ... */ }
  private checkAxes(config: unknown) { /* ... */ }
}
```

**After:**
```ts
function validateConfig(raw: unknown, configPath: string): UserConfig {
  // Sequential validation blocks — each throws on failure
  if (obj.modifiers !== undefined) { /* validate */ }
  if (obj.axes !== undefined) { /* validate */ }
  return raw as UserConfig;
}
```

## Exceptions

- Third-party APIs that require class instances (e.g., extending a framework base class)
- If Bun or Node APIs introduce a class-based pattern that's idiomatic to extend

## Scope

- Applies to: all `src/` TypeScript files
- Does NOT apply to: type/interface definitions (those are fine), test files using bun:test describe blocks
