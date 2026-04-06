# Style: Concatenation Style

> Use template literals for multi-line strings and complex interpolation. Use + concatenation for simple single-line joins or error messages built across multiple lines of code.

## Motivation

Template literals excel at multi-line strings (usage text, prompts) and complex interpolation
with expressions. But for simple error messages built with string fragments across source lines,
`+` concatenation is often clearer because each fragment is visually distinct and the line
breaks in source don't create unintended whitespace in output.

## Before / After

### From this codebase: + concatenation for error message (src/resolve.ts:56-60)

**Before:** (current — correct)
```ts
throw new Error(
  `Unknown --${axisName} value: "${raw}". ` +
  `Must be one of: ${builtinValues.join(", ")}, ` +
  `a name defined in your config, or a file path.${configHint}`
);
```

This uses backtick strings for interpolation within each fragment, but `+` to join fragments
across source lines. This avoids multi-line template literal whitespace issues.

### From this codebase: template literal for multi-line output (src/build-prompt.ts:20-57)

**Before:** (current — correct)
```ts
const usage = `Usage: claude-mode [preset] [options] [-- claude-args...]

Presets:
  create          autonomous / architect / unrestricted
  extend          autonomous / pragmatic / adjacent
  ...`;
```

Multi-line string with no interpolation — template literal is the right choice.

### Synthetic example: unnecessary template literal for simple join

**Before:**
```ts
throw new Error(
  `"${name}" is a built-in modifier name (${BUILTIN_MODIFIER_NAMES.join(", ")}); choose a different name`
);
```

This is actually fine — it's a single-line template literal with interpolation. The rule
doesn't prohibit single-line template literals; it prohibits multi-line template literals
when the intent is to build a single-line string.

### Synthetic example: multi-line template literal with unintended whitespace

**Before:**
```ts
throw new Error(`Unknown preset: "${name}".
  Built-in presets: ${PRESET_NAMES.join(", ")}.
  Config presets: ${Object.keys(config.presets).join(", ")}.`);
```

**After:**
```ts
throw new Error(
  `Unknown preset: "${name}". ` +
  `Built-in presets: ${PRESET_NAMES.join(", ")}. ` +
  (config.presets
    ? `Config presets: ${Object.keys(config.presets).join(", ")}.`
    : "No config file found.")
);
```

## Exceptions

- Single-line template literals with interpolation are always fine
- Multi-line template literals are correct for actual multi-line output (usage text, prompts, file content)

## Scope

- Applies to: all string construction in `src/`
- Does NOT apply to: prompt markdown files, test assertion strings
