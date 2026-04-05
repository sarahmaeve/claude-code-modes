import type { AxisConfig, PresetName } from "./types.js";
import { PRESET_NAMES } from "./types.js";

export interface PresetDefinition {
  axes: AxisConfig | null;
  readonly: boolean;
}

const PRESETS: Record<PresetName, PresetDefinition> = {
  "new-project": {
    axes: { agency: "autonomous", quality: "architect", scope: "unrestricted" },
    readonly: false,
  },
  "vibe-extend": {
    axes: { agency: "autonomous", quality: "pragmatic", scope: "adjacent" },
    readonly: false,
  },
  "safe-small": {
    axes: { agency: "collaborative", quality: "minimal", scope: "narrow" },
    readonly: false,
  },
  "refactor": {
    axes: { agency: "autonomous", quality: "pragmatic", scope: "unrestricted" },
    readonly: false,
  },
  "explore": {
    axes: { agency: "collaborative", quality: "architect", scope: "narrow" },
    readonly: true,
  },
  "none": {
    axes: null,
    readonly: false,
  },
};

export function getPreset(name: PresetName): PresetDefinition {
  return PRESETS[name];
}

export function isPresetName(value: string): value is PresetName {
  return (PRESET_NAMES as readonly string[]).includes(value);
}
